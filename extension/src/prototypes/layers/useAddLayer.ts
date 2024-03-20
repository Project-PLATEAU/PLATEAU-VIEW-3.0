import { useSetAtom } from "jotai";

import { RootLayerConfig } from "../../shared/view-layers";

import { addLayerAtom, type AddLayerOptions } from "./states";

// Provided for generic setter.
export function useAddLayer(): (
  layer: Omit<RootLayerConfig, "id">,
  options?: AddLayerOptions,
) => () => void;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAddLayer() {
  return useSetAtom(addLayerAtom);
}
