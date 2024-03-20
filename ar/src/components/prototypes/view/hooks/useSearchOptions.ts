import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";

import { useDatasets } from "../../../shared/graphql";
import { Dataset, DatasetsQuery } from "../../../shared/graphql/types/catalog";
import { TileFeatureIndex } from "../../../shared/plateau/layers";
import { areasAtom } from "../../../shared/states/address";
import { rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { settingsAtom } from "../../../shared/states/setting";
import { templatesAtom } from "../../../shared/states/template";
import { createRootLayerAtom } from "../../../shared/view-layers";
import { LayerModel, addLayerAtom, useFindLayer } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import { type SearchOption } from "../../ui-components";
import { BUILDING_LAYER } from "../../view-layers";
import { datasetTypeLayers } from "../constants/datasetTypeLayers";
import { PlateauDatasetType } from "../constants/plateau";

export interface DatasetSearchOption extends SearchOption {
  type: "dataset";
  dataset: DatasetsQuery["datasets"][number];
}

export interface BuildingSearchOption
  extends SearchOption /* , earchableFeatureRecord */ {
  datasetId: string;
  type: "building";
  featureIndex: TileFeatureIndex;
  lat?: number;
  long?: number;
}

export interface AddressSearchOption extends SearchOption {
  type: "address";
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
    () =>
      areas
        ?.filter((address) => address.type === "municipality")
        .map((address) => address.code) ?? [],
    [areas]
  );
  const tokens = useMemo(() => inputValue?.split(/ |\u3000/), [inputValue]);
  const query = useDatasets(
    tokens
      ? {
          searchTokens: tokens,
        }
      : municipalityCodes.length > 0
        ? {
            areaCodes: municipalityCodes,
          }
        : {},
    { skip: skip || (!inputValue && !municipalityCodes.length) }
  );

  const layers = useAtomValue(rootLayersLayersAtom);
  const findLayer = useFindLayer();

  return useMemo(() => {
    if (skip) {
      return [];
    }
    return (
      query.data?.datasets
        .filter((dataset) => {
          const layerType =
            datasetTypeLayers[dataset.type.code as PlateauDatasetType];
          return (
            !layerType ||
            findLayer(layers, {
              id: dataset.id,
            }) == null
          );
        })
        .map((dataset) => ({
          type: "dataset" as const,
          name: dataset.name,
          index: `${dataset.name}${dataset.prefecture?.name ?? ""}${dataset.city?.name ?? ""}${
            dataset.ward?.name ?? ""
          }`,
          dataset,
        })) ?? []
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
        atom((get) =>
          layers
            .filter(
              (layer): layer is LayerModel<typeof BUILDING_LAYER> =>
                layer.type === BUILDING_LAYER
            )
            .map((layer) => [layer.id, get(layer.featureIndexAtom)] as const)
            .filter((v): v is [string, TileFeatureIndex] => !!v[1])
        ),
      [layers]
    )
  );
  const [featureIndicesKey, setFeatureIndicesKey] = useState(0);
  useEffect(() => {
    setFeatureIndicesKey((value) => value + 1);
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
            featureIndex.featureIds
          ) ?? [];
        const addedIds: string[] = [];
        return fs.reduce<BuildingSearchOption[]>((res, f) => {
          if (f?.properties?.["名称"] && !addedIds.includes(f.id)) {
            res.push({
              type: "building" as const,
              name: f?.properties?.["名称"],
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
    [skip, featureIndices, featureIndicesKey]
  );
}

export interface SearchOptions {
  datasets: readonly DatasetSearchOption[];
  buildings: readonly BuildingSearchOption[];
  addresses: readonly AddressSearchOption[];
  select: (option: SearchOption) => void;
}

export function useSearchOptions(options?: SearchOptionsParams): SearchOptions {
  const datasets = useDatasetSearchOptions(options);
  const buildings = useBuildingSearchOption(options);
  const settings = useAtomValue(settingsAtom);
  const templates = useAtomValue(templatesAtom);

  const addLayer = useSetAtom(addLayerAtom);
  const setScreenSpaceSelection = useSetAtom(screenSpaceSelectionAtom);
  const select = useCallback(
    (option: SearchOption) => {
      switch (option.type) {
        case "dataset": {
          const datasetOption = option as DatasetSearchOption;
          const dataset = datasetOption.dataset as Dataset;
          const type =
            datasetTypeLayers[dataset.type.code as PlateauDatasetType];
          const municipalityCode = datasetOption.dataset.wardCode;
          if (type == null) {
            return;
          }
          const filteredSettings = settings.filter(
            (s) => s.datasetId === dataset.id
          );
          if (type === BUILDING_LAYER) {
            addLayer(
              createRootLayerAtom({
                dataset,
                settings: filteredSettings,
                templates,
                areaCode: municipalityCode,
                currentDataId: datasetOption.dataset.items[0].id,
              })
            );
          } else {
            addLayer(
              createRootLayerAtom({
                dataset,
                settings: filteredSettings,
                templates,
                areaCode: municipalityCode,
                currentDataId: datasetOption.dataset.items[0].id,
              })
            );
          }
          break;
        }
        case "building": {
          const buildingOption = option as BuildingSearchOption;
          invariant(buildingOption.id);
          // TODO: Implement flyTo by `_x` and `_y` properties which are embeded in feature.
          setScreenSpaceSelection([
            {
              type: "TILESET_FEATURE",
              value: {
                layerId: buildingOption.featureIndex.layerId,
                featureIndex: buildingOption.featureIndex,
                key: buildingOption.id,
                datasetId: buildingOption.datasetId,
              },
            },
          ]);
          break;
        }
      }
    },
    [setScreenSpaceSelection, addLayer, settings, templates]
  );

  return {
    datasets,
    buildings,
    addresses: [],
    select,
  };
}
