import { useTheme } from "@mui/material";
import { animate, type AnimationPlaybackControls } from "framer-motion";
import { type MultiPolygon, type Polygon } from "geojson";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, type FC, useState, useMemo } from "react";

import { useEstatAreaGeometry } from "../../../shared/graphql";
import { HighlightPolygonAppearances, HighlightPolygonLayer } from "../../../shared/reearth/layers";

export interface HighlightAreaOptions {
  areaId: string;
  duration?: number; // In seconds
}

const optionsArrayAtom = atom<HighlightAreaOptions[]>([]);

export const highlightAreaAtom = atom(null, (_get, set, options: HighlightAreaOptions) => {
  set(optionsArrayAtom, prevValue =>
    prevValue.every(({ areaId }) => areaId !== options.areaId)
      ? [...prevValue, options]
      : prevValue,
  );
});

const unhighlightAreaAtom = atom(null, (_get, set, areaId: string) => {
  set(optionsArrayAtom, prevValue => {
    const nextValue = prevValue.filter(options => options.areaId !== areaId);
    return nextValue.length !== prevValue.length ? nextValue : prevValue;
  });
});

const HighlightedArea: FC<{
  areaId: string;
  opacity?: number;
  duration?: number;
}> = ({ areaId, opacity = 0.5, duration = 5 }) => {
  const { data, loading } = useEstatAreaGeometry({ areaId });

  const unhighlightArea = useSetAtom(unhighlightAreaAtom);
  useEffect(() => {
    if (!loading && data == null) {
      unhighlightArea(areaId);
    }
  }, [areaId, data, loading, unhighlightArea]);

  const [opacityMotion, setOpacityMotion] = useState(opacity);
  useEffect(() => {
    if (loading || data == null) {
      return;
    }
    let controls: AnimationPlaybackControls | undefined;
    const timeout = setTimeout(() => {
      controls = animate(opacity, 0, {
        duration: 0.5,
        onUpdate: value => {
          setOpacityMotion(value);
        },
        onComplete: () => {
          unhighlightArea(areaId);
        },
      });
    }, duration * 1000);
    return () => {
      clearTimeout(timeout);
      controls?.stop();
    };
  }, [areaId, data, loading, opacity, duration, unhighlightArea]);

  const theme = useTheme();

  const geometry: Polygon | MultiPolygon = data?.estatAreaGeometry?.geometry;

  const appearances: HighlightPolygonAppearances = useMemo(
    () => ({
      polygon: {
        fill: true,
        fillColor: theme.palette.primary.main + Math.floor(opacityMotion * 255).toString(16),
      },
    }),
    [theme, opacityMotion],
  );

  if (geometry == null) {
    return null;
  }
  return <HighlightPolygonLayer appearances={appearances} geometry={geometry} />;
};

export const HighlightedAreas: FC = () => {
  const optionsArray = useAtomValue(optionsArrayAtom);
  return (
    <>
      {optionsArray.map(options => (
        <HighlightedArea key={options.areaId} {...options} />
      ))}
    </>
  );
};
