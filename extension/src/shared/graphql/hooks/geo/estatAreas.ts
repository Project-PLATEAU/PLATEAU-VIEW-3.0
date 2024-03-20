import { useQuery } from "@apollo/client";

import { ESTAT_AREAS, ESTAT_AREA_GEOMETRY } from "../../base/geo/queries/estatAreas";

import { useLazyQuery } from "./base";

export const useEstatAreasLazy = () => {
  return useLazyQuery(ESTAT_AREAS);
};

export const useEstatAreaGeometry = ({ areaId }: { areaId: string }) => {
  return useQuery(ESTAT_AREA_GEOMETRY, {
    variables: {
      areaId,
    },
  });
};
