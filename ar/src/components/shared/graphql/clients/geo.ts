import { ApolloClient, InMemoryCache, NormalizedCacheObject } from "@apollo/client";

import fragmentMatcher from "../base/geo/__gen__/fragmentMatcher.json";

export let geoClient: ApolloClient<NormalizedCacheObject> | undefined;
export const createGeoClient = (url: string) => {
  geoClient = new ApolloClient({
    uri: `${url}/graphql`,
    cache: new InMemoryCache({
      possibleTypes: fragmentMatcher.possibleTypes,
    }),
  });

  return geoClient;
};
