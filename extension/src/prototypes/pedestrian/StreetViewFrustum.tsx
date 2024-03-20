import { useTheme } from "@mui/material";
import { animate, useMotionValue, usePresence } from "framer-motion";
import { useEffect, type FC, useMemo, useCallback, useState, useRef } from "react";

import { PedestrianFrustumAppearances, PedestrianFrustumLayer } from "../../shared/reearth/layers";

import { computeCartographicToCartesian } from "./computeCartographicToCartesian";
import { type HeadingPitch, type Location } from "./types";
import { useMotionPosition } from "./useMotionPosition";

interface StreetViewFrustumProps {
  location: Location;
  headingPitch: HeadingPitch;
  zoom: number;
  aspectRatio?: number;
  length?: number;
}

export const StreetViewFrustum: FC<StreetViewFrustumProps> = ({
  location,
  headingPitch,
  zoom,
  aspectRatio = 3 / 2,
  length = 200,
}) => {
  const theme = useTheme();

  const [ready, setReady] = useState(false);
  const handleLoad = useCallback(() => {
    setReady(true);
  }, []);

  const motionVisibility = useMotionValue(0);
  const [present, safeToRemove] = usePresence();
  const safeToRemoveRef = useRef(safeToRemove);
  safeToRemoveRef.current = safeToRemove;
  useEffect(() => {
    if (!ready) return;
    return animate(motionVisibility, present ? 1 : 0, {
      type: "tween",
      ease: "easeOut",
      duration: 0.2,
      onComplete: () => {
        if (!present) {
          safeToRemoveRef.current?.();
        }
      },
    }).stop;
  }, [present, motionVisibility, ready]);

  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    return motionVisibility.on("change", () => {
      const next = motionVisibility.get();
      requestAnimationFrame(() => {
        setOpacity(next);
      });
    });
  }, [motionVisibility]);

  const position = useMemo(() => computeCartographicToCartesian(location), [location]);
  const motionPosition = useMotionPosition(position);

  useEffect(() => {
    return motionPosition.animatePosition(position);
  }, [position, motionPosition]);

  const [animatedPosition, setAnimatedPosition] = useState([position.x, position.y, position.z] as [
    number,
    number,
    number,
  ]);
  useEffect(() => {
    return motionPosition.on("renderRequest", () => {
      const next = motionPosition.get();
      requestAnimationFrame(() => {
        setAnimatedPosition(prev =>
          prev[0] === next[0] && prev[1] === next[1] && prev[2] === next[2] ? prev : [...next],
        );
      });
    });
  }, [motionPosition]);

  const coordinates = useMemo(() => {
    return (window.reearth?.scene?.toLngLatHeight(...animatedPosition, {
      useGlobeEllipsoid: true,
    }) ?? [0, 0, 0]) as [lng: number, lat: number, height: number];
  }, [animatedPosition]);
  const frustumAppearance: PedestrianFrustumAppearances = useMemo(
    () => ({
      frustum: {
        color: theme.palette.primary.main,
        opacity,
        zoom,
        length,
        aspectRatio,
      },
      transition: {
        rotate: [headingPitch.heading, headingPitch.pitch, 0],
      },
    }),
    [theme, zoom, length, aspectRatio, headingPitch, opacity],
  );

  return (
    <PedestrianFrustumLayer
      useTransition
      coordinates={coordinates}
      appearances={frustumAppearance}
      onLoad={handleLoad}
    />
  );
};
