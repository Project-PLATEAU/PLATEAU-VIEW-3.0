import { PrimitiveAtom } from "jotai";

import { ViewLayerModel, ViewLayerModelParams } from "../../prototypes/view-layers";
import { CameraPosition } from "../reearth/types";
import { DataType } from "../reearth/types/layer";

import { ComponentAtom } from "./component";

export type LayerModelParams = ViewLayerModelParams & {
  format?: string;
  url?: string;
};

export type LayerModelBase = {
  format?: DataType;
  url?: string;
  layers?: string[];
  componentGroups?: [id: string, name: string][];
  componentAtoms?: ComponentAtom[];
  // This is for MVT basically.
  cameraAtom?: PrimitiveAtom<CameraPosition | undefined>;
};

export type LayerModel = ViewLayerModel & LayerModelBase;
