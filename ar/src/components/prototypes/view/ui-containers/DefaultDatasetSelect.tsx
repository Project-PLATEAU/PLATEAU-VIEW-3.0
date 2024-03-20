import { Typography, type SelectChangeEvent } from "@mui/material";
import { atom, useAtom, useAtomValue, useSetAtom, WritableAtom, type Getter, type SetStateAction } from "jotai";
import { differenceBy } from "lodash";
import { memo, useCallback, useMemo, type FC } from "react";
import invariant from "tiny-invariant";

import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { rootLayersAtom, rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { settingsAtom } from "../../../shared/states/setting";
import { templatesAtom } from "../../../shared/states/template";
import { RootLayerConfig, createRootLayerAtom } from "../../../shared/view-layers";
import { removeLayerAtom, useAddLayer, useFilterLayers } from "../../layers";
import { isNotNullish } from "../../type-helpers";
import { ContextSelect, SelectGroupItem, SelectItem } from "../../ui-components";
import { datasetTypeLayers } from "../constants/datasetTypeLayers";
import { datasetTypeNames } from "../constants/datasetTypeNames";
import { PlateauDatasetType } from "../constants/plateau";
import { showDataFormatsAtom } from "../states/app";

interface Params {
  datasetId: string;
  datumId: string;
}

function createParamsArray(get: Getter, layers: readonly RootLayerConfig[]): Params[] {
  return layers
    .map(({ id, currentDataIdAtom }) => {
      const datumId = get(currentDataIdAtom);
      return datumId != null ? { datasetId: id, datumId } : undefined;
    })
    .filter(isNotNullish);
}

function serializeParams({ datasetId, datumId }: Params): string {
  return JSON.stringify([datasetId, datumId]);
}

function parseParams(value: string): Params {
  const [datasetId, datumId] = JSON.parse(value);
  return { datasetId, datumId };
}

export interface DefaultDatasetSelectProps {
  datasets: DatasetFragmentFragment[];
  municipalityCode: string;
  disabled?: boolean;
}

export const DefaultDatasetSelect: FC<DefaultDatasetSelectProps> = memo(
  ({ datasets, municipalityCode, disabled }) => {
    invariant(datasets.length > 0);
    const rootLayers = useAtomValue(rootLayersAtom);
    const layers = useAtomValue(rootLayersLayersAtom);
    const settings = useAtomValue(settingsAtom);
    const templates = useAtomValue(templatesAtom);
    // Assume that all the datasets share the same type.
    const layerType = datasetTypeLayers[datasets[0].type.code as PlateauDatasetType];
    invariant(layerType !== "BUILDING_LAYER", "Building layer is not supported.");
    const filterLayers = useFilterLayers();
    const filteredLayers = useMemo(
      () =>
        layerType != null
          ? filterLayers(layers, {
              type: layerType,
            })
          : [],
      [layers, layerType, filterLayers],
    );
    const filteredRootLayers = useMemo(
      () =>
        rootLayers.filter(l =>
          filteredLayers.find(f => l.id === f.id && l.areaCode === municipalityCode),
        ),
      [rootLayers, filteredLayers, municipalityCode],
    );

    const addLayer = useAddLayer();
    const removeLayer = useSetAtom(removeLayerAtom);
    const paramsAtom = useMemo<WritableAtom<any, [_params: SetStateAction<Params[]>], void>>(() => {
      if (!layerType) {
        return atom(null, (_get, _set, _params: SetStateAction<Params[]>) => {});
      }

      return atom(
        get => createParamsArray(get, filteredRootLayers),
        (get, set, dataIds: SetStateAction<Params[]>) => {
          const prevParams = createParamsArray(get, filteredRootLayers);
          const nextParams = typeof dataIds === "function" ? dataIds(prevParams) : dataIds;

          const paramsToRemove = differenceBy(prevParams, nextParams, ({ datasetId }) => datasetId);
          const paramsToAdd = differenceBy(nextParams, prevParams, ({ datasetId }) => datasetId);
          const paramsToUpdate = nextParams.filter(({ datasetId, datumId }) =>
            prevParams.some(params => params.datasetId === datasetId && params.datumId !== datumId),
          );
          paramsToRemove.forEach(({ datumId }) => {
            const layer = filteredRootLayers.find(
              ({ currentDataIdAtom }) => get(currentDataIdAtom) === datumId,
            );
            invariant(layer != null);
            removeLayer(layer.id);
          });
          paramsToAdd.forEach(({ datasetId, datumId }) => {
            const dataset = datasets.find(d => d.id === datasetId);
            const filteredSettings = settings.filter(s => s.datasetId === datasetId);
            if (!dataset) {
              return;
            }
            addLayer(
              createRootLayerAtom({
                dataset,
                areaCode: municipalityCode,
                settings: filteredSettings,
                templates,
                currentDataId: datumId,
              }),
            );
          });
          paramsToUpdate.forEach(({ datasetId, datumId }) => {
            const layer = filteredRootLayers.find(layer => layer.id === datasetId);
            invariant(layer != null);
            set(layer.currentDataIdAtom, datumId);
          });
        },
      );
    }, [
      municipalityCode,
      filteredRootLayers,
      datasets,
      layerType,
      addLayer,
      removeLayer,
      settings,
      templates,
    ]);

    const [params, setParams] = useAtom(paramsAtom);

    const handleChange = useCallback(
      (event: SelectChangeEvent<string[]>) => {
        invariant(Array.isArray(event.target.value));
        setParams(event.target.value.map(value => parseParams(value)));
      },
      [setParams],
    );

    const value = useMemo(
      () => (params != null ? params.map(params => serializeParams(params)) : []),
      [params],
    );

    const showDataFormats = useAtomValue(showDataFormatsAtom);
    return (
      <ContextSelect
        label={datasetTypeNames[datasets[0].type.code as PlateauDatasetType]}
        value={value}
        onChange={handleChange}
        disabled={disabled}>
        {datasets.flatMap((dataset, index) => {
          if (dataset.items.length > 1) {
            if (dataset.name === "") {
              return dataset.items.map(datum => (
                <SelectItem
                  key={datum.id}
                  value={serializeParams({
                    datasetId: dataset.id,
                    datumId: datum.id,
                  })}>
                  <Typography variant="body2">
                    {datum.name}
                    {showDataFormats ? ` (${datum.format})` : null}
                  </Typography>
                </SelectItem>
              ));
            }
            return [
              <SelectGroupItem key={index} size="small">
                {dataset.name}
              </SelectGroupItem>,
              ...dataset.items.map(datum => (
                <SelectItem
                  key={datum.id}
                  indent={1}
                  value={serializeParams({
                    datasetId: dataset.id,
                    datumId: datum.id,
                  })}>
                  <Typography variant="body2">
                    {datum.name}
                    {showDataFormats ? ` (${datum.format})` : null}
                  </Typography>
                </SelectItem>
              )),
            ];
          }
          invariant(dataset.items.length === 1);
          const [datum] = dataset.items;
          return (
            <SelectItem
              key={datum.id}
              value={serializeParams({
                datasetId: dataset.id,
                datumId: datum.id,
              })}>
              <Typography variant="body2">
                {dataset.name}
                {showDataFormats ? ` (${datum.format})` : null}
              </Typography>
            </SelectItem>
          );
        })}
      </ContextSelect>
    );
  },
);
