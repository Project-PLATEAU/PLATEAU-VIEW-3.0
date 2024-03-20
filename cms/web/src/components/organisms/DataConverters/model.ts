import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { Maybe, Model as GQLModel } from "@reearth-cms/gql/graphql-client-api";

export const fromGraphQLModel = (model: Maybe<GQLModel>): Model | undefined => {
  if (!model) return;

  return {
    id: model.id,
    description: model.description,
    name: model.name,
    key: model.key,
    public: model.public,
    order: model.order ?? undefined,
    schemaId: model.schemaId,
    schema: {
      id: model.schema?.id,
      fields: model.schema?.fields?.map(
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
    metadataSchema: {
      id: model.metadataSchema?.id,
      fields: model.metadataSchema?.fields?.map(
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
