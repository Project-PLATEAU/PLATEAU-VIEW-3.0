import moment from "moment";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import {
  FormItem,
  Item,
  ItemValue,
  ItemStatus,
  ItemField,
} from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import {
  RequestUpdatePayload,
  RequestState,
} from "@reearth-cms/components/molecules/Request/types";
import { Group, Field } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { fromGraphQLItem } from "@reearth-cms/components/organisms/DataConverters/content";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import { fromGraphQLGroup } from "@reearth-cms/components/organisms/DataConverters/schema";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/hooks";
import {
  Item as GQLItem,
  Model as GQLModel,
  Group as GQLGroup,
  RequestState as GQLRequestState,
  useCreateItemMutation,
  useCreateRequestMutation,
  useGetItemQuery,
  useGetModelLazyQuery,
  useGetMeQuery,
  useUpdateItemMutation,
  useUpdateRequestMutation,
  useSearchItemQuery,
  useGetGroupLazyQuery,
  FieldType as GQLFieldType,
  StringOperator,
  ItemFieldInput,
  useIsItemReferencedLazyQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { newID } from "@reearth-cms/utils/id";

export default () => {
  const {
    currentModel,
    currentWorkspace,
    currentProject,
    requests,
    addItemToRequestModalShown,
    handlePublish,
    handleUnpublish,
    handleAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleRequestTableChange,
    handleRequestSearchTerm,
    handleRequestTableReload,
    loading,
    totalCount,
    page,
    pageSize,
  } = useContentHooks();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userData } = useGetMeQuery();

  const { itemId } = useParams();
  const [collapsedModelMenu, collapseModelMenu] = useState(false);
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [requestModalShown, setRequestModalShown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [linkItemModalPage, setLinkItemModalPage] = useState<number>(1);
  const [linkItemModalPageSize, setLinkItemModalPageSize] = useState<number>(10);
  const [referenceModel, setReferenceModel] = useState<Model>();

  const titleId = useRef("");
  const t = useT();

  const { data, loading: itemLoading } = useGetItemQuery({
    fetchPolicy: "cache-and-network",
    variables: { id: itemId ?? "" },
    skip: !itemId,
  });

  const [getModel] = useGetModelLazyQuery({
    fetchPolicy: "cache-and-network",
    onCompleted: data => setReferenceModel(fromGraphQLModel(data?.node as GQLModel)),
  });
  const {
    data: itemsData,
    loading: loadingReference,
    refetch,
  } = useSearchItemQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      searchItemInput: {
        query: {
          project: currentProject?.id ?? "",
          model: referenceModel?.id ?? "",
          schema: referenceModel?.schema.id,
        },
        pagination: {
          first: linkItemModalPageSize,
          offset: (linkItemModalPage - 1) * linkItemModalPageSize,
        },
        filter:
          searchTerm && titleId.current
            ? {
                and: {
                  conditions: [
                    {
                      string: {
                        fieldId: { id: titleId.current, type: GQLFieldType.Field },
                        operator: StringOperator.Contains,
                        value: searchTerm,
                      },
                    },
                  ],
                },
              }
            : undefined,
      },
    },
    skip: !referenceModel,
  });

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term ?? "");
    setLinkItemModalPage(1);
  }, []);

  const handleLinkItemTableReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLinkItemTableChange = useCallback((page: number, pageSize: number) => {
    setLinkItemModalPage(page);
    setLinkItemModalPageSize(pageSize);
  }, []);

  const linkedItemsModalList: FormItem[] | undefined = useMemo(() => {
    return itemsData?.searchItem.nodes
      ?.map(item =>
        item
          ? {
              id: item.id,
              schemaId: item.schemaId,
              status: item.status as ItemStatus,
              createdBy: item.createdBy?.name,
              createdAt: item.createdAt,
              title: item.title,
              updatedAt: item.updatedAt,
            }
          : undefined,
      )
      .filter((contentTableField): contentTableField is FormItem => !!contentTableField);
  }, [itemsData?.searchItem.nodes]);

  const me: User | undefined = useMemo(() => {
    return userData?.me
      ? {
          id: userData.me.id,
          name: userData.me.name,
          lang: userData.me.lang,
          email: userData.me.email,
        }
      : undefined;
  }, [userData]);

  const myRole = useMemo(
    () =>
      currentWorkspace?.members?.find((m): m is UserMember => "userId" in m && m.userId === me?.id)
        ?.role,
    [currentWorkspace?.members, me?.id],
  );

  const showPublishAction = useMemo(
    () => (myRole ? !currentProject?.requestRoles?.includes(myRole) : true),
    [currentProject?.requestRoles, myRole],
  );

  const currentItem: Item | undefined = useMemo(
    () => fromGraphQLItem(data?.node as GQLItem),
    [data?.node],
  );

  const [getGroup] = useGetGroupLazyQuery({
    fetchPolicy: "cache-and-network",
  });

  const handleGroupGet = useCallback(
    async (id: string) => {
      const res = await getGroup({
        variables: {
          id,
        },
      });
      return fromGraphQLGroup(res.data?.node as GQLGroup);
    },
    [getGroup],
  );

  const handleNavigateToModel = useCallback(
    (modelId?: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${modelId}${
          location.state ?? ""
        }`,
      );
    },
    [navigate, currentWorkspace?.id, currentProject?.id, location.state],
  );
  const [createItem, { loading: itemCreationLoading }] = useCreateItemMutation({
    refetchQueries: ["SearchItem", "GetRequests"],
  });

  const handleItemCreate = useCallback(
    async ({
      schemaId,
      metaSchemaId,
      fields,
      metaFields,
    }: {
      schemaId: string;
      metaSchemaId?: string;
      fields: ItemField[];
      metaFields: ItemField[];
    }) => {
      if (!currentModel?.id) return;
      let metadataId = null;
      if (metaSchemaId) {
        const metaItem = await createItem({
          variables: {
            modelId: currentModel.id,
            schemaId: metaSchemaId,
            fields: metaFields as ItemFieldInput[],
          },
        });
        if (metaItem.errors || !metaItem.data?.createItem) {
          Notification.error({ message: t("Failed to create item.") });
          return;
        }
        metadataId = metaItem.data.createItem.item.id;
      }
      const item = await createItem({
        variables: {
          modelId: currentModel.id,
          schemaId: schemaId,
          fields: fields as ItemFieldInput[],
          metadataId,
        },
      });
      if (item.errors || !item.data?.createItem) {
        Notification.error({ message: t("Failed to create item.") });
        return;
      }
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}/details/${item.data.createItem.item.id}`,
      );
      Notification.success({ message: t("Successfully created Item!") });
    },
    [currentModel?.id, createItem, navigate, currentWorkspace?.id, currentProject?.id, t],
  );

  const [updateItem, { loading: itemUpdatingLoading }] = useUpdateItemMutation({
    refetchQueries: ["GetItem"],
  });

  const handleItemUpdate = useCallback(
    async ({ itemId, fields }: { itemId: string; fields: ItemField[] }) => {
      const item = await updateItem({
        variables: {
          itemId: itemId,
          fields: fields as ItemFieldInput[],
          version: currentItem?.version ?? "",
        },
      });
      if (item.errors || !item.data?.updateItem) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      }
      Notification.success({ message: t("Successfully updated Item!") });
    },
    [updateItem, currentItem?.version, t],
  );

  const handleMetaItemUpdate = useCallback(
    async ({ metaItemId, metaFields }: { metaItemId: string; metaFields: ItemField[] }) => {
      const item = await updateItem({
        variables: {
          itemId: metaItemId,
          fields: metaFields as ItemFieldInput[],
          version: currentItem?.metadata?.version ?? "",
        },
      });
      if (item.errors || !item.data?.updateItem) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      }
      Notification.success({ message: t("Successfully updated Item!") });
    },
    [updateItem, currentItem?.metadata?.version, t],
  );

  const dateConvert = useCallback((value?: ItemValue) => {
    if (Array.isArray(value)) {
      return (value as string[]).map(valueItem => (valueItem ? moment(valueItem) : ""));
    } else {
      return value ? moment(value as string) : "";
    }
  }, []);

  const valueGet = useCallback(
    (field: Field) => {
      switch (field.type) {
        case "Select":
          return field.typeProperty?.selectDefaultValue;
        case "Integer":
          return field.typeProperty?.integerDefaultValue;
        case "Asset":
          return field.typeProperty?.assetDefaultValue;
        case "Date":
          return dateConvert(field.typeProperty?.defaultValue);
        default:
          return field.typeProperty?.defaultValue;
      }
    },
    [dateConvert],
  );

  const updateValueConvert = useCallback(
    ({ type, value }: ItemField) => {
      if (type === "Group") {
        if (value) {
          return value;
        } else {
          return newID();
        }
      } else if (type === "Date") {
        return dateConvert(value);
      } else {
        return value;
      }
    },
    [dateConvert],
  );

  const [initialFormValues, setInitialFormValues] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const handleInitialValuesSet = async () => {
      const initialValues: { [key: string]: any } = {};
      const groupInitialValuesUpdate = (group: Group, itemGroupId: string) => {
        group?.schema?.fields?.forEach(field => {
          initialValues[field.id] = {
            ...initialValues[field.id],
            ...{ [itemGroupId]: valueGet(field) },
          };
        });
      };

      if (currentItem) {
        currentItem?.fields?.forEach(field => {
          if (field.itemGroupId) {
            initialValues[field.schemaFieldId] = {
              ...initialValues[field.schemaFieldId],
              ...{ [field.itemGroupId]: updateValueConvert(field) },
            };
          } else {
            initialValues[field.schemaFieldId] = updateValueConvert(field);
          }
        });
      } else if (currentModel) {
        await Promise.all(
          currentModel.schema.fields.map(async field => {
            if (field.type === "Group") {
              if (field.multiple) {
                initialValues[field.id] = [];
              } else {
                const id = newID();
                initialValues[field.id] = id;
                if (field.typeProperty?.groupId) {
                  const group = await handleGroupGet(field.typeProperty.groupId);
                  if (group) groupInitialValuesUpdate(group, id);
                }
              }
            } else {
              initialValues[field.id] = valueGet(field);
            }
          }),
        );
      }

      setInitialFormValues(initialValues);
    };
    handleInitialValuesSet();
  }, [currentItem, currentModel, handleGroupGet, updateValueConvert, valueGet]);

  const initialMetaFormValues: { [key: string]: any } = useMemo(() => {
    const initialValues: { [key: string]: any } = {};
    if (!currentItem && !itemLoading) {
      currentModel?.metadataSchema?.fields?.forEach(field => {
        switch (field.type) {
          case "Tag": {
            const value = field.typeProperty?.selectDefaultValue;
            initialValues[field.id] = field.multiple ? (Array.isArray(value) ? value : []) : value;
            break;
          }
          case "Date":
            initialValues[field.id] = dateConvert(field.typeProperty?.defaultValue);
            break;
          default:
            initialValues[field.id] = field.typeProperty?.defaultValue;
            break;
        }
      });
    } else {
      currentItem?.metadata.fields?.forEach(field => {
        initialValues[field.schemaFieldId] =
          field.type === "Date" ? dateConvert(field.value) : field.value;
      });
    }
    return initialValues;
  }, [currentItem, currentModel, dateConvert, itemLoading]);

  const workspaceUserMembers = useMemo((): UserMember[] => {
    return (
      currentWorkspace?.members
        ?.map<UserMember | undefined>(member =>
          "userId" in member
            ? {
                userId: member.userId,
                user: member.user,
                role: member.role,
              }
            : undefined,
        )
        .filter(
          (user): user is UserMember =>
            !!user && (user.role === "OWNER" || user.role === "MAINTAINER"),
        ) ?? []
    );
  }, [currentWorkspace]);

  const [createRequestMutation, { loading: requestCreationLoading }] = useCreateRequestMutation({
    refetchQueries: ["GetModalRequests"],
  });

  const handleRequestCreate = useCallback(
    async (data: {
      title: string;
      description: string;
      state: RequestState;
      reviewersId: string[];
      items: { itemId: string }[];
    }) => {
      if (!currentProject?.id) return;
      const request = await createRequestMutation({
        variables: {
          projectId: currentProject.id,
          title: data.title,
          description: data.description,
          state: data.state as GQLRequestState,
          reviewersId: data.reviewersId,
          items: data.items,
        },
      });
      if (request.errors || !request.data?.createRequest) {
        Notification.error({ message: t("Failed to create request.") });
        return;
      }
      Notification.success({ message: t("Successfully created request!") });
      setRequestModalShown(false);
    },
    [createRequestMutation, currentProject?.id, t],
  );

  const [updateRequestMutation] = useUpdateRequestMutation({
    refetchQueries: ["GetRequests"],
  });

  const handleRequestUpdate = useCallback(
    async (data: RequestUpdatePayload) => {
      if (!data.requestId) return;
      const request = await updateRequestMutation({
        variables: {
          requestId: data.requestId,
          title: data.title,
          description: data.description,
          state: data.state as GQLRequestState,
          reviewersId: data.reviewersId,
          items: data.items,
        },
      });
      if (request.errors || !request.data?.updateRequest) {
        Notification.error({ message: t("Failed to update request.") });
        return;
      }
      Notification.success({ message: t("Successfully updated request!") });
      setRequestModalShown(false);
    },
    [updateRequestMutation, t],
  );
  const handleModalClose = useCallback(() => setRequestModalShown(false), []);

  const handleModalOpen = useCallback(() => setRequestModalShown(true), []);

  const handleReferenceModelUpdate = useCallback(
    (modelId: string, titleFieldId: string) => {
      getModel({
        variables: { id: modelId },
      });
      titleId.current = titleFieldId;
      handleSearchTerm();
    },
    [getModel, handleSearchTerm],
  );

  const [checkIfItemIsReferenced] = useIsItemReferencedLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleCheckItemReference = useCallback(
    async (value: string, correspondingFieldId: string) => {
      const res = await checkIfItemIsReferenced({
        variables: { itemId: value ?? "", correspondingFieldId },
      });
      return res.data?.isItemReferenced ?? false;
    },
    [checkIfItemIsReferenced],
  );

  return {
    loadingReference,
    linkedItemsModalList,
    showPublishAction,
    requests,
    itemId,
    itemLoading,
    requestCreationLoading,
    currentModel,
    currentItem,
    initialFormValues,
    initialMetaFormValues,
    itemCreationLoading,
    itemUpdatingLoading,
    collapsedModelMenu,
    collapsedCommentsPanel,
    requestModalShown,
    addItemToRequestModalShown,
    workspaceUserMembers,
    linkItemModalTitle: referenceModel?.name ?? "",
    linkItemModalTotalCount: itemsData?.searchItem.totalCount || 0,
    linkItemModalPage,
    linkItemModalPageSize,
    handleReferenceModelUpdate,
    handleSearchTerm,
    handleLinkItemTableReload,
    handleLinkItemTableChange,
    handleRequestTableChange,
    handleRequestSearchTerm,
    handleRequestTableReload,
    requestModalLoading: loading,
    requestModalTotalCount: totalCount,
    requestModalPage: page,
    requestModalPageSize: pageSize,
    handlePublish,
    handleUnpublish,
    handleAddItemToRequest,
    collapseCommentsPanel,
    collapseModelMenu,
    handleItemCreate,
    handleItemUpdate,
    handleMetaItemUpdate,
    handleNavigateToModel,
    handleRequestCreate,
    handleRequestUpdate,
    handleModalClose,
    handleModalOpen,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleGroupGet,
    handleCheckItemReference,
  };
};
