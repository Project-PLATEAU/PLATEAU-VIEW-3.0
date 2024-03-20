import { type FC } from "react";

import { PolygonFillColorConditionField } from "../../../types/fieldComponents/polygon";
import { LayerModel } from "../../../view-layers";
import { WritableAtomForComponent } from "../../../view-layers/component";
import { ColorSchemeSectionForComponentField } from "../../selection/ColorSchemeSectionForComponentField";

export interface LayerPolygonFillColorConditionFieldProps {
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<PolygonFillColorConditionField>[];
}

export const LayerPolygonFillColorConditionField: FC<LayerPolygonFillColorConditionFieldProps> = ({
  layers,
  atoms,
}) => {
  if (atoms.length === 0) {
    return null;
  }

  return <ColorSchemeSectionForComponentField layers={layers} />;
};
