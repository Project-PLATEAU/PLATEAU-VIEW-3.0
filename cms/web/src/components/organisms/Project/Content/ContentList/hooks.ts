import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { renderField } from "@reearth-cms/components/molecules/Content/RenderField";
import { renderTitle } from "@reearth-cms/components/molecules/Content/RenderTitle";
import { ExtendedColumns } from "@reearth-cms/components/molecules/Content/Table/types";
import {
  ContentTableField,
  Item,
  ItemStatus,
  ItemField,
} from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import {
  AndConditionInput,
  Column,
  FieldType,
  ItemSort,
  SortDirection,
} from "@reearth-cms/components/molecules/View/types";
import {
  fromGraphQLItem,
  fromGraphQLComment,
} from "@reearth-cms/components/organisms/DataConverters/content";
import {
  toGraphAndConditionInput,
  toGraphItemSort,
} from "@reearth-cms/components/organisms/DataConverters/table";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/hooks";
import {
  Item as GQLItem,
  useDeleteItemMutation,
  Comment as GQLComment,
  useSearchItemQuery,
  Asset as GQLAsset,
  useGetItemLazyQuery,
  useUpdateItemMutation,
  useCreateItemMutation,
  SchemaFieldType,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

import { fileName } from "./utils";

export type CurrentViewType = {
  id?: string;
  sort?: ItemSort;
  filter?: AndConditionInput;
  columns?: Column[];
};

const defaultViewSort: { direction: SortDirection; field: { type: FieldType } } = {
  direction: "DESC",
  field: {
    type: "MODIFICATION_DATE",
  },
};

export default () => {
  const {
    currentModel,
    currentWorkspace,
    currentProject,
    requests,
    addItemToRequestModalShown,
    handleUnpublish,
    handleAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleRequestTableChange,
    handleRequestSearchTerm,
    handleRequestTableReload,
    loading: requestModalLoading,
    totalCount: requestModalTotalCount,
    page: requestModalPage,
    pageSize: requestModalPageSize,
  } = useContentHooks();
  const t = useT();

  const navigate = useNavigate();
  const { modelId } = useParams();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [currentView, setCurrentView] = useState<CurrentViewType>({
    columns: [],
  });

  const { data, refetch, loading } = useSearchItemQuery({
    fetchPolicy: "no-cache",
    variables: {
      searchItemInput: {
        query: {
          project: currentProject?.id ?? "",
          model: currentModel?.id ?? "",
          schema: currentModel?.schema.id,
          q: searchTerm,
        },
        pagination: { first: pageSize, offset: (page - 1) * pageSize },
        //if there is no sort in the current view, show data in the default view sort
        sort: currentView.sort
          ? toGraphItemSort(currentView.sort)
          : toGraphItemSort(defaultViewSort),
        filter: currentView.filter
          ? {
              and: toGraphAndConditionInput(currentView.filter),
            }
          : undefined,
      },
    },
    skip: !currentModel?.id,
  });

  const handleItemsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const [collapsedModelMenu, collapseModelMenu] = useState(false);
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [selection, setSelection] = useState<{ selectedRowKeys: string[] }>({
    selectedRowKeys: [],
  });

  const [updateItemMutation] = useUpdateItemMutation();
  const [getItem] = useGetItemLazyQuery({ fetchPolicy: "no-cache" });
  const [createNewItem] = useCreateItemMutation();

  const metadataVersion = useMemo(() => new Map<string, string>(), []);
  const metadataVersionSet = useCallback(
    async (id: string) => {
      const { data } = await getItem({ variables: { id } });
      const item = fromGraphQLItem(data?.node as GQLItem);
      if (item?.metadata.id) {
        metadataVersion.set(item.metadata.id, item.metadata.version);
      }
    },
    [getItem, metadataVersion],
  );

  const handleMetaItemUpdate = useCallback(
    async (
      updateItemId: string,
      key: string,
      value?: string | string[] | boolean | boolean[],
      index?: number,
    ) => {
      const target = data?.searchItem.nodes.find(item => item?.id === updateItemId);
      if (!target || !currentModel?.metadataSchema?.id || !currentModel.metadataSchema.fields) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      } else if (target.metadata) {
        const fields = target.metadata.fields.map(field => {
          if (field.schemaFieldId === key) {
            if (Array.isArray(field.value) && field.type !== "Tag") {
              field.value[index ?? 0] = value ?? "";
            } else {
              field.value = value ?? "";
            }
          } else {
            field.value = field.value ?? "";
          }
          return field as typeof field & { value: any };
        });
        const item = await updateItemMutation({
          variables: {
            itemId: target.metadata.id,
            fields,
            version: metadataVersion.get(target.metadata.id) ?? target.metadata.version,
          },
        });
        if (item.errors || !item.data?.updateItem) {
          Notification.error({ message: t("Failed to update item.") });
          return;
        }
      } else {
        const fields = currentModel.metadataSchema.fields.map(field => ({
          value: field.id === key ? value : "",
          schemaFieldId: key,
          type: field.type as SchemaFieldType,
        }));
        const metaItem = await createNewItem({
          variables: {
            modelId: currentModel.id,
            schemaId: currentModel.metadataSchema.id,
            fields,
          },
        });
        if (metaItem.errors || !metaItem.data?.createItem) {
          Notification.error({ message: t("Failed to update item.") });
          return;
        }
        const item = await updateItemMutation({
          variables: {
            itemId: target.id,
            fields: target.fields.map(field => ({
              ...field,
              value: field.value ?? "",
            })),
            metadataId: metaItem?.data.createItem.item.id,
            version: target?.version ?? "",
          },
        });
        if (item.errors || !item.data?.updateItem) {
          Notification.error({ message: t("Failed to update item.") });
          return;
        }
      }
      metadataVersionSet(updateItemId);
      Notification.success({ message: t("Successfully updated Item!") });
    },
    [
      createNewItem,
      currentModel?.id,
      currentModel?.metadataSchema?.fields,
      currentModel?.metadataSchema?.id,
      data?.searchItem.nodes,
      metadataVersion,
      metadataVersionSet,
      t,
      updateItemMutation,
    ],
  );

  const fieldValueGet = useCallback((field: ItemField, item: Item) => {
    if (field.type === "Asset") {
      if (Array.isArray(field.value)) {
        if (field.value.length > 0) {
          return field.value.map(value =>
            fileName((item?.assets as GQLAsset[])?.find(asset => asset?.id === value)?.url),
          );
        } else {
          return null;
        }
      } else {
        return fileName(
          (item?.assets as GQLAsset[])?.find(asset => asset?.id === field.value)?.url,
        );
      }
    } else {
      if (field.type === "Reference") {
        return item.referencedItems?.find(ref => ref.id === field.value)?.title ?? field.value;
      } else {
        if (Array.isArray(field.value) && field.value.length > 0) {
          return field.value.map(v => "" + v);
        } else {
          return field.value === null ? null : "" + field.value;
        }
      }
    }
  }, []);

  const fieldsGet = useCallback(
    (item: Item) => {
      const result: { [key: string]: any } = {};
      item?.fields?.map(field => {
        result[field.schemaFieldId] = fieldValueGet(field, item);
      });
      return result;
    },
    [fieldValueGet],
  );

  const metadataGet = useCallback((fields?: ItemField[]) => {
    const result: { [key: string]: any } = {};
    fields?.forEach(field => {
      if (Array.isArray(field.value) && field.value.length > 0) {
        result[field.schemaFieldId] = field.value.map(v => "" + v);
      } else {
        result[field.schemaFieldId] = field.value === null ? null : "" + field.value;
      }
    });
    return result;
  }, []);

  const contentTableFields: ContentTableField[] | undefined = useMemo(() => {
    return data?.searchItem.nodes
      ?.map(item =>
        item
          ? {
              id: item.id,
              schemaId: item.schemaId,
              status: item.status as ItemStatus,
              createdBy: item.createdBy?.name,
              updatedBy: item.updatedBy?.name || "",
              fields: fieldsGet(item as unknown as Item),
              comments: item.thread.comments.map(comment =>
                fromGraphQLComment(comment as GQLComment),
              ),
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              metadata: metadataGet(item?.metadata?.fields as ItemField[] | undefined),
              metadataId: item.metadata?.id,
              version: item.metadata?.version,
            }
          : undefined,
      )
      .filter((contentTableField): contentTableField is ContentTableField => !!contentTableField);
  }, [data?.searchItem.nodes, fieldsGet, metadataGet]);

  const sortOrderGet = useCallback(
    (fieldId: string) => {
      if (fieldId === currentView.sort?.field.id) {
        if (currentView.sort?.direction === "ASC") {
          return "ascend" as const;
        } else {
          return "descend" as const;
        }
      } else {
        return null;
      }
    },
    [currentView.sort?.direction, currentView.sort?.field.id],
  );

  const contentTableColumns: ExtendedColumns[] | undefined = useMemo(() => {
    if (!currentModel) return;
    const fieldsColumns = currentModel?.schema?.fields?.map(field => ({
      title: field.title,
      dataIndex: ["fields", field.id],
      fieldType: "FIELD",
      key: field.id,
      ellipsis: true,
      type: field.type,
      typeProperty: field.typeProperty,
      width: 128,
      minWidth: 128,
      multiple: field.multiple,
      required: field.required,
      sorter: true,
      sortOrder: sortOrderGet(field.id),
      render: (el: any) => renderField(el, field),
    }));

    const metadataColumns =
      currentModel?.metadataSchema?.fields?.map(field => ({
        title: renderTitle(field),
        dataIndex: ["metadata", field.id],
        fieldType: "META_FIELD",
        key: field.id,
        ellipsis: true,
        type: field.type,
        typeProperty: field.typeProperty,
        width: 128,
        minWidth: 128,
        multiple: field.multiple,
        required: field.required,
        sorter: true,
        sortOrder: sortOrderGet(field.id),
        render: (el: any, record: ContentTableField) => {
          return renderField(el, field, (value?: string | string[] | boolean, index?: number) => {
            handleMetaItemUpdate(record.id, field.id, value, index);
          });
        },
      })) || [];

    return [...fieldsColumns, ...metadataColumns];
  }, [currentModel, handleMetaItemUpdate, sortOrderGet]);

  useEffect(() => {
    if (!modelId && currentModel?.id) {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}`,
      );
    }
  }, [modelId, currentWorkspace?.id, currentProject?.id, currentModel?.id, navigate]);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${modelId}`,
      );
      setSearchTerm("");
      setPage(1);
    },
    [currentWorkspace?.id, currentProject?.id, navigate],
  );

  const handleViewChange = useCallback(() => {
    setSearchTerm("");
    setPage(1);
  }, []);

  const handleNavigateToItemForm = useCallback(() => {
    navigate(
      `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}/details`,
    );
  }, [currentWorkspace?.id, currentProject?.id, currentModel?.id, navigate]);

  const handleNavigateToItemEditForm = useCallback(
    (itemId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}/details/${itemId}`,
        { state: location.search },
      );
    },
    [currentWorkspace?.id, currentProject?.id, currentModel?.id, navigate],
  );

  const [deleteItemMutation] = useDeleteItemMutation();
  const handleItemDelete = useCallback(
    (itemIds: string[]) =>
      (async () => {
        const results = await Promise.all(
          itemIds.map(async itemId => {
            const result = await deleteItemMutation({
              variables: { itemId },
              refetchQueries: ["SearchItem"],
            });
            if (result.errors) {
              Notification.error({ message: t("Failed to delete one or more items.") });
            }
          }),
        );
        if (results) {
          Notification.success({ message: t("One or more items were successfully deleted!") });
          setSelection({ selectedRowKeys: [] });
        }
      })(),
    [t, deleteItemMutation],
  );

  const handleItemSelect = useCallback(
    (id: string) => {
      setSelectedItemId(id);
      collapseCommentsPanel(false);
    },
    [setSelectedItemId],
  );

  const selectedItem = useMemo(
    () =>
      fromGraphQLItem(data?.searchItem.nodes.find(item => item?.id === selectedItemId) as GQLItem),
    [data?.searchItem.nodes, selectedItemId],
  );

  const handleContentTableChange = useCallback(
    (page: number, pageSize: number, sorter?: ItemSort) => {
      setPage(page);
      setPageSize(pageSize);
      setCurrentView(prev => ({
        ...prev,
        sort: sorter,
      }));
    },
    [],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term ?? "");
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((filter?: AndConditionInput) => {
    setCurrentView(prev => ({
      ...prev,
      filter,
    }));
    setPage(1);
  }, []);

  const handleBulkAddItemToRequest = useCallback(
    async (request: Request, itemIds: string[]) => {
      await handleAddItemToRequest(request, itemIds);
      refetch();
      setSelection({ selectedRowKeys: [] });
    },
    [handleAddItemToRequest, refetch],
  );

  return {
    currentModel,
    loading,
    contentTableFields,
    contentTableColumns,
    collapsedModelMenu,
    collapsedCommentsPanel,
    selectedItem,
    selection,
    totalCount: data?.searchItem.totalCount ?? 0,
    currentView,
    searchTerm,
    page,
    pageSize,
    requests,
    addItemToRequestModalShown,
    setCurrentView,
    handleRequestTableChange,
    requestModalLoading,
    requestModalTotalCount,
    requestModalPage,
    requestModalPageSize,
    handleUnpublish,
    handleBulkAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleSearchTerm,
    handleFilterChange,
    setSelection,
    handleItemSelect,
    collapseCommentsPanel,
    collapseModelMenu,
    handleModelSelect,
    handleViewChange,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
    handleItemDelete,
    handleContentTableChange,
    handleRequestSearchTerm,
    handleRequestTableReload,
  };
};
