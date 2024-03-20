import { Divider } from "@mui/material";
import { atom, useAtomValue } from "jotai";
import { useMemo, type FC, SetStateAction } from "react";

import { InspectorItem, SelectParameterItem } from "../../../prototypes/ui-components";
import { useDatasetById } from "../../graphql";
import { rootLayersAtom } from "../../states/rootLayer";
import { LayerModel, RootLayerConfigForDataset } from "../../view-layers";

export interface SwitchDatasetProps {
  layers: readonly LayerModel[];
}

// TODO: Handle as component
export const SwitchDataset: FC<SwitchDatasetProps> = ({ layers }) => {
  const layer = layers[0]; // TODO: Support multiple selection layer if necessary
  const { data } = useDatasetById(layer.id);
  const propertyItems = useMemo(() => data.node?.items.map(item => [item.id, item.name]), [data]);
  const rootLayers = useAtomValue(rootLayersAtom);
  const rootLayer = useMemo(
    () =>
      rootLayers.find(
        (r): r is RootLayerConfigForDataset => r.type === "dataset" && r.id === layer.id,
      ),
    [rootLayers, layer],
  );

  const propertyAtoms = useMemo(
    () => [
      atom(
        get => {
          if (!rootLayer) return null;
          return get(rootLayer.currentDataIdAtom) ?? null;
        },
        (get, set, action: SetStateAction<string | null>) => {
          if (!rootLayer) return;
          const update =
            typeof action === "function"
              ? action(get(rootLayer.currentDataIdAtom) ?? null)
              : action;
          set(rootLayer.currentDataIdAtom, update ?? undefined);
        },
      ),
    ],
    [rootLayer],
  );

  if (layers.length !== 1 || propertyAtoms == null || !rootLayer || data.node?.items.length <= 1) {
    return null;
  }
  return (
    <>
      <Divider />
      <InspectorItem>
        <SelectParameterItem
          label="データセット" // Dataset
          atom={propertyAtoms}
          items={propertyItems as [string, string][]}
          layout="stack"
          displayEmpty
        />
      </InspectorItem>
    </>
  );
};
