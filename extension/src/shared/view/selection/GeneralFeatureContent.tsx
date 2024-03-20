import { Divider, IconButton, List, Tooltip } from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, type FC, useMemo, useState } from "react";

import { layerSelectionAtom } from "../../../prototypes/layers";
import { screenSpaceSelectionAtom } from "../../../prototypes/screen-space-selection";
import { InspectorHeader, LayerIcon } from "../../../prototypes/ui-components";
import {
  type SCREEN_SPACE_SELECTION,
  type SelectionGroup,
} from "../../../prototypes/view/states/selection";
import {
  highlightedLayersAtom,
  layerTypeIcons,
  layerTypeNames,
} from "../../../prototypes/view-layers";
import { FeatureInspectorSettings } from "../../api/types";
import { GENERAL_FEATURE } from "../../reearth/layers";
import { Feature } from "../../reearth/types/layer";
import { RootLayerForDataset } from "../../view-layers";

import { DescriptionFeatureContent } from "./DescriptionFeatureContent";
import { GeneralFeaturePropertiesSection } from "./GeneralFeaturePropertiesSection";

export type GeneralFeatureContentProps = {
  rootLayer: RootLayerForDataset;
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof GENERAL_FEATURE;
  })["values"];
  firstFeature?: Feature;
  displayType?: Exclude<FeatureInspectorSettings["basic"], undefined>["displayType"];
};

export const getGeneralFeatureInformation = ({ rootLayer, values }: GeneralFeatureContentProps) => {
  const firstFeature = window.reearth?.layers?.findFeatureById?.(values[0].layerId, values[0].key);

  const hasDescription = !!firstFeature?.metaData?.description;
  const displayType =
    !rootLayer.featureInspector?.basic?.displayType ||
    rootLayer.featureInspector?.basic?.displayType === "auto"
      ? hasDescription
        ? "CZMLDescription"
        : "propertyList"
      : rootLayer.featureInspector?.basic?.displayType;
  return { scrollable: displayType !== "CZMLDescription", firstFeature, displayType };
};

export const GeneralFeatureContent: FC<GeneralFeatureContentProps> = ({
  rootLayer,
  values,
  firstFeature,
  displayType,
}) => {
  const setSelection = useSetAtom(screenSpaceSelectionAtom);

  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const type = values[0].layerType;
  const title = useMemo(() => {
    if (rootLayer?.featureInspector?.basic?.titleType === "custom") {
      return (
        rootLayer?.featureInspector?.basic?.customTitle ??
        layerTypeNames[type] ??
        rootLayer.layerName
      );
    }
    return layerTypeNames[type] ?? rootLayer.layerName;
  }, [rootLayer, type]);

  // TODO(reearth): Support hiding feature
  // const [hidden, setHidden] = useState(false);
  // const hideFeatures = useSetAtom(hideFeaturesAtom);
  // const showFeatures = useSetAtom(showFeaturesAtom);

  // const handleHide = useCallback(() => {
  //   hideFeatures(values.map(value => value.key));
  //   setHidden(true);
  // }, [values, hideFeatures]);

  // const handleShow = useCallback(() => {
  //   showFeatures(values.map(value => value.key));
  //   setHidden(false);
  // }, [values, showFeatures]);

  const generalSetLayers = useAtomValue(highlightedLayersAtom);
  const generalSetLayerIdsAtom = useMemo(
    () =>
      atom(() =>
        generalSetLayers.map(l => {
          return { id: l.id, type: l.type } as const;
        }),
      ),
    [generalSetLayers],
  );

  const generalSetLayerIds = useAtomValue(generalSetLayerIdsAtom);
  const setLayerSelection = useSetAtom(layerSelectionAtom);
  const handleSelectLayers = useCallback(() => {
    setLayerSelection(generalSetLayerIds);
  }, [setLayerSelection, generalSetLayerIds]);

  const [headerHeight, setHeaderHeight] = useState(0);
  const handleSetHeaderHeight = useCallback((e: HTMLDivElement | null) => {
    setHeaderHeight(e?.getBoundingClientRect().height ?? 0);
  }, []);

  return (
    <List disablePadding>
      <div ref={handleSetHeaderHeight}>
        <InspectorHeader
          title={title}
          iconComponent={layerTypeIcons[type] ?? layerTypeIcons.USE_CASE_LAYER}
          // TODO(reearth): Support highlight layer if necessary
          actions={
            <>
              <Tooltip title="レイヤーを選択">
                <IconButton aria-label="レイヤーを選択" onClick={handleSelectLayers}>
                  <LayerIcon />
                </IconButton>
              </Tooltip>
              {/* <Tooltip title={hidden ? "表示" : "隠す"}>
                <IconButton
                  aria-label={hidden ? "表示" : "隠す"}
                  onClick={hidden ? handleShow : handleHide}>
                  {hidden ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
                </IconButton>
              </Tooltip> */}
            </>
          }
          onClose={handleClose}
        />
        <Divider />
      </div>
      {displayType === "propertyList" ? (
        <GeneralFeaturePropertiesSection values={values} />
      ) : displayType === "CZMLDescription" ? (
        <DescriptionFeatureContent
          html={firstFeature?.metaData?.description}
          additionalHeight={headerHeight}
        />
      ) : null}
    </List>
  );
};
