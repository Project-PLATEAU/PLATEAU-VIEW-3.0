import { useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";

import { useWindowEvent } from "../../../prototypes/react-helpers";
import { SketchGeometryType } from "../../../prototypes/sketch";
import { sketchTypeAtom, toolAtom } from "../../../prototypes/view/states/tool";
import { useReEarthEvent } from "../../reearth/hooks";
import { useSketch } from "../../reearth/hooks/useSketch";
import { ReearthSketchType } from "../../reearth/types";

export default () => {
  const [sketchType] = useAtom(sketchTypeAtom);
  const [toolType] = useAtom(toolAtom);
  const spacePressed = useRef(false);

  const toolTypeRef = useRef(toolType);
  toolTypeRef.current = toolType;
  const sketchTypeRef = useRef(sketchType);
  sketchTypeRef.current = sketchType;

  const {
    handleSetType,
    handleSetColor,
    handleCreateDataOnly,
    handleDisableShadow,
    handleEnableRelativeHeight,
    handleAllowRightClickToAbort,
    handleAllowAutoResetInteractionMode,
  } = useSketch();

  const handleSketchFeatureCreated = useCallback(() => {
    if (toolTypeRef.current?.type === "sketch")
      handleSetType(sketchGeometryTypeToReearthSketchType(sketchTypeRef.current));
  }, [handleSetType]);

  useReEarthEvent("sketchfeaturecreated", handleSketchFeatureCreated);

  useEffect(() => {
    // toolType?.type changes before spacePressed.current been set, so we need to defer the update to the next frame.
    requestAnimationFrame(() => {
      // View 3.0 always has a sketch tool type while reearth sketch type could be undefined. (to disable sketch). Here we use tool type to determine whether to enable sketch.
      // But View 3.0 tool type could temporarily changes when space is pressed while drawing. So manually added a check for spacePressed here.
      if (spacePressed.current) return;
      handleSetColor("#00BEBE");
      handleDisableShadow(false);
      handleEnableRelativeHeight(false);
      handleSetType(
        toolType?.type !== "sketch" ? undefined : sketchGeometryTypeToReearthSketchType(sketchType),
      );
    });
  }, [
    sketchType,
    toolType?.type,
    handleSetColor,
    handleSetType,
    handleDisableShadow,
    handleEnableRelativeHeight,
  ]);

  useEffect(() => {
    handleCreateDataOnly(true);
    handleAllowRightClickToAbort(false);
    handleAllowAutoResetInteractionMode(false);
  }, [handleCreateDataOnly, handleAllowRightClickToAbort, handleAllowAutoResetInteractionMode]);

  useWindowEvent("keydown", event => {
    if (event.repeat) {
      return;
    }
    if (
      event.code === "Space" &&
      !event.altKey &&
      !event.shiftKey &&
      !event.metaKey &&
      !event.ctrlKey
    ) {
      spacePressed.current = true;
    }
  });
  useWindowEvent("keyup", event => {
    if (event.code === "Space") {
      spacePressed.current = false;
    }
  });

  return null;
};

export function reearthSketchTypeToSketchGeometryType(
  type: ReearthSketchType | undefined,
): SketchGeometryType | undefined {
  switch (type) {
    case "extrudedCircle":
      return "circle";
    case "extrudedRectangle":
      return "rectangle";
    case "extrudedPolygon":
      return "polygon";
    default:
      return undefined;
  }
}

function sketchGeometryTypeToReearthSketchType(
  type: SketchGeometryType,
): ReearthSketchType | undefined {
  switch (type) {
    case "circle":
      return "extrudedCircle";
    case "rectangle":
      return "extrudedRectangle";
    case "polygon":
      return "extrudedPolygon";
    default:
      return undefined;
  }
}
