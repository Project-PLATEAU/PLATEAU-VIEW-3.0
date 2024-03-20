import { gql } from "@apollo/client";

export const GET_GROUPS = gql`
  query GetGroups($projectId: ID!) {
    groups(projectId: $projectId) {
      id
      name
      key
    }
  }
`;

export const GET_GROUP = gql`
  query GetGroup($id: ID!) {
    node(id: $id, type: Group) {
      ... on Group {
        id
        schemaId
        projectId
        name
        description
        key
        schema {
          id
          fields {
            id
            type
            title
            key
            description
            required
            unique
            isTitle
            multiple
            typeProperty {
              ... on SchemaFieldText {
                defaultValue
                maxLength
              }
              ... on SchemaFieldTextArea {
                defaultValue
                maxLength
              }
              ... on SchemaFieldMarkdown {
                defaultValue
                maxLength
              }
              ... on SchemaFieldAsset {
                assetDefaultValue: defaultValue
              }
              ... on SchemaFieldSelect {
                selectDefaultValue: defaultValue
                values
              }
              ... on SchemaFieldInteger {
                integerDefaultValue: defaultValue
                min
                max
              }
              ... on SchemaFieldBool {
                defaultValue
              }
              ... on SchemaFieldURL {
                defaultValue
              }
              ... on SchemaFieldDate {
                defaultValue
              }
            }
          }
        }
      }
    }
  }
`;

export const CREATE_GROUP = gql`
  mutation createGroup($projectId: ID!, $name: String!, $key: String!, $description: String) {
    createGroup(
      input: { projectId: $projectId, name: $name, key: $key, description: $description }
    ) {
      group {
        id
      }
    }
  }
`;

export const UPDATE_GROUP = gql`
  mutation updateGroup($groupId: ID!, $name: String!, $key: String!, $description: String) {
    updateGroup(input: { groupId: $groupId, name: $name, key: $key, description: $description }) {
      group {
        id
      }
    }
  }
`;

export const DELETE_GROUP = gql`
  mutation deleteGroup($groupId: ID!) {
    deleteGroup(input: { groupId: $groupId }) {
      groupId
    }
  }
`;

export const GET_GROUP_KEY_AVAILABILITY = gql`
  query CheckGroupKeyAvailability($projectId: ID!, $key: String!) {
    checkGroupKeyAvailability(projectId: $projectId, key: $key) {
      key
      available
    }
  }
`;

export const MODELS_BY_GROUP = gql`
  query ModelsByGroup($groupId: ID!) {
    modelsByGroup(groupId: $groupId) {
      name
    }
  }
`;
