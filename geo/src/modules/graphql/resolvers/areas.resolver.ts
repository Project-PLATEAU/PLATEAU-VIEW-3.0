/* eslint-disable node/no-unsupported-features/es-syntax */
import { Args, Query, Resolver } from "@nestjs/graphql";
import axios, { CanceledError } from "axios";

import { Areas, Area } from "../dto/areas";

interface AreaCodes {
  prefectures: Record<string, string>;
  municipalities: Record<string, string | [string, string] | [string, string[]]>;
}

type AreaRadii = Record<string, number>;

let areaCodesPromise: Promise<AreaCodes>;
let areaRadiiPromise: Promise<AreaRadii>;

async function getAreas(code: string, includeRadii = false): Promise<Area[] | undefined> {
  const [areaCodes, areaRadii] = await Promise.all([
    areaCodesPromise ??
      (areaCodesPromise = import("../assets/areaCodes.json") as unknown as Promise<AreaCodes>),
    includeRadii
      ? areaRadiiPromise ??
        (areaRadiiPromise = import("../assets/areaRadii.json") as unknown as Promise<AreaRadii>)
      : undefined,
  ]);

  const prefectureCode = code.slice(0, 2);
  const prefectureName = areaCodes.prefectures[prefectureCode];
  const municipality = areaCodes.municipalities[code];
  if (prefectureName == null || municipality == null) {
    return;
  }
  const areas: Area[] = [
    {
      type: "municipality",
      code,
      name: typeof municipality === "string" ? municipality : municipality[0],
      radius: areaRadii?.[code] ?? 0,
    },
  ];
  if (typeof municipality !== "string" && typeof municipality[1] === "string") {
    const parent = areaCodes.municipalities[municipality[1]];
    if (parent != null) {
      areas.push({
        type: "municipality",
        code: municipality[1],
        name: parent[0],
        radius: areaRadii?.[municipality[1]] ?? 0,
      });
    }
  }
  areas.push({
    type: "prefecture",
    code: prefectureCode,
    name: prefectureName,
    radius: areaRadii?.[prefectureCode] ?? 0,
  });
  return areas;
}

@Resolver(() => Areas)
export class AreasResolver {
  @Query(() => Areas, { nullable: true })
  async areas(
    @Args("longitude") longitude: number,
    @Args("latitude") latitude: number,
    @Args("includeRadii", { defaultValue: false }) includeRadii: boolean,
  ): Promise<Areas> {
    try {
      const { data } = await axios.get(
        "https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress",
        {
          params: {
            lon: longitude,
            lat: latitude,
          },
        },
      );
      const municipalityCode = data.results?.muniCd;
      const name = data.results?.lv01Nm;
      if (typeof municipalityCode !== "string" || typeof name !== "string") {
        return undefined;
      }
      const areas = await getAreas(municipalityCode, includeRadii);
      if (areas == null) {
        return undefined;
      }
      return {
        areas,
        // Empty value is denoted by "－".
        address: name !== "－" ? name.replace("　", " ") : undefined,
      };
    } catch (error) {
      if (error instanceof CanceledError) {
        return undefined;
      }
      throw error;
    }
  }
}
