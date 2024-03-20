import { gql } from "@apollo/client";

export const CREATE_FIELD = gql`
  mutation CreateField(
    $modelId: ID
    $groupId: ID
    $type: SchemaFieldType!
    $title: String!
    $metadata: Boolean
    $description: String
    $key: String!
    $multiple: Boolean!
    $unique: Boolean!
    $isTitle: Boolean!
    $required: Boolean!
    $typeProperty: SchemaFieldTypePropertyInput!
  ) {
    createField(
      input: {
        modelId: $modelId
        groupId: $groupId
        type: $type
        title: $title
        metadata: $metadata
        description: $description
        key: $key
        multiple: $multiple
        unique: $unique
        isTitle: $isTitle
        required: $required
        typeProperty: $typeProperty
      }
    ) {
      field {
        id
      }
    }
  }
`;

export const UPDATE_FIELD = gql`
  mutation UpdateField(
    $modelId: ID
    $groupId: ID
    $fieldId: ID!
    $title: String!
    $metadata: Boolean
    $description: String
    $order: Int
    $key: String!
    $multiple: Boolean!
    $unique: Boolean!
    $isTitle: Boolean!
    $required: Boolean!
    $typeProperty: SchemaFieldTypePropertyInput!
  ) {
    updateField(
      input: {
        modelId: $modelId
        groupId: $groupId
        fieldId: $fieldId
        title: $title
        metadata: $metadata
        description: $description
        order: $order
        key: $key
        multiple: $multiple
        unique: $unique
        isTitle: $isTitle
        required: $required
        typeProperty: $typeProperty
      }
    ) {
      field {
        id
      }
    }
  }
`;

export const UPDATE_FIELDS = gql`
  mutation UpdateFields($updateFieldInput: [UpdateFieldInput!]!) {
    updateFields(input: $updateFieldInput) {
      fields {
        id
      }
    }
  }
`;

export const DELETE_FIELD = gql`
  mutation DeleteField($modelId: ID, $groupId: ID, $fieldId: ID!, $metadata: Boolean) {
    deleteField(
      input: { modelId: $modelId, groupId: $groupId, fieldId: $fieldId, metadata: $metadata }
    ) {
      fieldId
    }
  }
`;
