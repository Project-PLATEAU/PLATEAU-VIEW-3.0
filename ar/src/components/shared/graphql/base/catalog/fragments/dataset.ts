import { gql } from "../__gen__";

export const DATASET_FRAGMENT = gql(`
  fragment DatasetFragment on Dataset {
    id
    name
    description
    year
    groups
    prefectureId
    prefectureCode
    cityId
    cityCode
    wardId
    wardCode
    prefecture {
      name
      code
    }
    city {
      name
      code
    }
    ward {
      name
      code
    }
    type {
      id
      code
      name
      category
      order
    }
    # items {
    #   id
    #   format
    #   name
    #   url
    #   layers
    # }
    admin
    ... on PlateauDataset {
      subname
      items {
        id
        format
        name
        url
        layers
        lod
        texture
      }
    }
    ... on RelatedDataset {
      items {
        id
        format
        name
        url
        layers
      }
    }
    ... on GenericDataset {
      items {
        id
        format
        name
        url
        layers
      }
    }
  }
`);
