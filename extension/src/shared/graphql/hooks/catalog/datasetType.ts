import { useMemo } from "react";

import { DatasetTypesInput } from "../../base/catalog/__gen__/graphql";
import { DATASET_TYPES } from "../../base/catalog/queries/datasetType";

import { useQuery } from "./base";

type Options = {
  skip?: boolean;
};

export const useDatasetTypes = (input?: DatasetTypesInput, options?: Options) => {
  const { data, ...rest } = useQuery(DATASET_TYPES, {
    variables: {
      input,
    },
    skip: options?.skip,
  });

  const nextData = useMemo(
    () => data?.datasetTypes.slice().sort((a, b) => a.order - b.order),
    [data],
  );

  return { data: nextData, ...rest };
};
