// import { pedestrianSelectionAtom } from "../pedestrian";
import { atom } from "jotai";
import { fromPairs, uniq, without } from "lodash-es";
import invariant from "tiny-invariant";

import { rootLayersAtom } from "../../shared/states/rootLayer";
import { featureSelectionAtom } from "../datasets";
import { atomsWithSelection } from "../shared-states";
import { isNotNullish } from "../type-helpers";

// import { PEDESTRIAN_LAYER } from "./layerTypes";
// import { type PedestrianLayerModel } from "./PedestrianLayer";

export const pixelRatioAtom = atom(1);

// TODO(ReEarth): Support selected feature
export const tilesetLayersAtom = atom(get =>
  get(rootLayersAtom).filter(layer => get(get(layer.rootLayerAtom).layer)),
);

export const tilesetLayersLayersAtom = atom(get =>
  get(rootLayersAtom).map(layer => get(get(layer.rootLayerAtom).layer)),
);

// export const pedestrianLayersAtom = atom(get =>
//   get(layersAtom).filter((layer): layer is PedestrianLayerModel => layer.type === PEDESTRIAN_LAYER),
// );

export const highlightedTilesetLayersAtom = atom(get => {
  const featureKeys = get(featureSelectionAtom).map(({ value }) => value);
  const tilesetLayers = get(tilesetLayersAtom);
  return tilesetLayers.filter(root => {
    const layer = get(get(root.rootLayerAtom).layer);
    if (!("featureIndexAtom" in layer)) {
      return;
    }
    const featureIndex = get(layer.featureIndexAtom);
    const features = featureIndex?.featureIds;
    return features && featureKeys.some(key => features.includes(key.key));
  });
});

// export const highlightedPedestrianLayersAtom = atom(get => {
//   const entityIds = get(pedestrianSelectionAtom).map(({ value }) => value);
//   const pedestrianLayers = get(pedestrianLayersAtom);
//   return pedestrianLayers.filter(layer => {
//     const id = compose({ type: "Pedestrian", key: layer.id });
//     return entityIds.some(entityId => entityId === id);
//   });
// });

export const highlightedLayersAtom = atom(get => {
  // TODO: Support other types of selection.
  return [...get(highlightedTilesetLayersAtom) /* ...get(highlightedPedestrianLayersAtom) */];
});

export const featureIndicesAtom = atom(get => {
  const layers = get(tilesetLayersAtom);
  return fromPairs(
    layers
      .map(root => {
        const layer = get(get(root.rootLayerAtom).layer);
        const layerId = get(layer.layerIdAtom);
        if (!("featureIndexAtom" in layer)) {
          return;
        }
        const featureIndex = get(layer.featureIndexAtom);
        return featureIndex != null ? [layerId, featureIndex] : undefined;
      })
      .filter(isNotNullish),
  );
});

// export const findFeaturesAtom = atom(null, (get, _set, key: string) => {
//   const indices = get(featureIndicesAtom);
//   for (const [layerId, index] of Object.entries(indices)) {
//     const features = index.find(key);
//     if (features != null) {
//       return { layerId, features };
//     }
//   }
//   return undefined;
// });

export const hideFeaturesAtom = atom(null, (get, set, value: readonly string[] | null) => {
  const layers = get(tilesetLayersAtom);
  layers.forEach(root => {
    const layer = get(get(root.rootLayerAtom).layer);
    if (!("hiddenFeaturesAtom" in layer)) {
      return;
    }
    const { layerIdAtom, hiddenFeaturesAtom } = layer;
    const layerId = get(layerIdAtom);
    invariant(layerId);
    const featureIndex = get(featureIndicesAtom)[layerId];
    const nextValue = value?.filter(value => featureIndex.has(value));
    set(hiddenFeaturesAtom, prevValue =>
      prevValue != null || nextValue != null
        ? uniq([...(prevValue ?? []), ...(nextValue ?? [])])
        : null,
    );
  });
});

export const showFeaturesAtom = atom(null, (get, set, value: readonly string[] | null) => {
  const layers = get(tilesetLayersAtom);
  layers.forEach(root => {
    const layer = get(get(root.rootLayerAtom).layer);
    if (!("hiddenFeaturesAtom" in layer)) {
      return;
    }
    const { hiddenFeaturesAtom } = layer;
    set(hiddenFeaturesAtom, prevValue => {
      if (value == null) {
        return null;
      }
      const nextValue = without(prevValue, ...value);
      return nextValue.length === prevValue?.length
        ? prevValue
        : nextValue.length > 0
        ? nextValue
        : null;
    });
  });
});

export const showAllFeaturesAtom = atom(null, (get, set) => {
  const layers = get(tilesetLayersAtom);
  layers.forEach(root => {
    const layer = get(get(root.rootLayerAtom).layer);
    if (!("hiddenFeaturesAtom" in layer)) {
      return;
    }
    const { hiddenFeaturesAtom } = layer;
    set(hiddenFeaturesAtom, null);
  });
});

const {
  selectionAtom: colorSchemeSelectionAtom,
  addAtom: addColorSchemeSelectionAtom,
  removeAtom: removeColorSchemeSelectionAtom,
  clearAtom: clearColorSchemeSelectionAtom,
} = atomsWithSelection<string>();

export {
  colorSchemeSelectionAtom,
  addColorSchemeSelectionAtom,
  removeColorSchemeSelectionAtom,
  clearColorSchemeSelectionAtom,
};

const {
  selectionAtom: imageSchemeSelectionAtom,
  addAtom: addImageSchemeSelectionAtom,
  removeAtom: removeImageSchemeSelectionAtom,
  clearAtom: clearImageSchemeSelectionAtom,
} = atomsWithSelection<string>();

export {
  imageSchemeSelectionAtom,
  addImageSchemeSelectionAtom,
  removeImageSchemeSelectionAtom,
  clearImageSchemeSelectionAtom,
};
