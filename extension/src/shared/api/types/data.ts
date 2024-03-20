import { LayerType } from "../../../prototypes/layers";
import { DataType } from "../../reearth/types/layer";

export type Data = {
  id: string;
  name?: string;
  format: DataType;
  type: LayerType;
  url: string;
};
