import { useDraggable } from "@dnd-kit/core";
import { useTheme } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import {
  useEffect,
  useMemo,
  type FC,
  useState,
  useRef,
  useCallback,
  SetStateAction,
  Dispatch,
  MouseEvent,
} from "react";

import { useReEarthEvent } from "../../shared/reearth/hooks";
import { PedestrianMarkerAppearances, PedestrianMarkerLayer } from "../../shared/reearth/layers";
import { XYZ } from "../../shared/reearth/types";
import { ScreenSpaceElement } from "../cesium";

import balloonImage from "./assets/balloon.png";
import iconImage from "./assets/icon.png";
import { computeCartographicToCartesian } from "./computeCartographicToCartesian";
import { LevitationCircle } from "./LevitationCircle";
import { type Location } from "./types";
import { useMotionPosition } from "./useMotionPosition";

function preventDefault(event: MouseEvent): void {
  event.preventDefault();
}
interface SensorProps {
  id: string;
  position: XYZ;
  offset: XYZ | undefined;
  setOffset: Dispatch<SetStateAction<XYZ | undefined>>;
}

const Sensor: FC<SensorProps> = ({ id, position, offset, setOffset }) => {
  const { setNodeRef, transform, listeners } = useDraggable({
    id,
    data: offset,
  });

  const [trigger, setTrigger] = useState({});
  useReEarthEvent("mousemove", () => {
    // Deffer the trigger for performance
    requestAnimationFrame(() => {
      setTrigger({});
    });
  });

  useEffect(() => {
    if (transform != null) {
      const [x, y, z] = window.reearth?.scene?.convertScreenToPositionOffset(
        [position.x, position.y, position.z],
        [transform.x, transform.y],
      ) ?? [0, 0, 0];
      setOffset({
        x,
        y,
        z,
      });
    } else {
      setOffset({ x: 0, y: 0, z: 0 });
    }
  }, [position, transform, setOffset, trigger]);

  return (
    <ScreenSpaceElement
      ref={setNodeRef}
      position={position}
      trigger={trigger}
      style={{
        width: 32,
        height: 32,
        top: -16 + (transform?.y ?? 0),
        left: 16 + (transform?.x ?? 0),
        cursor: "pointer",
        pointerEvents: "auto",
      }}
      {...listeners}
      onContextMenu={preventDefault}
    />
  );
};

export interface PedestrianObjectProps {
  id: string;
  location: Location;
  selected?: boolean;
  levitated?: boolean;
}

export const PedestrianObject: FC<PedestrianObjectProps> = ({
  id,
  location,
  selected = false,
  levitated = true,
}) => {
  const theme = useTheme();

  const balloonAppearance: PedestrianMarkerAppearances = useMemo(
    () => ({
      marker: {
        image: balloonImage,
        imageSize: 0.5,
        pixelOffset: [16, -16],
        heightReference: "relative",
        near: 10,
        fat: 1e4,
        eyeOffset: [0, 0, -10],
        imageColor: selected ? theme.palette.primary.main : "#000000",
      },
    }),
    [selected, theme],
  );
  const iconAppearance: PedestrianMarkerAppearances = useMemo(
    () => ({
      marker: {
        image: iconImage,
        imageSize: 0.5,
        pixelOffset: [16, -16],
        heightReference: "relative",
        near: 10,
        fat: 1e4,
        // WORKAROUND: Render front of balloon.
        eyeOffset: [0, 0, -10.1],
      },
    }),
    [],
  );

  const balloonLayerIdRef = useRef<string>();
  const iconLayerIdRef = useRef<string>();

  const handleLoadBalloonLayer = useCallback((layerId?: string) => {
    balloonLayerIdRef.current = layerId;
  }, []);
  const handleLoadIconLayer = useCallback((layerId?: string) => {
    iconLayerIdRef.current = layerId;
  }, []);

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

  // TODO(ReEarth): Improve the animation model to update the position internally.
  const [offset, setOffset] = useState<XYZ | undefined>();

  const coordinates = useMemo(() => {
    const { x: offsetX, y: offsetY, z: offsetZ } = offset ?? { x: 0, y: 0, z: 0 };
    const position = animatedPosition;

    const nextPosition = [
      position[0] + offsetX,
      position[1] + offsetY,
      position[2] + offsetZ,
    ] as const;
    const [lng, lat] = window.reearth?.scene?.toLngLatHeight(...nextPosition, {
      useGlobeEllipsoid: true,
    }) ?? [0, 0, 0];
    return [lng, lat, location.height ?? 0] as [lng: number, lat: number, height: number];
  }, [animatedPosition, offset, location]);

  return (
    <>
      {selected && <Sensor id={id} position={position} offset={offset} setOffset={setOffset} />}
      <PedestrianMarkerLayer
        id={id}
        coordinates={coordinates}
        appearances={balloonAppearance}
        onLoad={handleLoadBalloonLayer}
        useTransition={selected}
      />
      <PedestrianMarkerLayer
        id={id}
        coordinates={coordinates}
        appearances={iconAppearance}
        onLoad={handleLoadIconLayer}
        useTransition={selected}
      />
      <AnimatePresence>
        {levitated && <LevitationCircle motionPosition={motionPosition} offset={offset} />}
      </AnimatePresence>
    </>
  );
};
