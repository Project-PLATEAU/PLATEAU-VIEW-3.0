import { atom, useAtomValue } from "jotai";
import { isEqual } from "lodash-es";
import { useEffect, useMemo, useRef } from "react";

import { parseIdentifier } from "../../prototypes/cesium-helpers";
import { sketchSelectionAtom } from "../../prototypes/sketch";
import { sketchLayersAtom } from "../../prototypes/view-layers";

const selectedSketchLayersAtom = atom(get => {
  const entityIds = get(sketchSelectionAtom).map(({ value }) => parseIdentifier(value).key);
  const sketchLayers = get(sketchLayersAtom);
  const layers: { layerId: string; featureId: string[] }[] = [];
  sketchLayers.forEach(layer => {
    const features = get(layer.featuresAtom);
    const layerId = get(layer.layerIdAtom);
    if (!layerId) return;
    const selectedFeatureIds = features
      .filter(f => entityIds.includes(f.properties.id))
      .map(f => String(f.properties.id));
    if (selectedFeatureIds.length) {
      layers.push({ layerId, featureId: selectedFeatureIds });
    }
  });
  return layers;
});

export const useSelectSketchFeature = () => {
  const selectedSketchLayers = useAtomValue(selectedSketchLayersAtom);
  const sketchSelection = useAtomValue(sketchSelectionAtom);
  const hasSketchFeatureSelected = useMemo(() => {
    return sketchSelection.length > 0;
  }, [sketchSelection]);

  const prevLayersRef = useRef(selectedSketchLayers);
  useEffect(() => {
    if (!hasSketchFeatureSelected || isEqual(prevLayersRef.current, selectedSketchLayers)) return;
    requestAnimationFrame(() => {
      window.reearth?.layers?.selectFeatures?.(selectedSketchLayers);
      prevLayersRef.current = selectedSketchLayers;
    });
  }, [hasSketchFeatureSelected, selectedSketchLayers]);
};
