import {
  atom,
  useAtom,
  useAtomValue,
  useSetAtom,
  type PrimitiveAtom,
  type SetStateAction,
} from "jotai";
import { useCallback, useEffect, type FC } from "react";
import invariant from "tiny-invariant";

import { useCameraAreas } from "../../shared/graphql";
import { XYZ } from "../../shared/reearth/types";
import { makeComponentAtomWrapper } from "../../shared/view-layers/component";
import { type LayerProps } from "../layers";
import { Pedestrian, type HeadingPitch, type Location } from "../pedestrian";

import {
  createViewLayerModel,
  type ViewLayerModel,
  type ViewLayerModelParams,
} from "./createViewLayerModel";
import { PEDESTRIAN_LAYER } from "./layerTypes";
import { type ConfigurableLayerModel } from "./types";

let nextLayerIndex = 1;

export interface PedestrianLayerModelParams extends ViewLayerModelParams {
  location?: Location;
  headingPitchAtom?: HeadingPitch;
  zoomAtom?: number;
  shouldInitializeAtom?: boolean;
  shareId?: string;
}

export interface PedestrianLayerModel extends ViewLayerModel {
  panoAtom: PrimitiveAtom<string | null>;
  locationAtom: PrimitiveAtom<Location>;
  headingPitchAtom: PrimitiveAtom<HeadingPitch | null>;
  zoomAtom: PrimitiveAtom<number | null>;
  synchronizedAtom: PrimitiveAtom<boolean>;
  addressAtom: PrimitiveAtom<string | null>;
}

export type SharedPedestrianLayer = {
  type: "pedestrian";
  id: string;
};

export function createPedestrianLayer(
  params: PedestrianLayerModelParams,
): ConfigurableLayerModel<PedestrianLayerModel> {
  invariant(params.id);

  const locationPrimitiveAtom = atom<Location>({
    longitude: params.location?.longitude ?? 0,
    latitude: params.location?.latitude ?? 0,
    height: 2.5,
  });
  const locationAtom = makeComponentAtomWrapper(
    atom(
      get => get(locationPrimitiveAtom),
      (get, set, value: SetStateAction<Location>) => {
        const prevValue = get(locationPrimitiveAtom);
        const nextValue = typeof value === "function" ? value(prevValue) : value;
        if (
          nextValue.longitude !== prevValue.longitude ||
          nextValue.latitude !== prevValue.latitude ||
          nextValue.height !== prevValue.height
        ) {
          set(locationPrimitiveAtom, nextValue);
        }
      },
    ),
    { ...params, datasetId: params.id, componentType: "location" },
    false,
    { shouldInitialize: params.shouldInitializeAtom },
  );

  const headingPitchPrimitiveAtom = atom<HeadingPitch | null>(params.headingPitchAtom ?? null);
  const headingPitchAtom = makeComponentAtomWrapper(
    atom(
      get => get(headingPitchPrimitiveAtom),
      (get, set, value: SetStateAction<HeadingPitch | null>) => {
        const prevValue = get(headingPitchAtom);
        const nextValue = typeof value === "function" ? value(prevValue) : value;
        if (nextValue?.heading !== prevValue?.heading || nextValue?.pitch !== prevValue?.pitch) {
          set(headingPitchPrimitiveAtom, nextValue);
        }
      },
    ),
    { ...params, datasetId: params.id, componentType: "headingPitch" },
    false,
    { shouldInitialize: params.shouldInitializeAtom },
  );

  const zoomPrimitiveAtom = makeComponentAtomWrapper(
    atom<number | null>(params.zoomAtom ?? null),
    { ...params, datasetId: params.id, componentType: "zoom" },
    false,
    { shouldInitialize: params.shouldInitializeAtom },
  );

  return {
    ...createViewLayerModel({
      ...params,
      // TODO: Avoid side-effect
      title: `歩行者視点${nextLayerIndex++}`,
    }),
    type: PEDESTRIAN_LAYER,
    panoAtom: atom<string | null>(null),
    locationAtom,
    headingPitchAtom,
    zoomAtom: zoomPrimitiveAtom,
    synchronizedAtom: atom(false),
    addressAtom: atom<string | null>(null),
  };
}

export const PedestrianLayer: FC<LayerProps<typeof PEDESTRIAN_LAYER>> = ({
  id,
  titleAtom,
  hiddenAtom,
  boundingSphereAtom,
  panoAtom,
  locationAtom,
  headingPitchAtom,
  zoomAtom,
  synchronizedAtom,
  addressAtom,
}) => {
  const [pano, setPano] = useAtom(panoAtom);
  const location = useAtomValue(locationAtom);
  const setLocation = useSetAtom(locationAtom);
  const headingPitch = useAtomValue(headingPitchAtom);
  const zoom = useAtomValue(zoomAtom);
  const synchronized = useAtomValue(synchronizedAtom);

  const handleChange = useCallback(
    (location: Location) => {
      setPano(null);
      setLocation(location);
    },
    [setPano, setLocation],
  );

  const setBoundingSphere = useSetAtom(boundingSphereAtom);
  useEffect(() => {
    const groundHeight =
      window.reearth?.scene?.computeGlobeHeight?.(location.longitude, location.latitude) ?? 0;
    const [x, y, z] = window.reearth?.scene?.toXYZ(
      location.longitude,
      location.latitude,
      groundHeight + (location.height ?? 0),
      { useGlobeEllipsoid: true },
    ) ?? [0, 0, 0];
    const boundingSphere: XYZ = {
      x,
      y,
      z,
      radius: 200,
    };
    setBoundingSphere(boundingSphere);
  }, [location, setBoundingSphere]);

  const setTitle = useSetAtom(titleAtom);
  const setAddress = useSetAtom(addressAtom);
  const { data: address } = useCameraAreas({
    longitude: location.longitude,
    latitude: location.latitude,
  });
  useEffect(() => {
    setTitle(title => {
      const primary = typeof title === "string" ? title : title?.primary;
      invariant(primary != null);
      return {
        primary,
        secondary: address?.areas?.address,
      };
    });
    setAddress(address?.areas?.address ?? null);
  }, [setTitle, setAddress, address]);

  const hidden = useAtomValue(hiddenAtom);
  if (hidden) {
    return null;
  }
  return (
    <Pedestrian
      id={id}
      location={location}
      headingPitch={headingPitch ?? undefined}
      zoom={zoom ?? undefined}
      hideFrustum={pano == null || synchronized}
      onChange={handleChange}
    />
  );
};
