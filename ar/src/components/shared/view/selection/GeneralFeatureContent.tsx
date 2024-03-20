import { Divider, List } from "@mui/material";
import { useSetAtom } from "jotai";
import { useCallback, type FC, useMemo, useState } from "react";

import { screenSpaceSelectionAtom } from "../../../prototypes/screen-space-selection";
import { InspectorHeader } from "../../../prototypes/ui-components";
import {
  type SCREEN_SPACE_SELECTION,
  type SelectionGroup,
} from "../../../prototypes/view/states/selection";
import { layerTypeIcons, layerTypeNames } from "../../../prototypes/view-layers";
import { FeatureInspectorSettings } from "../../api/types";
import { GENERAL_FEATURE } from "../../reearth/layers";
import { Feature } from "../../reearth/types/layer";
import { RootLayer } from "../../view-layers";

import { DescriptionFeatureContent } from "./DescriptionFeatureContent";
import { GeneralFeaturePropertiesSection } from "./GeneralFeaturePropertiesSection";

export type GeneralFeatureContentProps = {
  rootLayer: RootLayer;
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof GENERAL_FEATURE;
  })["values"];
  firstFeature?: Feature;
  displayType?: Exclude<FeatureInspectorSettings["basic"], undefined>["displayType"];
};

export const getGeneralFeatureInformation = ({ rootLayer, values }: GeneralFeatureContentProps) => {
  const firstFeature = window.reearth?.layers?.findFeatureById?.(values[0].layerId, values[0].key);

  const hasProperties = !!firstFeature?.properties;
  const hasDescription = !!firstFeature?.metaData?.description;
  const displayType =
    !rootLayer.featureInspector?.basic?.displayType ||
    rootLayer.featureInspector?.basic?.displayType === "auto"
      ? hasDescription
        ? "CZMLDescription"
        : hasProperties
        ? "propertyList"
        : undefined
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
      return rootLayer?.featureInspector?.basic?.customTitle ?? layerTypeNames[type];
    }
    return layerTypeNames[type];
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

  // TODO(reearth): Support highlight layer if necessary
  // const tilesetLayers = useAtomValue(highlightedTilesetLayersAtom);
  // const tilsetLayerIdsAtom = useMemo(
  //   () => atom(get => tilesetLayers.map(l => get(get(l.rootLayerAtom).layer).id)),
  //   [tilesetLayers],
  // );
  // const tilsetLayerIds = useAtomValue(tilsetLayerIdsAtom);
  // const setLayerSelection = useSetAtom(layerSelectionAtom);
  // const handleSelectLayers = useCallback(() => {
  //   setLayerSelection(tilsetLayerIds);
  // }, [tilsetLayerIds, setLayerSelection]);

  const [headerHeight, setHeaderHeight] = useState(0);
  const handleSetHeaderHeight = useCallback((e: HTMLDivElement | null) => {
    setHeaderHeight(e?.getBoundingClientRect().height ?? 0);
  }, []);

  return (
    <List disablePadding>
      <div ref={handleSetHeaderHeight}>
        <InspectorHeader
          title={title}
          iconComponent={layerTypeIcons[type]}
          // TODO(reearth): Support highlight layer if necessary
          // actions={
          //   <>
          //     <Tooltip title="レイヤーを選択">
          //       <IconButton aria-label="レイヤーを選択" onClick={handleSelectLayers}>
          //         <LayerIcon />
          //       </IconButton>
          //     </Tooltip>
          //     <Tooltip title={hidden ? "表示" : "隠す"}>
          //       <IconButton
          //         aria-label={hidden ? "表示" : "隠す"}
          //         onClick={hidden ? handleShow : handleHide}>
          //         {hidden ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
          //       </IconButton>
          //     </Tooltip>
          //   </>
          // }
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
