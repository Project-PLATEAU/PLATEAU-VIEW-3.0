import { atom, useAtomValue, useSetAtom } from "jotai";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";

import { useDatasets, useEstatAreasLazy } from "../../../shared/graphql";
import { Dataset, DatasetsQuery } from "../../../shared/graphql/types/catalog";
import { TileFeatureIndex } from "../../../shared/plateau/layers";
import { flyToBBox, inEditor, lookAtTileFeature } from "../../../shared/reearth/utils";
import { areasAtom } from "../../../shared/states/address";
import { rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { settingsAtom } from "../../../shared/states/setting";
import { templatesAtom } from "../../../shared/states/template";
import { createRootLayerForDatasetAtom } from "../../../shared/view-layers";
import { LayerModel, addLayerAtom, useFindLayer } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import { type SearchOption } from "../../ui-components";
import { BUILDING_LAYER } from "../../view-layers";
import { datasetTypeLayers } from "../constants/datasetTypeLayers";
import { PlateauDatasetType } from "../constants/plateau";
import { highlightAreaAtom } from "../containers/HighlightedAreas";
// import { datasetTypeLayers } from "../constants/datasetTypeLayers";
// import { areasAtom } from "../states/address";

export interface DatasetSearchOption extends SearchOption {
  type: "dataset";
  dataset: DatasetsQuery["datasets"][number];
}

export interface BuildingSearchOption extends SearchOption /* , earchableFeatureRecord */ {
  datasetId: string;
  type: "building";
  featureIndex: TileFeatureIndex;
  lat?: number;
  long?: number;
}

export interface AreaSearchOption extends SearchOption {
  type: "area";
  bbox: [number, number, number, number];
}

export interface SearchOptionsParams {
  inputValue?: string;
  skip?: boolean;
}

// TODO(reearth): Search entire data
function useDatasetSearchOptions({
  inputValue,
  skip = false,
}: SearchOptionsParams = {}): readonly DatasetSearchOption[] {
  const areas = useAtomValue(areasAtom);
  const municipalityCodes = useMemo(
    () => areas?.filter(area => area.type === "municipality").map(area => area.code) ?? [],
    [areas],
  );
  const tokens = useMemo(() => inputValue?.split(/\s+/).filter(Boolean), [inputValue]);
  const query = useDatasets(
    tokens?.length
      ? {
          searchTokens: tokens,
        }
      : municipalityCodes.length > 0
      ? {
          areaCodes: municipalityCodes,
        }
      : {},
    { skip: skip || (!inputValue && !municipalityCodes.length) },
  );

  const layers = useAtomValue(rootLayersLayersAtom);
  const findLayer = useFindLayer();

  return useMemo(() => {
    if (skip) {
      return [];
    }
    return (
      query.data?.datasets
        ?.filter(dataset => {
          const layerType =
            datasetTypeLayers[dataset.type.code as PlateauDatasetType] ?? datasetTypeLayers.usecase;
          return (
            !layerType ||
            findLayer(layers, {
              id: dataset.id,
            }) == null
          );
        })
        .map(dataset => {
          const name = (inEditor() && dataset.year ? `[${dataset.year}] ` : "") + dataset.name;
          const locations = [];

          if (dataset.prefecture?.name) {
            locations.push(dataset.prefecture.name);
          }
          if (dataset.city?.name) {
            locations.push(dataset.city.name);
          }
          if (dataset.ward?.name) {
            locations.push(dataset.ward.name);
          }

          const nameWithLocation = `${name}${
            locations.length > 0 ? ` [${locations.join(".")}]` : ""
          }`;

          return {
            type: "dataset" as const,
            name: nameWithLocation,
            displayName: {
              primary: name,
              secondary: locations.length > 0 ? `${locations.join(" ")}` : "",
            },
            index: nameWithLocation,
            dataset,
          };
        }) ?? []
    );
  }, [skip, query, layers, findLayer]);
}

function useBuildingSearchOption({
  inputValue,
  skip = false,
}: SearchOptionsParams = {}): readonly BuildingSearchOption[] {
  const layers = useAtomValue(rootLayersLayersAtom);
  const featureIndices = useAtomValue(
    useMemo(
      () =>
        atom(get =>
          layers
            .filter(
              (layer): layer is LayerModel<typeof BUILDING_LAYER> => layer.type === BUILDING_LAYER,
            )
            .map(layer => [layer.id, get(layer.featureIndexAtom)] as const)
            .filter((v): v is [string, TileFeatureIndex] => !!v[1]),
        ),
      [layers],
    ),
  );
  const [featureIndicesKey, setFeatureIndicesKey] = useState(0);
  useEffect(() => {
    setFeatureIndicesKey(value => value + 1);
  }, [featureIndices, inputValue]);

  return useMemo(
    () => {
      if (skip) {
        return [];
      }
      return featureIndices.flatMap(([id, featureIndex]) => {
        const fs =
          window.reearth?.layers?.findFeaturesByIds?.(
            featureIndex.layerId,
            featureIndex.featureIds,
          ) ?? [];
        const addedIds: string[] = [];
        return fs.reduce<BuildingSearchOption[]>((res, f) => {
          if (
            (f?.properties?.["名称"] || f?.properties?.["gml:name"]) &&
            !addedIds.includes(f.id)
          ) {
            res.push({
              type: "building" as const,
              name: f?.properties?.["名称"] ?? f?.properties?.["gml:name"],
              featureIndex,
              id: f?.id,
              datasetId: id,
            });
            addedIds.push(f.id);
          }
          return res;
        }, []);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [skip, featureIndices, featureIndicesKey],
  );
}

function useAreaSearchOptions({
  inputValue,
  skip = false,
}: SearchOptionsParams = {}): readonly AreaSearchOption[] {
  const [fetch, query] = useEstatAreasLazy();
  const debouncedFetch = useMemo(
    () => debounce(async (...args: Parameters<typeof fetch>) => await fetch(...args), 200),
    [fetch],
  );

  const [areas, setAreas] = useState(query.data?.estatAreas);
  useEffect(() => {
    if (!query.loading) {
      setAreas(query.data?.estatAreas);
    }
  }, [query]);

  const currentAreas = useAtomValue(areasAtom);
  useEffect(() => {
    if (skip) {
      return;
    }
    let searchTokens = inputValue?.split(/\s+/).filter(value => value.length > 0) ?? [];
    if (searchTokens.length === 0 && currentAreas != null && currentAreas.length > 0) {
      searchTokens = currentAreas
        // Tokyo 23 wards is the only area which is not a municipality.
        .filter(area => area.name !== "東京都23区")
        .map(area => area.name);
    }
    if (searchTokens.length > 0) {
      debouncedFetch({
        variables: {
          searchTokens,
        },
      })?.catch(error => {
        console.error(error);
      });
    } else {
      setAreas([]);
    }
  }, [inputValue, skip, debouncedFetch, currentAreas]);

  return useMemo(() => {
    if (skip) {
      return [];
    }
    return (
      areas?.map(area => ({
        type: "area" as const,
        id: area.id,
        name: area.address,
        bbox: area.bbox as [number, number, number, number],
      })) ?? []
    );
  }, [skip, areas]);
}

export interface SearchOptions {
  datasets: readonly DatasetSearchOption[];
  buildings: readonly BuildingSearchOption[];
  areas: readonly AreaSearchOption[];
  select: (option: SearchOption) => void;
}

export function useSearchOptions(options?: SearchOptionsParams): SearchOptions {
  const datasets = useDatasetSearchOptions(options);
  const buildings = useBuildingSearchOption(options);
  const areas = useAreaSearchOptions(options);
  const settings = useAtomValue(settingsAtom);
  const templates = useAtomValue(templatesAtom);

  const addLayer = useSetAtom(addLayerAtom);
  const setScreenSpaceSelection = useSetAtom(screenSpaceSelectionAtom);
  const highlightArea = useSetAtom(highlightAreaAtom);

  const select = useCallback(
    (option: SearchOption) => {
      switch (option.type) {
        case "dataset": {
          const datasetOption = option as DatasetSearchOption;
          const dataset = datasetOption.dataset as Dataset;
          const type =
            datasetTypeLayers[dataset.type.code as PlateauDatasetType] ?? datasetTypeLayers.usecase;
          const municipalityCode = datasetOption.dataset.wardCode;
          if (type == null) {
            return;
          }
          const filteredSettings = settings.filter(s => s.datasetId === dataset.id);
          if (type === BUILDING_LAYER) {
            addLayer(
              createRootLayerForDatasetAtom({
                dataset,
                settings: filteredSettings,
                templates,
                areaCode: municipalityCode,
                currentDataId: datasetOption.dataset.items[0].id,
              }),
            );
          } else {
            addLayer(
              createRootLayerForDatasetAtom({
                dataset,
                settings: filteredSettings,
                templates,
                areaCode: municipalityCode,
                currentDataId: datasetOption.dataset.items[0].id,
              }),
            );
          }
          break;
        }
        case "building": {
          const buildingOption = option as BuildingSearchOption;
          invariant(buildingOption.id);

          const layerId = buildingOption.featureIndex.layerId;
          const featureId = buildingOption.id;
          const feature = window.reearth?.layers?.findFeatureById?.(layerId, featureId);
          if (!feature) return;
          lookAtTileFeature(feature.properties);

          setScreenSpaceSelection([
            {
              type: "TILESET_FEATURE",
              value: {
                layerId: layerId,
                featureIndex: buildingOption.featureIndex,
                key: featureId,
                datasetId: buildingOption.datasetId,
              },
            },
          ]);
          break;
        }
        case "area": {
          const areaOption = option as AreaSearchOption;
          if (!areaOption.id) return;
          void flyToBBox(areaOption.bbox);
          highlightArea({
            areaId: areaOption.id,
          });
          break;
        }
      }
    },
    [setScreenSpaceSelection, addLayer, settings, templates, highlightArea],
  );

  return {
    datasets,
    buildings,
    areas,
    select,
  };
}
