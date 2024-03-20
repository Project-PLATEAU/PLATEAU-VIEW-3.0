// import { PEDESTRIAN_OBJECT } from "@takram/plateau-pedestrian";

// import { SKETCH_OBJECT } from "@takram/plateau-sketch";
import { useTheme } from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { type ResizeCallback } from "re-resizable";
import { useCallback, type FC } from "react";

import { STORY_OBJECT } from "../../../shared/layerContainers/story";
import { GENERAL_FEATURE, TILESET_FEATURE } from "../../../shared/reearth/layers";
import { findRootLayerAtom } from "../../../shared/states/rootLayer";
import {
  GeneralFeatureContent,
  getGeneralFeatureInformation,
} from "../../../shared/view/selection/GeneralFeatureContent";
import { LegendDescriptionSection } from "../../../shared/view/selection/LegendDescriptionSection";
import { PEDESTRIAN_OBJECT } from "../../pedestrian";
import { SKETCH_OBJECT } from "../../sketch";
import { Inspector } from "../../ui-components";
import { PEDESTRIAN_LAYER, STORY_LAYER } from "../../view-layers";
import { ColorSchemeContent } from "../selection/ColorSchemeContent";
import { CustomLegendSchemeContent } from "../selection/CustomLegendSchemeContent";
import { ImageSchemeContent } from "../selection/ImageSchemeContent";
import { LayerContent } from "../selection/LayerContent";
import { PedestrianLayerContent } from "../selection/PedestrianLayerContent";
import { SketchObjectContent } from "../selection/SketchObjectContent";
import { StoryCaptureContent } from "../selection/StoryCaptureContent";
import { StoryLayerContent } from "../selection/StoryLayerContent";
import { TileFeatureContent } from "../selection/TileFeatureContent";
import { inspectorWidthAtom, pedestrianInspectorWidthAtom, viewportWidthAtom } from "../states/app";
import {
  COLOR_SCHEME_SELECTION,
  CUSTOM_LEGEND_SCHEME_SELECTION,
  IMAGE_SCHEME_SELECTION,
  LAYER_SELECTION,
  SCREEN_SPACE_SELECTION,
  selectionGroupsAtom,
} from "../states/selection";

export const SelectionPanel: FC = () => {
  let content = null;
  let useScrollable = undefined;

  let contentType: "default" | "pedestrian" = "default";
  const selectionGroups = useAtomValue(selectionGroupsAtom);

  const findRootLayer = useSetAtom(findRootLayerAtom);

  if (selectionGroups.length === 1) {
    const [selectionGroup] = selectionGroups;
    const { type, subtype } = selectionGroup;
    switch (type) {
      case LAYER_SELECTION:
        switch (subtype) {
          case PEDESTRIAN_LAYER:
            content = <PedestrianLayerContent values={selectionGroup.values} />;
            contentType = "pedestrian";
            break;
          case STORY_LAYER:
            content = <StoryLayerContent values={selectionGroup.values} />;
            break;
          default:
            content = <LayerContent values={selectionGroup.values} />;
            break;
        }
        break;
      case SCREEN_SPACE_SELECTION:
        switch (subtype) {
          case TILESET_FEATURE:
            content = <TileFeatureContent values={selectionGroup.values} />;
            break;
          case GENERAL_FEATURE: {
            const rootLayer = findRootLayer(selectionGroup.values[0].datasetId);
            if (
              !rootLayer ||
              (rootLayer.general?.featureClickEvent?.eventType &&
                rootLayer.general.featureClickEvent.eventType !== "openFeatureInspector")
            )
              break;
            const { scrollable, firstFeature, displayType } = getGeneralFeatureInformation({
              values: selectionGroup.values,
              rootLayer,
            });
            content = (
              <GeneralFeatureContent
                rootLayer={rootLayer}
                values={selectionGroup.values}
                firstFeature={firstFeature}
                displayType={displayType}
              />
            );
            useScrollable = scrollable;

            break;
          }
          case PEDESTRIAN_OBJECT:
            content = <PedestrianLayerContent values={selectionGroup.values} />;
            contentType = "pedestrian";
            break;
          case SKETCH_OBJECT:
            content = <SketchObjectContent values={selectionGroup.values} />;
            break;
          case STORY_OBJECT:
            content = <StoryCaptureContent values={selectionGroup.values} />;
            break;
        }
        break;
      case COLOR_SCHEME_SELECTION:
        content = (
          <>
            <ColorSchemeContent values={selectionGroup.values} />
            <LegendDescriptionSection values={selectionGroup.values} />
          </>
        );
        break;
      case IMAGE_SCHEME_SELECTION:
        content = (
          <>
            <ImageSchemeContent values={selectionGroup.values} />
            <LegendDescriptionSection values={selectionGroup.values} />
          </>
        );
        break;
      case CUSTOM_LEGEND_SCHEME_SELECTION:
        content = (
          <>
            <CustomLegendSchemeContent values={selectionGroup.values} />
            <LegendDescriptionSection values={selectionGroup.values} />
          </>
        );
        break;
    }
  } else if (selectionGroups.length > 1) {
    content = null; // TODO: Show mixed content
  }

  const [inspectorWidth, setInspectorWidth] = useAtom(inspectorWidthAtom);
  const handleResizeStop: ResizeCallback = useCallback(
    (_event, _direction, _element, delta) => {
      setInspectorWidth(prevValue => prevValue + delta.width);
    },
    [setInspectorWidth],
  );

  const [pedestrianInspectorWidth, setPedestrianInspectorWidth] = useAtom(
    pedestrianInspectorWidthAtom,
  );
  const handlePedestrianResizeStop: ResizeCallback = useCallback(
    (_event, _direction, _element, delta) => {
      setPedestrianInspectorWidth(prevValue => prevValue + delta.width);
    },
    [setPedestrianInspectorWidth],
  );

  const viewportWidth = useAtomValue(viewportWidthAtom);
  const theme = useTheme();
  const maxWidth = viewportWidth != null ? viewportWidth - parseFloat(theme.spacing(2)) : undefined;

  if (content == null) {
    return null;
  }
  if (contentType === "pedestrian") {
    return (
      <Inspector
        key="pedestrian"
        defaultWidth={pedestrianInspectorWidth}
        maxWidth={maxWidth}
        onResizeStop={handlePedestrianResizeStop}>
        <div>{content}</div>
      </Inspector>
    );
  }
  return (
    <Inspector
      key="default"
      defaultWidth={inspectorWidth}
      onResizeStop={handleResizeStop}
      scrollable={useScrollable}>
      <div>{content}</div>
    </Inspector>
  );
};
