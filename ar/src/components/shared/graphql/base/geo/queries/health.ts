import { gql } from "../__gen__/gql";

export const HEALTH = gql(`
  query Health($id: ID!) {
    health(id: $id) {
      id
      date
    }
  }
`);
