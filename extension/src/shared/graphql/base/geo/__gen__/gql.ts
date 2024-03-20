/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query CameraAreas($longitude: Float!, $latitude: Float!, $includeRadii: Boolean) {\n    areas(longitude: $longitude, latitude: $latitude, includeRadii: $includeRadii) {\n      areas {\n        code\n        name\n        radius\n        type\n      },\n      address\n    }\n  }\n": types.CameraAreasDocument,
    "\n  query EstatAreasQuery($searchTokens: [String!]!, $limit: Float) {\n    estatAreas(searchTokens: $searchTokens, limit: $limit) {\n      id\n      prefectureCode\n      municipalityCode\n      name\n      address\n      addressComponents\n      bbox\n    }\n  }\n": types.EstatAreasQueryDocument,
    "\n  query EstatAreaGeometryQuery($areaId: ID!) {\n    estatAreaGeometry(areaId: $areaId) {\n      id\n      geometry\n    }\n  }\n": types.EstatAreaGeometryQueryDocument,
    "\n  query Health($id: ID!) {\n    health(id: $id) {\n      id\n      date\n    }\n  }\n": types.HealthDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CameraAreas($longitude: Float!, $latitude: Float!, $includeRadii: Boolean) {\n    areas(longitude: $longitude, latitude: $latitude, includeRadii: $includeRadii) {\n      areas {\n        code\n        name\n        radius\n        type\n      },\n      address\n    }\n  }\n"): (typeof documents)["\n  query CameraAreas($longitude: Float!, $latitude: Float!, $includeRadii: Boolean) {\n    areas(longitude: $longitude, latitude: $latitude, includeRadii: $includeRadii) {\n      areas {\n        code\n        name\n        radius\n        type\n      },\n      address\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query EstatAreasQuery($searchTokens: [String!]!, $limit: Float) {\n    estatAreas(searchTokens: $searchTokens, limit: $limit) {\n      id\n      prefectureCode\n      municipalityCode\n      name\n      address\n      addressComponents\n      bbox\n    }\n  }\n"): (typeof documents)["\n  query EstatAreasQuery($searchTokens: [String!]!, $limit: Float) {\n    estatAreas(searchTokens: $searchTokens, limit: $limit) {\n      id\n      prefectureCode\n      municipalityCode\n      name\n      address\n      addressComponents\n      bbox\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query EstatAreaGeometryQuery($areaId: ID!) {\n    estatAreaGeometry(areaId: $areaId) {\n      id\n      geometry\n    }\n  }\n"): (typeof documents)["\n  query EstatAreaGeometryQuery($areaId: ID!) {\n    estatAreaGeometry(areaId: $areaId) {\n      id\n      geometry\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Health($id: ID!) {\n    health(id: $id) {\n      id\n      date\n    }\n  }\n"): (typeof documents)["\n  query Health($id: ID!) {\n    health(id: $id) {\n      id\n      date\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;