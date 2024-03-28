import axios from "axios";

import { AreasFetcherBase } from "./types";

export const fetchGovPolygon: AreasFetcherBase = async (url, lon, lat) => {
  const { data } = await axios.get(url, {
    params: {
      lng: lon,
      lat,
    },
  });

  return {
    municipalityCode: data?.code,
    name: `${data?.pref ?? ""}${data?.ward ?? ""}`,
  };
};
