import { Divider, IconButton, List, Tooltip } from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useState, type FC, useMemo, useEffect } from "react";

import { TILESET_FEATURE } from "../../../shared/reearth/layers";
import { findRootLayerAtom, rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { findLayerAtom, layerSelectionAtom } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import {
  InspectorHeader,
  LayerIcon,
  VisibilityOffIcon,
  VisibilityOnIcon,
} from "../../ui-components";
import {
  BUILDING_LAYER,
  hideFeaturesAtom,
  highlightedTilesetLayersAtom,
  layerTypeIcons,
  layerTypeNames,
  showFeaturesAtom,
} from "../../view-layers";
import { type SCREEN_SPACE_SELECTION, type SelectionGroup } from "../states/selection";

import { TileFeaturePropertiesSection } from "./TileFeaturePropertiesSection";

export interface TileFeatureContentProps {
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof TILESET_FEATURE;
  })["values"];
}

export const TileFeatureContent: FC<TileFeatureContentProps> = ({ values }) => {
  const setSelection = useSetAtom(screenSpaceSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const [hidden, setHidden] = useState(false);
  const hideFeatures = useSetAtom(hideFeaturesAtom);
  const showFeatures = useSetAtom(showFeaturesAtom);
  const handleHide = useCallback(() => {
    hideFeatures(values.map(value => value.key));
    setHidden(true);
  }, [values, hideFeatures]);
  const handleShow = useCallback(() => {
    showFeatures(values.map(value => value.key));
    setHidden(false);
  }, [values, showFeatures]);

  const tilesetLayers = useAtomValue(highlightedTilesetLayersAtom);
  const tilsetLayerIdsAtom = useMemo(
    () =>
      atom(get =>
        tilesetLayers.map(l => {
          const v = get(get(l.rootLayerAtom).layer);
          return { id: v.id, type: v.type } as const;
        }),
      ),
    [tilesetLayers],
  );
  const tilsetLayerIds = useAtomValue(tilsetLayerIdsAtom);
  const setLayerSelection = useSetAtom(layerSelectionAtom);
  const handleSelectLayers = useCallback(() => {
    setLayerSelection(tilsetLayerIds);
  }, [tilsetLayerIds, setLayerSelection]);

  const findRootLayer = useSetAtom(findRootLayerAtom);
  const findLayer = useSetAtom(findLayerAtom);
  const rootLayers = useAtomValue(rootLayersLayersAtom);
  const [layer, rootLayer] = useMemo(() => {
    // All `layerId` of `values` should be same
    const datasetId = values[0].datasetId;
    return [findLayer(rootLayers, l => l.id === datasetId), findRootLayer(datasetId)];
  }, [findRootLayer, values, rootLayers, findLayer]);

  const isBuildingModel = layer?.type === BUILDING_LAYER;
  const defaultTitle = layer ? layerTypeNames[layer.type] : "";
  const Icon = layer ? layerTypeIcons[layer.type] : undefined;

  const title = useMemo(() => {
    if (rootLayer?.featureInspector?.basic?.titleType === "custom") {
      return rootLayer?.featureInspector?.basic?.customTitle ?? defaultTitle;
    }

    if (isBuildingModel) {
      return `${values.length}個の${defaultTitle}`;
    }

    return defaultTitle;
  }, [rootLayer, values, isBuildingModel, defaultTitle]);

  useEffect(() => {
    setHidden(false);
  }, [values]);

  return (
    <List disablePadding>
      <InspectorHeader
        // TODO: Change name and icon according to the feature type.
        title={title}
        iconComponent={Icon}
        actions={
          isBuildingModel ? (
            <>
              <Tooltip title="レイヤーを選択">
                <IconButton aria-label="レイヤーを選択" onClick={handleSelectLayers}>
                  <LayerIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={hidden ? "表示" : "隠す"}>
                <IconButton
                  aria-label={hidden ? "表示" : "隠す"}
                  onClick={hidden ? handleShow : handleHide}>
                  {hidden ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
                </IconButton>
              </Tooltip>
            </>
          ) : undefined
        }
        onClose={handleClose}
      />
      <Divider />
      <TileFeaturePropertiesSection values={values} />
    </List>
  );
};
