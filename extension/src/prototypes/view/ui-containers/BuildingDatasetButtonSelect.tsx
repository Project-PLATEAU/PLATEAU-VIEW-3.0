import { Stack, Typography, type SelectChangeEvent } from "@mui/material";
import { atom, useAtom, useAtomValue, useSetAtom, type Getter, type SetStateAction } from "jotai";
import { memo, useCallback, useMemo, type FC } from "react";

import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { rootLayersAtom } from "../../../shared/states/rootLayer";
import { settingsAtom } from "../../../shared/states/setting";
import { templatesAtom } from "../../../shared/states/template";
import {
  RootLayerConfigForDataset,
  createRootLayerForDatasetAtom,
} from "../../../shared/view-layers";
import { removeLayerAtom, useAddLayer } from "../../layers";
import { ContextButtonSelect, SelectItem } from "../../ui-components";
import { datasetTypeNames } from "../constants/datasetTypeNames";
import { showDataFormatsAtom } from "../states/app";

interface Params {
  id?: string;
}

function createParams(get: Getter, rootLayer: RootLayerConfigForDataset): Params {
  return {
    id: get(rootLayer.currentDataIdAtom),
  };
}

function serializeParams({ id }: Params): string {
  return JSON.stringify([id]);
}

function parseParams(value: string): Params {
  const [id] = JSON.parse(value);
  return { id: id ?? undefined };
}

export interface BuildingDatasetButtonSelectProps {
  dataset: DatasetFragmentFragment;
  municipalityCode: string;
  disabled?: boolean;
}

export const BuildingDatasetButtonSelect: FC<BuildingDatasetButtonSelectProps> = memo(
  ({ dataset, municipalityCode, disabled }) => {
    const rootLayers = useAtomValue(rootLayersAtom);
    const rootLayer = useMemo(
      () =>
        rootLayers.find(
          (l): l is RootLayerConfigForDataset => l.type === "dataset" && l.id === dataset.id,
        ),
      [rootLayers, dataset],
    );
    const settings = useAtomValue(settingsAtom);
    const templates = useAtomValue(templatesAtom);

    const addLayer = useAddLayer();
    const removeLayer = useSetAtom(removeLayerAtom);
    const paramsAtom = useMemo(() => {
      if (!rootLayer) {
        return atom(null, (_get, _set, params?: SetStateAction<Params | null>) => {
          const nextParams = typeof params === "function" ? params(null) : params;
          if (nextParams == null) {
            return;
          }
          const filteredSettings = settings.filter(s => s.datasetId === dataset.id);
          addLayer(
            createRootLayerForDatasetAtom({
              dataset,
              settings: filteredSettings,
              templates,
              currentDataId: nextParams.id,
              areaCode: municipalityCode,
              // version: nextParams.version ?? undefined,
              // lod: nextParams.lod ?? undefined,
            }),
          );
        });
      }

      return atom(
        get => createParams(get, rootLayer),
        (get, set, params?: SetStateAction<Params | null>) => {
          const prevParams = createParams(get, rootLayer);
          const nextParams = typeof params === "function" ? params(prevParams) : params;

          if (nextParams == null) {
            removeLayer(rootLayer.id);
          } else {
            set(rootLayer.currentDataIdAtom, nextParams.id);
          }
        },
      );
    }, [rootLayer, addLayer, removeLayer, dataset, municipalityCode, settings, templates]);

    const [params, setParams] = useAtom(paramsAtom);

    const handleClick = useCallback(() => {
      if (!rootLayer) {
        setParams({
          id: undefined,
        });
      } else {
        setParams(null);
      }
    }, [rootLayer, setParams]);

    const handleChange = useCallback(
      (event: SelectChangeEvent<string>) => {
        if (event.target.value === "") {
          setParams();
        } else {
          setParams(parseParams(event.target.value));
        }
      },
      [setParams],
    );

    // Remove textured data from our menu.
    const data = dataset.items;

    const value = useMemo(() => (params != null ? serializeParams(params) : ""), [params]);

    const showDataFormats = useAtomValue(showDataFormatsAtom);

    if (data.length === 0) {
      console.warn("Dataset must include at least 1 datum.");
      return null;
    }

    return (
      <ContextButtonSelect
        label={dataset.type.name ?? datasetTypeNames.usecase}
        value={value}
        disabled={disabled}
        onClick={handleClick}
        onChange={handleChange}>
        {data.map(datum => (
          <SelectItem key={datum.id} value={serializeParams(datum)}>
            <Stack>
              <Typography variant="body2">
                {datum.name}
                {showDataFormats ? ` (${datum.format})` : null}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dataset.year}年度
              </Typography>
            </Stack>
          </SelectItem>
        ))}
      </ContextButtonSelect>
    );
  },
);
