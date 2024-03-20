import { atom } from "jotai";
import { splitAtom } from "jotai/utils";
import { isEqual, pick } from "lodash";
import { nanoid } from "nanoid";

import { rootLayersAtom } from "../../shared/states/rootLayer";
import { RootLayerConfig } from "../../shared/view-layers";
import { atomsWithSelection } from "../shared-states";

import { LayerType, type LayerModel, type LayerPredicate } from "./types";

// TODO: Rewrite with atomFamily perhaps?
// export const layersAtom = atomWithReset<LayerModel[]>([]);
export const layerAtomsAtom = splitAtom(rootLayersAtom);
export const layerIdsAtom = atom(get =>
  get(layerAtomsAtom).map(layerAtom => get(get(get(layerAtom).rootLayerAtom).layer).id),
);

const {
  selectionAtom: layerSelectionAtom,
  addAtom: addLayerSelectionAtom,
  removeAtom: removeLayerSelectionAtom,
  clearAtom: clearLayerSelectionAtom,
} = atomsWithSelection<{ id: string; type: LayerType }>({ getKey: v => v.id });

export {
  layerSelectionAtom,
  addLayerSelectionAtom,
  removeLayerSelectionAtom,
  clearLayerSelectionAtom,
};

export interface AddLayerOptions {
  autoSelect?: boolean;
}

export const addLayerAtom = atom(
  null,
  (get, set, root: RootLayerConfig, { autoSelect = true }: AddLayerOptions = {}) => {
    const layer = get(get(root.rootLayerAtom).layer);
    const id = layer.id ?? nanoid();
    if (get(layerIdsAtom).includes(id)) {
      console.warn(`Layer already exits: ${id}`);
      return () => {};
    }
    set(layerAtomsAtom, {
      type: "insert",
      value: root,
      before: get(layerAtomsAtom)[0],
    });
    if (autoSelect) {
      set(layerSelectionAtom, [{ id, type: layer.type }]);
    }

    return () => {
      const layerAtom = get(layerAtomsAtom).find(
        layerAtom => get(get(get(layerAtom).rootLayerAtom).layer).id === id,
      );
      if (layerAtom == null) {
        console.warn(`Layer does not exit: ${id}`);
        return;
      }
      set(layerAtomsAtom, {
        type: "remove",
        atom: layerAtom,
      });
    };
  },
);

export const findLayerAtom = atom(
  null,
  (get, _set, layers: readonly LayerModel[], predicate: Partial<LayerModel> | LayerPredicate) => {
    if (typeof predicate === "function") {
      return layers.find(layerAtom => predicate(layerAtom, get));
    }
    const keys = Object.entries(predicate)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key);
    const layer = layers.find(layer => isEqual(pick(layer, keys), predicate));
    return layer != null ? layer : undefined;
  },
);

export const filterLayersAtom = atom(
  null,
  (get, _set, layers: readonly LayerModel[], predicate: Partial<LayerModel> | LayerPredicate) => {
    if (typeof predicate === "function") {
      return layers.filter(layer => predicate(layer, get));
    }
    const keys = Object.entries(predicate)
      .filter(([, value]) => value !== undefined)
      .map(([key]) => key);
    return layers.filter(layer => isEqual(pick(layer, keys), predicate));
  },
);

export const removeLayerAtom = atom(null, (get, set, id: string) => {
  const layerAtom = get(layerAtomsAtom).find(
    layerAtom => get(get(get(layerAtom).rootLayerAtom).layer).id === id,
  );
  if (layerAtom == null) {
    console.warn(`Layer does not exit: ${id}`);
    return;
  }
  set(removeLayerSelectionAtom, [{ id, type: get(get(get(layerAtom).rootLayerAtom).layer).type }]);
  set(layerAtomsAtom, {
    type: "remove",
    atom: layerAtom,
  });
});

export const moveLayerAtom = atom(null, (get, set, activeId: string, overId: string) => {
  const layerAtoms = get(layerAtomsAtom);
  const activeIndex = layerAtoms.findIndex(
    layerAtom => get(get(get(layerAtom).rootLayerAtom).layer).id === activeId,
  );
  if (activeIndex === -1) {
    console.warn(`Layer does not exit: ${activeId}`);
    return;
  }
  const overIndex = layerAtoms.findIndex(
    layerAtom => get(get(get(layerAtom).rootLayerAtom).layer).id === overId,
  );
  if (overIndex === -1) {
    console.warn(`Layer does not exit: ${overId}`);
    return;
  }
  set(layerAtomsAtom, {
    type: "move",
    atom: layerAtoms[activeIndex],
    before: activeIndex > overIndex ? layerAtoms[overIndex] : layerAtoms[overIndex + 1],
  });

  const layers = get(rootLayersAtom);
  const layerIndex = Math.max(activeIndex, overIndex);
  layers
    .slice(0, layerIndex)
    .reverse()
    .forEach(layer => {
      get(get(layer.rootLayerAtom).layer).handleRef.current?.bringToFront();
    });
});
