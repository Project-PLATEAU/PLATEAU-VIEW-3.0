export type Areas = {
  municipalityCode?: string;
  name?: string;
};

export type AreasFetcherBase = (
  url: string,
  lon: number,
  lat: number,
) => Promise<Areas | undefined>;
export type AreasFetcher = (lon: number, lat: number) => Promise<Areas | undefined>;
