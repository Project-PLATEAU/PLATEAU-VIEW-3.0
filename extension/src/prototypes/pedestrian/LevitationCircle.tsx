import { useTheme } from "@mui/material";
import { animate, useMotionValue, usePresence } from "framer-motion";
import { useMemo, type FC, useEffect, useState, useRef } from "react";

import {
  PedestrianEllipseAppearances,
  PedestrianEllipseLayer,
} from "../../shared/reearth/layers/pedestrian/ellipse";
import { XYZ } from "../../shared/reearth/types";
import { hexToRGBArray } from "../../shared/utils";

import { type MotionPosition } from "./useMotionPosition";

export interface LevitationCircleProps {
  motionPosition: MotionPosition;
  offset?: XYZ;
  radius?: number;
}

export const LevitationCircle: FC<LevitationCircleProps> = ({
  motionPosition,
  offset,
  radius = 100,
}) => {
  const motionLevitation = useMotionValue(0);
  const [present, safeToRemove] = usePresence();
  const safeToRemoveRef = useRef(safeToRemove);
  safeToRemoveRef.current = safeToRemove;
  useEffect(() => {
    return animate(motionLevitation, present ? 1 : 0, {
      type: "tween",
      duration: 0.2,
      onComplete: () => {
        if (!present) {
          safeToRemoveRef.current?.();
        }
      },
    }).stop;
  }, [motionLevitation, present]);

  const [levitation, setLevitation] = useState(0);
  useEffect(() => {
    return motionLevitation.on("change", latest => {
      setLevitation(latest);
    });
  }, [motionLevitation]);

  const [trigger, setTrigger] = useState({});
  useEffect(() => {
    return motionPosition.on("renderRequest", () => {
      requestAnimationFrame(() => {
        setTrigger({});
      });
    });
  }, [motionPosition]);

  const coordinates = useMemo(() => {
    const [posX, posY, posZ] = motionPosition.get();
    const nextPosition = [
      posX + (offset?.x || 0),
      posY + (offset?.y || 0),
      posZ + (offset?.z || 0),
    ] as const;
    if (nextPosition.every(v => v === 0)) {
      // Entity requires non-zero magnitude position.
      return undefined;
    }
    const result = window.reearth?.scene?.toLngLatHeight?.(
      posX + (offset?.x || 0),
      posY + (offset?.y || 0),
      posZ + (offset?.z || 0),
      { useGlobeEllipsoid: true },
    ) ?? [0, 0, 0];
    return result;
  }, [trigger, motionPosition, offset]); // eslint-disable-line react-hooks/exhaustive-deps

  const semiAxisProperty = useMemo(() => Math.max(0.1, levitation * radius), [radius, levitation]);

  const theme = useTheme();

  const color = useMemo(() => {
    const rgb = hexToRGBArray(theme.palette.primary.main);
    return `rgba(${[...rgb, 0.2].join(",")})`;
  }, [theme]);

  const appearances: PedestrianEllipseAppearances = useMemo(
    () => ({
      ellipse: {
        radius: semiAxisProperty,
        fill: true,
        fillColor: color,
        classificationType: "both",
      },
    }),
    [color, semiAxisProperty],
  );

  return coordinates ? (
    <PedestrianEllipseLayer useTransition appearances={appearances} coordinates={coordinates} />
  ) : null;
};
