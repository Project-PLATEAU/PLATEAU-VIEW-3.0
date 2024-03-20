import { gql } from "../__gen__/gql";

export const CAMERA_AREAS = gql(`
  query CameraAreas($longitude: Float!, $latitude: Float!, $includeRadii: Boolean) {
    areas(longitude: $longitude, latitude: $latitude, includeRadii: $includeRadii) {
      areas {
        code
        name
        radius
        type
      },
      address
    }
  }
`);
