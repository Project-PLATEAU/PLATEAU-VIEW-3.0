import { Divider } from "@mui/material";
import { atom, useAtomValue } from "jotai";
import { useMemo, type FC, SetStateAction } from "react";

import { InspectorItem, SelectParameterItem } from "../../../prototypes/ui-components";
import { rootLayersAtom } from "../../states/rootLayer";
import { LayerModel, RootLayerConfigForDataset } from "../../view-layers";

export interface SwitchGroupProps {
  layers: readonly LayerModel[];
}

// TODO: Handle as component
export const SwitchGroup: FC<SwitchGroupProps> = ({ layers }) => {
  const layer = layers[0]; // TODO: Support multiple selection layer if necessary
  const propertyItems = useMemo(() => layer.componentGroups, [layer.componentGroups]);
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
          if (!rootLayer || !propertyItems) return null;
          return get(rootLayer.currentGroupIdAtom) ?? propertyItems[0][0];
        },
        (get, set, action: SetStateAction<string | null>) => {
          if (!rootLayer) return;
          const update =
            typeof action === "function"
              ? action(get(rootLayer.currentGroupIdAtom) ?? null)
              : action;
          set(rootLayer.currentGroupIdAtom, update ?? undefined);
        },
      ),
    ],
    [rootLayer, propertyItems],
  );

  if (layers.length !== 1 || propertyAtoms == null || !propertyItems || propertyItems.length <= 1) {
    return null;
  }
  return (
    <>
      <Divider />
      <InspectorItem>
        <SelectParameterItem
          label="グループ" // Group
          atom={propertyAtoms}
          items={propertyItems}
          layout="stack"
          displayEmpty
        />
      </InspectorItem>
    </>
  );
};
