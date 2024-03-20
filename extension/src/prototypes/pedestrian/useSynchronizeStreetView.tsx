import { animate, motionValue, ValueAnimationTransition } from "framer-motion";
import { atom, type PrimitiveAtom, type SetStateAction } from "jotai";
import { debounce } from "lodash-es";
import { useMemo, useRef } from "react";

import { CameraPosition } from "../../shared/reearth/types";
import { flyToCamera, setView } from "../../shared/reearth/utils";

import { computeCartographicToCartesian } from "./computeCartographicToCartesian";
import { getFieldOfView } from "./getFieldOfView";
import { type HeadingPitch, type Location } from "./types";

export interface StreetViewStateParams {
  locationAtom: PrimitiveAtom<Location>;
  headingPitchAtom: PrimitiveAtom<HeadingPitch | null>;
  zoomAtom: PrimitiveAtom<number | null>;
  synchronizedAtom: PrimitiveAtom<boolean>;
}

export interface StreetViewState {
  locationAtom: PrimitiveAtom<Location>;
  headingPitchAtom: PrimitiveAtom<HeadingPitch | null>;
  zoomAtom: PrimitiveAtom<number | null>;
  synchronizedAtom: PrimitiveAtom<boolean>;
}

const setCameraXYZ = (x: number, y: number, z: number) => {
  const [lng, lat, height] = window.reearth?.scene?.toLngLatHeight(x, y, z) ?? [0, 0, 0];
  setView({
    lng,
    lat,
    height,
  });
};

const RADIANS_PER_DEGREE = Math.PI / 180.0;

export function useSynchronizeStreetView(params: StreetViewStateParams): StreetViewState {
  const paramsRef = useRef(params);
  paramsRef.current = params;

  return useMemo(() => {
    const locationAtom = atom(
      get => get(paramsRef.current.locationAtom),
      (get, set, value: SetStateAction<Location>) => {
        const params = paramsRef.current;
        const prevValue = get(params.locationAtom);
        const nextValue = typeof value === "function" ? value(prevValue) : value;
        set(params.locationAtom, nextValue);

        const synchronized = get(params.synchronizedAtom);
        if (nextValue == null) {
          return;
        }
        if (synchronized) {
          if (prevValue != null) {
            const prevPosition = computeCartographicToCartesian(prevValue);
            const motionX = motionValue(prevPosition.x);
            const motionY = motionValue(prevPosition.y);
            const motionZ = motionValue(prevPosition.z);

            const options: ValueAnimationTransition<number> = {
              type: "tween",
              ease: "easeInOut",
              duration: 0.3,
              onUpdate: debounce(() => {
                setCameraXYZ(motionX.get(), motionY.get(), motionZ.get());
              }),
            };

            const nextPosition = computeCartographicToCartesian(nextValue);
            void animate(motionX, nextPosition.x, options);
            void animate(motionY, nextPosition.y, options);
            void animate(motionZ, nextPosition.z, options);
          } else {
            const { x, y, z } = computeCartographicToCartesian(nextValue);
            setCameraXYZ(x, y, z);
          }
        }
      },
    );

    const headingPitchAtom = atom(
      get => get(paramsRef.current.headingPitchAtom),
      (get, set, value: SetStateAction<HeadingPitch | null>) => {
        const params = paramsRef.current;
        const prevValue = get(params.headingPitchAtom);
        const nextValue = typeof value === "function" ? value(prevValue) : value;
        set(params.headingPitchAtom, nextValue);

        const synchronized = get(params.synchronizedAtom);
        if (nextValue == null) {
          return;
        }
        if (synchronized) {
          setView({
            heading: nextValue.heading * RADIANS_PER_DEGREE,
            pitch: nextValue.pitch * RADIANS_PER_DEGREE,
          });
        }
      },
    );

    const zoomAtom = atom(
      get => get(paramsRef.current.zoomAtom),
      (get, set, value: SetStateAction<number | null>) => {
        const params = paramsRef.current;
        const prevValue = get(params.zoomAtom);
        const nextValue = typeof value === "function" ? value(prevValue) : value;
        set(params.zoomAtom, nextValue);

        const camera = window.reearth?.camera?.position;

        const synchronized = get(params.synchronizedAtom);
        if (nextValue == null || !camera) {
          return;
        }
        if (synchronized) {
          setView({
            fov: getFieldOfView(camera, nextValue),
          });
        }
      },
    );

    const cameraStateAtom = atom<CameraPosition | null>(null);

    const synchronizedAtom = atom(
      get => get(paramsRef.current.synchronizedAtom),
      (get, set, value: SetStateAction<boolean>) => {
        const params = paramsRef.current;
        const prevValue = get(params.synchronizedAtom);
        const nextValue = typeof value === "function" ? value(prevValue) : value;
        set(params.synchronizedAtom, nextValue);

        const camera = window.reearth?.camera?.position;
        if (!camera) {
          return;
        }
        if (nextValue) {
          // Remember the current camera's heading, pitch and roll to restore
          // them later.
          set(cameraStateAtom, camera);

          const location = get(params.locationAtom);
          const headingPitch = get(params.headingPitchAtom);
          const zoom = get(params.zoomAtom);
          if (location == null || headingPitch == null || zoom == null) {
            return;
          }
          const position = computeCartographicToCartesian(location);
          const [lng, lat, height] = window.reearth?.scene?.toLngLatHeight(
            position.x,
            position.y,
            position.z,
            { useGlobeEllipsoid: true },
          ) ?? [0, 0, 0];
          void flyToCamera({
            lng,
            lat,
            height,
            heading: headingPitch.heading * RADIANS_PER_DEGREE,
            pitch: headingPitch.pitch * RADIANS_PER_DEGREE,
            fov: getFieldOfView(camera, zoom),
          });
        } else {
          const state = get(cameraStateAtom);
          if (state == null) {
            console.warn("Camera state before synchronization unexpectedly not found.");
            return;
          }
          void flyToCamera(state);
        }
      },
    );

    return {
      synchronizedAtom,
      locationAtom,
      headingPitchAtom,
      zoomAtom,
    };
  }, []);
}
