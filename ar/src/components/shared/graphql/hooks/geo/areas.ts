import { useQuery } from "@apollo/client";

import { CAMERA_AREAS } from "../../base/geo/queries/areas";

import { useLazyQuery } from "./base";

export const useCameraAreasLazy = ({
  longitude,
  latitude,
  includeRadii,
}: {
  longitude: number;
  latitude: number;
  includeRadii?: boolean;
}) => {
  return useLazyQuery(CAMERA_AREAS, {
    variables: {
      longitude,
      latitude,
      includeRadii,
    },
  });
};

export const useCameraAreas = ({
  longitude,
  latitude,
  includeRadii,
}: {
  longitude: number;
  latitude: number;
  includeRadii?: boolean;
}) => {
  return useQuery(CAMERA_AREAS, {
    variables: {
      longitude,
      latitude,
      includeRadii,
    },
  });
};
