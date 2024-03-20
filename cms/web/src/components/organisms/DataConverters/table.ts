import {
  View,
  AndConditionInput,
  ItemSort,
  Condition,
  Column,
} from "@reearth-cms/components/molecules/View/types";
import {
  View as GQLView,
  FieldType as GQLFieldType,
  SortDirection as GQLSortDirection,
  AndConditionInput as GQLAndConditionInput,
  ItemSortInput as GQLItemSortInput,
  ColumnSelectionInput as GQLColumnSelectionInput,
} from "@reearth-cms/gql/graphql-client-api";

export const fromGraphQLView = (view: GQLView): View | undefined => {
  if (!view) return;

  return {
    id: view.id,
    name: view.name,
    modelId: view.modelId,
    projectId: view.projectId,
    sort: view.sort
      ? {
          field: {
            id: view.sort.field.id ?? undefined,
            type: view.sort.field.type,
          },
          direction: view.sort.direction ? view.sort.direction : "ASC",
        }
      : undefined,
    columns: view.columns
      ? view.columns?.map(column => ({
          field: {
            type: column.field.type,
            id: column.field.id ?? undefined,
          },
          visible: column.visible,
        }))
      : undefined,
    filter: view.filter ? (view.filter as Condition) : undefined,
  };
};

export const toGraphItemSort = (sort: ItemSort): GQLItemSortInput | undefined => {
  return {
    field: {
      id: sort.field.id ?? undefined,
      type: sort.field.type as GQLFieldType,
    },
    direction: sort.direction ? (sort.direction as GQLSortDirection) : GQLSortDirection["Asc"],
  };
};

export const toGraphColumnSelectionInput = (column: Column): GQLColumnSelectionInput => {
  return {
    field: {
      id: column.field.id,
      type: column.field.type as GQLFieldType,
    },
    visible: column.visible,
  };
};

export const toGraphAndConditionInput = (condition: AndConditionInput): GQLAndConditionInput => {
  return condition as GQLAndConditionInput;
};
