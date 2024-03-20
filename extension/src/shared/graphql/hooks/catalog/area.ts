import { useMemo } from "react";

import { AREAS, AREA_DATASETS } from "../../base/catalog/queries/area";
import { AreasInput, DatasetsInput } from "../../types/catalog";

import { useQuery } from "./base";

type Options = {
  skip?: boolean;
};

export const useAreas = (input?: AreasInput, options?: Options) => {
  return useQuery(AREAS, {
    variables: {
      input: input ?? {},
    },
    skip: options?.skip,
  });
};

export const useAreaDatasets = (code: string, input?: DatasetsInput, options?: Options) => {
  const { data, ...rest } = useQuery(AREA_DATASETS, {
    variables: {
      code,
      input: input ?? {},
    },
    skip: options?.skip,
  });

  const nextDatasets = useMemo(
    () => data?.area?.datasets.slice().sort((a, b) => a.type.order - b.type.order),
    [data],
  );

  return {
    data: data
      ? { ...data, ...(data.area ? { area: { ...data.area, datasets: nextDatasets } } : {}) }
      : undefined,
    ...rest,
  };
};
