import { atom, useAtomValue } from "jotai";
import { isEqual } from "lodash-es";
import { useEffect, useMemo, useRef } from "react";

import { screenSpaceSelectionAtom } from "../../prototypes/screen-space-selection";
import { isNotNullish } from "../../prototypes/type-helpers";
import { tilesetLayersLayersAtom } from "../../prototypes/view-layers";

export const useAttachScreenSpaceSelection = () => {
  const selections = useAtomValue(screenSpaceSelectionAtom);

  // Highlight from building search functionality
  const tilesetLayers = useAtomValue(tilesetLayersLayersAtom);
  const tilesetLayersSelections = useAtomValue(
    useMemo(
      () =>
        atom(get =>
          tilesetLayers
            .map(l => {
              if (!("searchedFeaturesAtom" in l)) return;
              const searchedFeatures = get(l.searchedFeaturesAtom);
              const layerId = get(l.layerIdAtom);
              return (searchedFeatures?.highlight || !!searchedFeatures?.selectedIndices.length) &&
                layerId
                ? {
                    layerId,
                    featureId: searchedFeatures.highlight
                      ? searchedFeatures.features
                      : searchedFeatures.selectedIndices.map(i => searchedFeatures.features[i]),
                  }
                : undefined;
            })
            .filter(isNotNullish),
        ),
      [tilesetLayers],
    ),
  );

  const selectionsLayers = useMemo(
    () =>
      selections.reduce((res, s) => {
        if (typeof s?.value === "string") return res;
        const layerId = s.value.layerId;
        let layerIndex = res.findIndex(v => v.layerId === layerId);
        if (layerIndex === -1) {
          layerIndex =
            res.push({
              layerId: s.value.layerId,
              featureId: [],
            }) - 1;
        }
        res[layerIndex].featureId.push(s.value.key);
        return res;
      }, [] as { layerId: string; featureId: string[] }[]),
    [selections],
  );

  const layers = useMemo(
    () =>
      tilesetLayersSelections.reduce(
        (res, t) => {
          let layerIndex = res.findIndex(v => v.layerId === t.layerId);
          if (layerIndex === -1) {
            layerIndex =
              res.push({
                layerId: t.layerId,
                featureId: [],
              }) - 1;
          }
          res[layerIndex].featureId = res[layerIndex].featureId.concat(t.featureId);
          return res;
        },
        [...selectionsLayers],
      ),
    [tilesetLayersSelections, selectionsLayers],
  );

  const isTileset = useMemo(() => {
    const s = selections[0];
    if (typeof s?.value === "string") return false;
    const selectedLayerId = s?.value?.layerId;
    if (!selectedLayerId) return true;
    const layer = window.reearth?.layers?.findById?.(s?.value?.layerId);
    if (layer?.type !== "simple" || !layer.data?.type) return true;
    return layer.data.type === "3dtiles";
  }, [selections]);

  const prevLayersRef = useRef(layers);
  useEffect(() => {
    if (isEqual(prevLayersRef.current, layers) || !isTileset) return;
    requestAnimationFrame(() => {
      window.reearth?.layers?.selectFeatures?.(layers);
      prevLayersRef.current = layers;
    });
  }, [layers, isTileset]);
};
