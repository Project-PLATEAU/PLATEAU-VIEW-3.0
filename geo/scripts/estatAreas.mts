import { existsSync } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import { Firestore, type CollectionReference } from "@google-cloud/firestore";
import * as turf from "@turf/turf";
import { geohashForLocation } from "geofire-common";
import { type FeatureCollection, type Feature, type Polygon } from "geojson";
import { groupBy, mapValues } from "lodash-es";
import mapshaper from "mapshaper";
import moji from "moji";
import { read as readShapefile } from "shapefile";
import invariant from "tiny-invariant";
import { feature } from "topojson-client";
import type TopoJSON from "topojson-specification";

import { packGeometry } from "./packGeometry.mjs";
import { parseAreasCSV } from "./parse-areas-csv.mjs";
import { isNotNullish } from "./utils.mjs";

const { applyCommands } = mapshaper;

type Topology = TopoJSON.Topology<{
  root: {
    type: "GeometryCollection";
    geometries: Array<TopoJSON.Polygon<any> | TopoJSON.MultiPolygon<any>>;
  };
}>;

function cleanseName(text: string): string {
  return moji(text)
    .convert("ZE", "HE")
    .convert("ZS", "HS")
    .convert("HK", "ZK")
    .toString()
    .replaceAll("，", "、");
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const __dirname = dirname(fileURLToPath(import.meta.url));

// Preprocess geometries and properties.
async function processGeoJSON(collection: FeatureCollection): Promise<FeatureCollection> {
  return {
    ...collection,
    features: collection.features
      .map(feature => {
        if (feature.properties == null) {
          return undefined;
        }
        const input = feature.properties;
        if (
          typeof input.KEY_CODE !== "string" ||
          typeof input.PREF !== "string" ||
          typeof input.CITY !== "string" ||
          typeof input.PREF_NAME !== "string" ||
          typeof input.CITY_NAME !== "string" ||
          typeof input.S_NAME !== "string" ||
          // Filter garbages out.
          input.S_NAME === "\u2010" ||
          input.S_NAME.startsWith("（")
        ) {
          return undefined;
        }
        invariant(feature.geometry.type === "Polygon");
        return {
          ...feature,
          properties: mapValues(feature.properties, value =>
            typeof value === "string" ? cleanseName(value) : value,
          ),
        };
      })
      .filter(isNotNullish),
  };
}

const convertProperties = (feature: Feature, params: { CSS_NAME: string }) => {
  const CITY_NAME = feature.properties.CITY_NAME as string;
  const GST_NAME = CITY_NAME.endsWith(params.CSS_NAME)
    ? CITY_NAME.slice(0, -params.CSS_NAME.length)
    : CITY_NAME;
  return {
    ...feature.properties,
    GST_NAME,
    CSS_NAME: GST_NAME === CITY_NAME ? undefined : params.CSS_NAME,
  } as Feature["properties"];
};

// Convert GeoJSON to TopoJSON, simplifying and merging geometries. Mapshaper is
// the best option to do so as far as I know.
async function convertToTopoJSON(params: {
  collection: FeatureCollection;
  interval?: number;
}): Promise<Topology> {
  const result = await applyCommands(
    [
      "-i input.geojson name=root encoding=utf-8 snap",
      // Apply visvalingam simplification of the specified interval in meters.
      `-simplify interval=${params.interval ?? 10}`,
      // Remove useless geometries.
      "-clean",
      `-o "output.topojson" format=topojson`,
    ].join(" "),
    {
      "input.geojson": params.collection,
    },
  );
  return JSON.parse(result["output.topojson"]);
}

async function uploadFeatures(params: {
  topology: Topology;
  collection: CollectionReference<any>;
  CSS_NAME: string;
}): Promise<void> {
  const features = feature(params.topology, params.topology.objects.root).features;
  // Bundle same name as one feature.
  const featureGroups = groupBy(features, f => {
    const props = convertProperties(f, { CSS_NAME: params.CSS_NAME });
    const addressComponents = [
      props.PREF_NAME,
      props.GST_NAME,
      props.CSS_NAME,
      props.S_NAME,
    ].filter(isNotNullish);
    return addressComponents.join("");
  });

  const writer = params.collection.firestore.bulkWriter();
  for (const [_name, features] of Object.entries(featureGroups)) {
    if (!features.length) continue;
    const firstGeometry = features[0].geometry;
    const feature =
      features.length === 1
        ? features[0]
        : ({
            ...features[0],
            properties: {
              ...features[0].properties,
              SETAI: features.reduce((res, f) => res + Number(f.properties.SETAI ?? 0), 0),
            },
            geometry: features.slice(1).reduce((res, f) => {
              const geometry = f.geometry;
              try {
                const u = turf.union(
                  res,
                  geometry.type === "Polygon"
                    ? turf.polygon(geometry.coordinates)
                    : geometry.type === "MultiPolygon"
                    ? turf.multiPolygon(geometry.coordinates)
                    : undefined,
                );
                return u ? (u.geometry as Polygon) : res;
              } catch (e) {
                console.warn(e, JSON.stringify(f.properties, null, 2));
                return res;
              }
            }, (firstGeometry.type === "Polygon" ? turf.polygon(firstGeometry.coordinates) : firstGeometry.type === "MultiPolygon" ? turf.multiPolygon(firstGeometry.coordinates) : undefined)?.geometry),
          } as Feature);
    const props = convertProperties(feature, { CSS_NAME: params.CSS_NAME });
    invariant(props.S_NAME != null);
    invariant(feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon");
    const {
      geometry: { coordinates },
    } = turf.center(feature.geometry);
    const id = props.KEY_CODE;
    const longitude = coordinates[0];
    const latitude = coordinates[1];
    const addressComponents = [
      props.PREF_NAME,
      props.GST_NAME,
      props.CSS_NAME,
      props.S_NAME,
    ].filter(isNotNullish);
    invariant(addressComponents.length === 3 || addressComponents.length === 4);
    const doc = params.collection.doc(id);
    void writer
      .set(doc, {
        // Notice the order is [latitude, longitude].
        geohash: geohashForLocation([latitude, longitude]),
        longitude,
        latitude,
        ...(addressComponents.length === 3
          ? {
              shortAddress: `${props.GST_NAME ?? props.CSS_NAME}${props.S_NAME}`,
            }
          : {
              shortAddress: `${props.CSS_NAME}${props.S_NAME}`,
              middleAddress: `${props.GST_NAME}${props.CSS_NAME}${props.S_NAME}`,
            }),
        fullAddress: addressComponents.join(""),
        addressComponents,
        properties: props,
        geometry: packGeometry(feature.geometry),
        bbox: turf.bbox(feature),
      })
      .catch(error => {
        if (
          !(error instanceof Error) ||
          // Ignore documents of the same KEY_CODE with different KIGO_E.
          !error.message.startsWith("Document already exists")
        ) {
          throw error;
        }
      });
  }
  await writer.close();
}

async function main(): Promise<void> {
  if (process.env.GOOGLE_CLOUD_PROJECT == null || process.env.GOOGLE_CLOUD_PROJECT === "") {
    throw new Error("Missing environment variable: GOOGLE_CLOUD_PROJECT");
  }
  // const areaCodes = [{ code: "01202", CSS_NAME: "函館市" }] ?? (await parseAreasCSV());
  const areaCodes = await parseAreasCSV();
  for (const { code: areaCode, CSS_NAME } of areaCodes) {
    const source = path.resolve(__dirname, `../data/estatAreas/${areaCode}/r2kb${areaCode}`);
    if (!existsSync(`${source}.shp`)) continue;
    const input = await readShapefile(`${source}.shp`, `${source}.dbf`, {
      encoding: "sjis",
    });
    const geojson = await processGeoJSON(input);
    const topojson = await convertToTopoJSON({ collection: geojson });
    const firestore = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
    const collection = firestore.collection("api/estat/areas") as CollectionReference<any>;
    await uploadFeatures({
      topology: topojson,
      collection,
      CSS_NAME,
    });
    console.log(`Uploaded ${areaCode}`);
  }
  console.log("Done");
}

main();
