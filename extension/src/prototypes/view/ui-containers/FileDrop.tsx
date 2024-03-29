import { alpha, styled, useTheme } from "@mui/material";
import { geojsonType } from "@turf/invariant";
import { animate, motion, useMotionValue, useTransform, type MotionStyle } from "framer-motion";
import { type Feature, type FeatureCollection, type MultiPolygon, type Polygon } from "geojson";
import { useAtomValue } from "jotai";
import { nanoid } from "nanoid";
import { useEffect, useState, type FC } from "react";

import { createRootLayerForLayerAtom } from "../../../shared/view-layers";
import { LayerModelOverrides, useAddLayer } from "../../layers";
import { SKETCH_LAYER } from "../../view-layers";
import { showMyDataModalAtom } from "../states/app";

const Root = styled(motion.div)({
  position: "absolute",
  width: "100vw",
  height: "100vh",
  inset: 0,
});

function useBackgroundStyle({ visible = true }: { visible: boolean }): MotionStyle {
  const opacity = useMotionValue(0);
  useEffect(() => {
    if (visible) {
      return animate(opacity, 0.2, {
        type: "tween",
        duration: 0.5,
      }).stop;
    } else {
      return animate(opacity, 0, {
        type: "tween",
        duration: 0.5,
      }).stop;
    }
  }, [visible, opacity]);

  const theme = useTheme();
  const backgroundColor = useTransform(opacity, opacity =>
    alpha(theme.palette.text.primary, opacity),
  );
  const backdropFilter = useTransform(opacity, opacity =>
    opacity > 0 ? `blur(${opacity * 64}px)` : "none",
  );
  const visibility = useTransform(opacity, opacity => (opacity > 0 ? "visible" : "hidden"));

  return {
    visibility,
    backgroundColor,
    backdropFilter,
    WebkitBackdropFilter: backdropFilter,
  };
}

export const FileDrop: FC = () => {
  const [visible, setActive] = useState(false);

  const addLayer = useAddLayer();

  const showMyDataModal = useAtomValue(showMyDataModalAtom);

  useEffect(() => {
    let enterCount = 0;

    const handleDragEnter = (): void => {
      setActive(++enterCount > 0);
    };

    const handleDragLeave = (): void => {
      setActive(--enterCount > 0);
    };

    const handleDragOver = (event: DragEvent): void => {
      event.preventDefault();
    };

    const handleDrop = (event: DragEvent): void => {
      event.preventDefault();
      enterCount = 0;
      setActive(false);

      if (showMyDataModal) {
        return;
      }

      const item = event.dataTransfer?.items[0];
      if (item?.kind !== "file") {
        return;
      }
      const file = item.getAsFile();
      if (file == null) {
        return;
      }
      file
        .text()
        .then(text => {
          const data = JSON.parse(text);
          geojsonType(data, "FeatureCollection", "FileDrop");
          const featureCollection = data as FeatureCollection;
          const id = nanoid();
          const features = featureCollection.features.filter(
            (feature): feature is Feature<Polygon | MultiPolygon> =>
              feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon",
          );
          const layer = {
            id,
            type: SKETCH_LAYER as keyof LayerModelOverrides,
            features: features.map(feature => ({
              ...feature,
              properties: {
                ...(feature.properties ?? {}),
                // TODO: This always overrides IDs to avoid conflicts.
                id: nanoid(),
              },
            })),
          };
          addLayer(createRootLayerForLayerAtom({ ...layer }));
        })
        .catch(error => {
          console.error(error);
        });
    };

    document.addEventListener("dragenter", handleDragEnter, false);
    document.addEventListener("dragleave", handleDragLeave, false);
    document.addEventListener("dragover", handleDragOver, false);
    document.addEventListener("drop", handleDrop, false);
    return () => {
      document.removeEventListener("dragenter", handleDragEnter, false);
      document.removeEventListener("dragleave", handleDragLeave, false);
      document.removeEventListener("dragover", handleDragOver, false);
      document.removeEventListener("drop", handleDrop, false);
    };
  }, [addLayer, showMyDataModal]);

  const style = useBackgroundStyle({ visible });
  return <Root style={style} />;
};
