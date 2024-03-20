import { gql } from "../__gen__/gql";

export const ESTAT_AREAS = gql(`
  query EstatAreasQuery($searchTokens: [String!]!, $limit: Float) {
    estatAreas(searchTokens: $searchTokens, limit: $limit) {
      id
      prefectureCode
      municipalityCode
      name
      address
      addressComponents
      bbox
    }
  }
`);

export const ESTAT_AREA_GEOMETRY = gql(`
  query EstatAreaGeometryQuery($areaId: ID!) {
    estatAreaGeometry(areaId: $areaId) {
      id
      geometry
    }
  }
`);
