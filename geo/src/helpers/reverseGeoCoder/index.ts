import { fetchGovPolygon } from "./govpolygon";
import { fetchGSI } from "./gsi";
import { AreasFetcher } from "./types";
import { fetchYahoo } from "./yahoo";

export const fetchArea: AreasFetcher = (lon, lat) => {
  const url = process.env.REVERSE_GEOCODER_API_URL;
  switch (process.env.REVERSE_GEOCODER_API_TYPE) {
    case "gsi":
      return fetchGSI(url, lon, lat);
    case "yahoo":
      return fetchYahoo(url, lon, lat);
    case "govpolygon":
      return fetchGovPolygon(url, lon, lat);
  }
};
