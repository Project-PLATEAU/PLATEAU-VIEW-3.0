import { LayerType } from "../../../prototypes/layers";
import { BUILDING_LAYER } from "../../../prototypes/view-layers";
import { ComponentBase } from "../../types/fieldComponents";
import {
  TILESET_BUILDING_MODEL_COLOR,
  TILESET_FLOOD_MODEL_COLOR,
} from "../../types/fieldComponents/3dtiles";
import { OPACITY_FIELD } from "../../types/fieldComponents/general";
import { FLOOD_LAYER_TYPES, LayerModel } from "../../view-layers";
import { ComponentAtom } from "../../view-layers/component";

export const MULTIPLE_SELECTABLE_FIELDS: ComponentBase["type"][] = [
  TILESET_BUILDING_MODEL_COLOR,
  TILESET_FLOOD_MODEL_COLOR,
  OPACITY_FIELD,
];
export const MULTIPLE_SELECTABLE_TYPES: LayerType[] = [BUILDING_LAYER, ...FLOOD_LAYER_TYPES];

export const useIsMultipleSelectableField = ({
  layers,
  type,
}: {
  layers: readonly LayerModel[];
  type: ComponentAtom["type"];
}) => {
  return (
    layers.length === 1 ||
    (layers.every(l => MULTIPLE_SELECTABLE_TYPES.includes(l.type)) &&
      MULTIPLE_SELECTABLE_FIELDS.includes(type))
  );
};
