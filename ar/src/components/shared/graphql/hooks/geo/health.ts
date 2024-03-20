import { HEALTH } from "../../base/geo/queries/health";

import { useQuery } from "./base";

export const useHealth = (id: string) => {
  return useQuery(HEALTH, {
    variables: {
      id,
    },
  });
};
