import { useAtom } from "jotai";
import { useMemo } from "react";

import { interactionModeAtom } from "../../../shared/states/interactionMode";
import { BoxAppearance, LngLatHeight } from "../../reearth/types";
import { EXPERIMENTAL_clipping } from "../../reearth/types/value";
import { TilesetClippingField } from "../../types/fieldComponents/3dtiles";

const BOX_DIMENSION = {
  width: 100,
  height: 100,
  length: 100,
};
const BOX_STYLE = {
  outlineColor: "#ffffff",
  activeOutlineColor: "#0ee1ff",
  outlineWidth: 1,
  draggableOutlineWidth: 10,
  draggableOutlineColor: "rgba(14, 225, 255, 0.5)",
  activeDraggableOutlineColor: "rgba(14, 225, 255, 1)",
  fillColor: "rgba(255, 255, 255, 0.1)",
  axisLineColor: "#ffffff",
  axisLineWidth: 1,
  pointFillColor: "rgba(255, 255, 255, 0.3)",
  pointOutlineColor: "rgba(14, 225, 255, 0.5)",
  activePointOutlineColor: "rgba(14, 225, 255, 1)",
  pointOutlineWidth: 1,
};

export const useClippingBox = (
  component: TilesetClippingField | undefined,
): [EXPERIMENTAL_clipping | undefined, BoxAppearance | undefined] => {
  const { enable, visible, allowEnterGround, direction } = component?.value || {};
  const [interactionMode] = useAtom(interactionModeAtom);

  const disabledSelection = useMemo(() => {
    const mode = interactionMode.value as unknown;
    return mode === "default" || mode === "move";
  }, [interactionMode]);
  const location: LngLatHeight | undefined = useMemo(() => {
    if (!enable) return;

    const viewport = window.reearth?.viewport;
    const centerOnScreen = window.reearth?.scene?.getLocationFromScreen(
      (viewport?.width ?? 0) / 2,
      (viewport?.height ?? 0) / 2,
    );
    if (!centerOnScreen) return;

    return {
      lng: centerOnScreen.lng,
      lat: centerOnScreen.lat,
      height: BOX_DIMENSION.height,
    };
  }, [enable]);

  if (!enable || !location) return [undefined, undefined];

  return [
    {
      ...BOX_DIMENSION,
      coordinates: [location.lng, location.lat, location.height],
      visible,
      direction,
      allowEnterGround,
      useBuiltinBox: true,
      disabledSelection,
    },
    { ...BOX_DIMENSION, ...BOX_STYLE, disabledSelection },
  ];
};
