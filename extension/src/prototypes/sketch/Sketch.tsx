import { type Feature } from "geojson";
import { useAtomValue, type PrimitiveAtom } from "jotai";
import { useMemo, type FC } from "react";

import { SketchLayer } from "../../shared/reearth/layers/sketch";
import { LayerAppearanceTypes } from "../../shared/reearth/types";

import { SketchObject } from "./SketchObject";
import { type SketchFeature } from "./types";

type DrawableFeature = SketchFeature & {
  properties: {
    extrudedHeight: number;
  };
};

function isDrawableFeature(feature: Feature): feature is DrawableFeature {
  return (
    (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") &&
    typeof feature.properties?.extrudedHeight === "number"
  );
}

export interface SketchProps {
  featuresAtom: PrimitiveAtom<SketchFeature[]>;
  onLoad: (layerId: string) => void;
}

export const Sketch: FC<SketchProps> = ({ featuresAtom, onLoad }) => {
  const features = useAtomValue(featuresAtom);

  const appearances: Partial<LayerAppearanceTypes> = useMemo(
    () => ({
      marker: {
        height: 0,
        heightReference: "clamp",
        hideIndicator: true,
        selectedFeatureColor: "#00bebe",
      },
      polygon: {
        classificationType: "terrain",
        extrudedHeight: {
          expression: "${extrudedHeight}",
        },
        fillColor: "#FFFFFF",
        heightReference: "clamp",
        hideIndicator: true,
        selectedFeatureColor: "#00bebe",
        shadows: "enabled",
      },
      polyline: {
        clampToGround: true,
        hideIndicator: true,
        selectedFeatureColor: "#00bebe",
        shadows: "enabled",
        strokeColor: "#FFFFFF",
        strokeWidth: 2,
      },
    }),
    [],
  );

  return (
    <>
      {features.map(
        (feature, index) =>
          isDrawableFeature(feature) && (
            <SketchObject
              key={index}
              id={feature.properties.id}
              geometry={feature.geometry}
              extrudedHeight={feature.properties.extrudedHeight}
            />
          ),
      )}
      <SketchLayer appearances={appearances} features={features} onLoad={onLoad} />
    </>
  );
};
