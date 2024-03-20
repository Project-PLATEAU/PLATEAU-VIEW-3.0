import { gql } from "@apollo/client";

export const GET_MODELS = gql`
  query GetModels($projectId: ID!, $pagination: Pagination) {
    models(projectId: $projectId, pagination: $pagination) {
      nodes {
        id
        name
        description
        key
        public
        order
        schema {
          id
        }
      }
    }
  }
`;

export const GET_MODEL_NODE = gql`
  query GetModel($id: ID!) {
    node(id: $id, type: Model) {
      ... on Model {
        id
        name
        description
        key
        public
        order
        metadataSchema {
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
            order
            typeProperty {
              ... on SchemaFieldText {
                defaultValue
                maxLength
              }
              ... on SchemaFieldBool {
                defaultValue
              }
              ... on SchemaFieldCheckbox {
                defaultValue
              }
              ... on SchemaFieldTag {
                selectDefaultValue: defaultValue
                tags {
                  id
                  name
                  color
                }
              }
              ... on SchemaFieldDate {
                defaultValue
              }
              ... on SchemaFieldURL {
                defaultValue
              }
            }
          }
        }
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
            order
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
              ... on SchemaFieldDate {
                defaultValue
              }
              ... on SchemaFieldURL {
                defaultValue
              }
              ... on SchemaFieldReference {
                modelId
                schema {
                  id
                  titleFieldId
                }
                correspondingField {
                  id
                  type
                  title
                  key
                  description
                  required
                  unique
                  multiple
                  order
                }
              }
              ... on SchemaFieldGroup {
                groupId
              }
            }
          }
        }
      }
    }
  }
`;

export const CREATE_MODEL = gql`
  mutation CreateModel($projectId: ID!, $name: String, $description: String, $key: String) {
    createModel(
      input: { projectId: $projectId, name: $name, description: $description, key: $key }
    ) {
      model {
        id
        name
      }
    }
  }
`;

export const DELETE_MODEL = gql`
  mutation DeleteModel($modelId: ID!) {
    deleteModel(input: { modelId: $modelId }) {
      modelId
    }
  }
`;

export const UPDATE_MODEL = gql`
  mutation UpdateModel(
    $modelId: ID!
    $name: String
    $description: String
    $key: String
    $public: Boolean!
  ) {
    updateModel(
      input: {
        modelId: $modelId
        name: $name
        description: $description
        key: $key
        public: $public
      }
    ) {
      model {
        id
        name
      }
    }
  }
`;

export const GET_MODEL_KEY_AVAILABILITY = gql`
  query CheckModelKeyAvailability($projectId: ID!, $key: String!) {
    checkModelKeyAvailability(projectId: $projectId, key: $key) {
      key
      available
    }
  }
`;

export const UPDATE_MODELS_ORDER = gql`
  mutation UpdateModelsOrder($modelIds: [ID!]!) {
    updateModelsOrder(input: { modelIds: $modelIds }) {
      models {
        ... on Model {
          id
        }
      }
    }
  }
`;
