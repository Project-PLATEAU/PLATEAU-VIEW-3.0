import { type MultiPolygon, type Polygon } from "geojson";
import { type FC } from "react";

import { composeIdentifier } from "../cesium-helpers";
import {
  useScreenSpaceSelectionResponder,
  type ScreenSpaceSelectionEntry,
} from "../screen-space-selection";

import { SKETCH_OBJECT } from "./types";

export interface SketchObjectProps {
  id: string;
  geometry: Polygon | MultiPolygon;
  extrudedHeight: number;
  disableShadow?: boolean;
}

export const SketchObject: FC<SketchObjectProps> = ({ id }) => {
  const objectId = composeIdentifier({
    type: "Sketch",
    subtype: SKETCH_OBJECT,
    key: id,
  });

  useScreenSpaceSelectionResponder({
    type: SKETCH_OBJECT,
    convertToSelection: object => {
      return "properties" in object &&
        object.properties &&
        typeof object.properties === "object" &&
        "id" in object.properties &&
        object.properties.id === id
        ? {
            type: SKETCH_OBJECT,
            value: objectId,
          }
        : undefined;
    },
    shouldRespondToSelection: (value): value is ScreenSpaceSelectionEntry<typeof SKETCH_OBJECT> => {
      return value.type === SKETCH_OBJECT && value.value === objectId;
    },
  });

  return null;
};
