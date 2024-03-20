import { type FC } from "react";

import { PointVisibilityFilterField } from "../../../types/fieldComponents/point";
import { LayerModel } from "../../../view-layers";
import { WritableAtomForComponent } from "../../../view-layers/component";
import { LayerVisibilityFilterField } from "../common/LayerVisibilityFilterField";

export interface LayerPointVisibilityFilterFieldProps {
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<PointVisibilityFilterField>[];
}

export const LayerPointVisibilityFilterField: FC<LayerPointVisibilityFilterFieldProps> = ({
  layers,
  atoms,
}) => {
  return <LayerVisibilityFilterField layers={layers} atoms={atoms} />;
};
