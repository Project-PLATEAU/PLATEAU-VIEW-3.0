import { Field, Group } from "@reearth-cms/components/molecules/Schema/types";
import { Maybe, Group as GQLGroup } from "@reearth-cms/gql/graphql-client-api";

export const fromGraphQLGroup = (group: Maybe<GQLGroup>): Group | undefined => {
  if (!group) return;

  return {
    id: group.id,
    schemaId: group.schemaId,
    projectId: group.projectId,
    name: group.name,
    description: group.description,
    key: group.key,
    schema: {
      id: group.schema?.id,
      fields: group.schema?.fields.map(
        field =>
          ({
            id: field.id,
            description: field.description,
            title: field.title,
            type: field.type,
            key: field.key,
            unique: field.unique,
            isTitle: field.isTitle,
            multiple: field.multiple,
            required: field.required,
            typeProperty: field.typeProperty,
          }) as Field,
      ),
    },
  };
};
