/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type Area = {
  __typename?: 'Area';
  code: Scalars['String']['output'];
  name: Scalars['String']['output'];
  radius: Scalars['Float']['output'];
  type: Scalars['String']['output'];
};

export type Areas = {
  __typename?: 'Areas';
  address: Scalars['String']['output'];
  areas: Array<Area>;
};

export type EstatArea = {
  __typename?: 'EstatArea';
  address: Scalars['String']['output'];
  addressComponents: Array<Scalars['String']['output']>;
  bbox: Array<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  municipalityCode: Scalars['String']['output'];
  name: Scalars['String']['output'];
  prefectureCode: Scalars['String']['output'];
};

export type EstatAreaGeometry = {
  __typename?: 'EstatAreaGeometry';
  geometry: Scalars['JSON']['output'];
  id: Scalars['String']['output'];
};

export type Health = {
  __typename?: 'Health';
  date: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
};

export type Query = {
  __typename?: 'Query';
  areas?: Maybe<Areas>;
  estatAreaGeometry?: Maybe<EstatAreaGeometry>;
  estatAreas: Array<EstatArea>;
  health: Health;
};


export type QueryAreasArgs = {
  includeRadii?: Scalars['Boolean']['input'];
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};


export type QueryEstatAreaGeometryArgs = {
  areaId: Scalars['ID']['input'];
};


export type QueryEstatAreasArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  searchTokens: Array<Scalars['String']['input']>;
};


export type QueryHealthArgs = {
  id: Scalars['ID']['input'];
};

export type CameraAreasQueryVariables = Exact<{
  longitude: Scalars['Float']['input'];
  latitude: Scalars['Float']['input'];
  includeRadii?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CameraAreasQuery = { __typename?: 'Query', areas?: { __typename?: 'Areas', address: string, areas: Array<{ __typename?: 'Area', code: string, name: string, radius: number, type: string }> } | null };

export type EstatAreasQueryQueryVariables = Exact<{
  searchTokens: Array<Scalars['String']['input']> | Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Float']['input']>;
}>;


export type EstatAreasQueryQuery = { __typename?: 'Query', estatAreas: Array<{ __typename?: 'EstatArea', id: string, prefectureCode: string, municipalityCode: string, name: string, address: string, addressComponents: Array<string>, bbox: Array<number> }> };

export type EstatAreaGeometryQueryQueryVariables = Exact<{
  areaId: Scalars['ID']['input'];
}>;


export type EstatAreaGeometryQueryQuery = { __typename?: 'Query', estatAreaGeometry?: { __typename?: 'EstatAreaGeometry', id: string, geometry: any } | null };

export type HealthQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type HealthQuery = { __typename?: 'Query', health: { __typename?: 'Health', id: string, date: any } };


export const CameraAreasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CameraAreas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"longitude"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"latitude"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeRadii"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"areas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"longitude"},"value":{"kind":"Variable","name":{"kind":"Name","value":"longitude"}}},{"kind":"Argument","name":{"kind":"Name","value":"latitude"},"value":{"kind":"Variable","name":{"kind":"Name","value":"latitude"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeRadii"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeRadii"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"areas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"radius"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<CameraAreasQuery, CameraAreasQueryVariables>;
export const EstatAreasQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EstatAreasQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"searchTokens"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"estatAreas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"searchTokens"},"value":{"kind":"Variable","name":{"kind":"Name","value":"searchTokens"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"prefectureCode"}},{"kind":"Field","name":{"kind":"Name","value":"municipalityCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"addressComponents"}},{"kind":"Field","name":{"kind":"Name","value":"bbox"}}]}}]}}]} as unknown as DocumentNode<EstatAreasQueryQuery, EstatAreasQueryQueryVariables>;
export const EstatAreaGeometryQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EstatAreaGeometryQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"estatAreaGeometry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"areaId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"areaId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"geometry"}}]}}]}}]} as unknown as DocumentNode<EstatAreaGeometryQueryQuery, EstatAreaGeometryQueryQueryVariables>;
export const HealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Health"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]} as unknown as DocumentNode<HealthQuery, HealthQueryVariables>;