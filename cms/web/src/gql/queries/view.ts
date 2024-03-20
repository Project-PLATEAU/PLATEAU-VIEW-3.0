import { gql } from "@apollo/client";

export const GET_VIEWS = gql`
  query GetViews($modelId: ID!) {
    view(modelId: $modelId) {
      id
      name
      modelId
      projectId
      sort {
        field {
          type
          id
        }
        direction
      }
      columns {
        field {
          type
          id
        }
        visible
      }
      filter {
        ... on AndCondition {
          conditions {
            ... on BasicFieldCondition {
              fieldId {
                type
                id
              }
              basicOperator: operator
              basicValue: value
              __typename
            }
            ... on NullableFieldCondition {
              fieldId {
                type
                id
              }
              nullableOperator: operator
              __typename
            }
            ... on MultipleFieldCondition {
              fieldId {
                type
                id
              }
              multipleOperator: operator
              multipleValue: value
              __typename
            }
            ... on BoolFieldCondition {
              fieldId {
                type
                id
              }
              boolOperator: operator
              boolValue: value
            }
            ... on StringFieldCondition {
              fieldId {
                type
                id
              }
              stringOperator: operator
              stringValue: value
            }
            ... on NumberFieldCondition {
              fieldId {
                type
                id
              }
              numberOperator: operator
              numberValue: value
              __typename
            }
            ... on TimeFieldCondition {
              fieldId {
                type
                id
              }
              timeOperator: operator
              timeValue: value
              __typename
            }
            __typename
          }
        }
      }
      __typename
    }
    __typename
  }
`;

export const CREATE_VIEW = gql`
  mutation CreateView(
    $projectId: ID!
    $modelId: ID!
    $name: String!
    $sort: ItemSortInput
    $filter: ConditionInput
    $columns: [ColumnSelectionInput!]
  ) {
    createView(
      input: {
        projectId: $projectId
        modelId: $modelId
        name: $name
        sort: $sort
        filter: $filter
        columns: $columns
      }
    ) {
      view {
        id
        name
        modelId
        projectId
        sort {
          field {
            type
            id
          }
          direction
        }
        columns {
          field {
            type
            id
          }
          visible
        }
        filter {
          ... on AndCondition {
            conditions {
              ... on BasicFieldCondition {
                fieldId {
                  type
                  id
                }
                basicOperator: operator
                basicValue: value
                __typename
              }
              ... on NullableFieldCondition {
                fieldId {
                  type
                  id
                }
                nullableOperator: operator
                __typename
              }
              ... on MultipleFieldCondition {
                fieldId {
                  type
                  id
                }
                multipleOperator: operator
                multipleValue: value
                __typename
              }
              ... on BoolFieldCondition {
                fieldId {
                  type
                  id
                }
                boolOperator: operator
                boolValue: value
              }
              ... on StringFieldCondition {
                fieldId {
                  type
                  id
                }
                stringOperator: operator
                stringValue: value
              }
              ... on NumberFieldCondition {
                fieldId {
                  type
                  id
                }
                numberOperator: operator
                numberValue: value
                __typename
              }
              ... on TimeFieldCondition {
                fieldId {
                  type
                  id
                }
                timeOperator: operator
                timeValue: value
                __typename
              }
              __typename
            }
          }
        }
        __typename
      }
    }
  }
`;

export const UPDATE_VIEW = gql`
  mutation UpdateView(
    $viewId: ID!
    $name: String!
    $sort: ItemSortInput
    $filter: ConditionInput
    $columns: [ColumnSelectionInput!]
  ) {
    updateView(
      input: { viewId: $viewId, name: $name, sort: $sort, filter: $filter, columns: $columns }
    ) {
      view {
        id
        name
        modelId
        projectId
        sort {
          field {
            type
            id
          }
          direction
        }
        columns {
          field {
            type
            id
          }
          visible
        }
        filter {
          ... on AndCondition {
            conditions {
              ... on BasicFieldCondition {
                fieldId {
                  type
                  id
                }
                basicOperator: operator
                basicValue: value
                __typename
              }
              ... on NullableFieldCondition {
                fieldId {
                  type
                  id
                }
                nullableOperator: operator
                __typename
              }
              ... on MultipleFieldCondition {
                fieldId {
                  type
                  id
                }
                multipleOperator: operator
                multipleValue: value
                __typename
              }
              ... on BoolFieldCondition {
                fieldId {
                  type
                  id
                }
                boolOperator: operator
                boolValue: value
              }
              ... on StringFieldCondition {
                fieldId {
                  type
                  id
                }
                stringOperator: operator
                stringValue: value
              }
              ... on NumberFieldCondition {
                fieldId {
                  type
                  id
                }
                numberOperator: operator
                numberValue: value
                __typename
              }
              ... on TimeFieldCondition {
                fieldId {
                  type
                  id
                }
                timeOperator: operator
                timeValue: value
                __typename
              }
              __typename
            }
          }
        }
        __typename
      }
    }
  }
`;

export const DELETE_VIEW = gql`
  mutation DeleteView($viewId: ID!) {
    deleteView(input: { viewId: $viewId }) {
      viewId
    }
  }
`;
