import { useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useMemo, type FC } from "react";

import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { settingsAtom } from "../../../shared/states/setting";
import { templatesAtom } from "../../../shared/states/template";
import { createRootLayerForDatasetAtom } from "../../../shared/view-layers";
import { removeLayerAtom, useAddLayer, useFindLayer } from "../../layers";
import { ContextButton } from "../../ui-components";
import { datasetTypeLayers } from "../constants/datasetTypeLayers";
import { PlateauDatasetType } from "../constants/plateau";
import { showDataFormatsAtom } from "../states/app";

export interface DefaultDatasetButtonProps {
  dataset: DatasetFragmentFragment;
  municipalityCode: string;
  disabled?: boolean;
}

export const DefaultDatasetButton: FC<DefaultDatasetButtonProps> = memo(
  ({ dataset, municipalityCode, disabled = false }) => {
    const layers = useAtomValue(rootLayersLayersAtom);
    const layerType =
      datasetTypeLayers[dataset.type.code as PlateauDatasetType] ?? datasetTypeLayers.usecase;
    const findLayer = useFindLayer();
    const layer = useMemo(
      () =>
        layerType != null
          ? findLayer(layers, {
              id: dataset.id,
            })
          : undefined,
      [dataset.id, layers, layerType, findLayer],
    );
    const settings = useAtomValue(settingsAtom);
    const templates = useAtomValue(templatesAtom);

    const addLayer = useAddLayer();
    const removeLayer = useSetAtom(removeLayerAtom);

    const handleClick = useCallback(() => {
      if (layerType == null) {
        return;
      }
      if (layer == null) {
        const filteredSettings = settings.filter(s => s.datasetId === dataset.id);
        addLayer(
          createRootLayerForDatasetAtom({
            dataset,
            settings: filteredSettings,
            templates,
            areaCode: municipalityCode,
          }),
        );
      } else {
        removeLayer(layer.id);
      }
    }, [dataset, layer, layerType, addLayer, removeLayer, municipalityCode, settings, templates]);

    const datum = dataset.items[0];
    const showDataFormats = useAtomValue(showDataFormatsAtom);
    if (datum == null) {
      console.warn("Dataset must include at least 1 datum.");
      return null;
    }
    return (
      <ContextButton
        selected={layer != null}
        disabled={disabled || layerType == null}
        onClick={handleClick}>
        {dataset.type.name}
        {showDataFormats ? ` (${datum.format})` : null}
      </ContextButton>
    );
  },
);
