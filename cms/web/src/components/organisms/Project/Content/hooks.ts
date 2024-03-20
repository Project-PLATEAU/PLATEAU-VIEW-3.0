import { useCallback, useEffect, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { fromGraphQLRequest } from "@reearth-cms/components/organisms/DataConverters/content";
import {
  useUpdateRequestMutation,
  RequestState as GQLRequestState,
  Request as GQLRequest,
  useGetModalRequestsLazyQuery,
  useUnpublishItemMutation,
  usePublishItemMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useModel, useProject, useWorkspace } from "@reearth-cms/state";

export default () => {
  const [currentModel] = useModel();
  const [currentWorkspace] = useWorkspace();
  const [currentProject] = useProject();
  const [addItemToRequestModalShown, setAddItemToRequestModalShown] = useState(false);
  const t = useT();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setPage(+page);
    setPageSize(+pageSize);
  }, [setPage, setPageSize, page, pageSize]);

  const [getModalRequests, { data, refetch, loading }] = useGetModalRequestsLazyQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      projectId: currentProject?.id ?? "",
      pagination: { first: pageSize, offset: (page - 1) * pageSize },
      sort: { key: "createdAt", reverted: true },
      state: ["WAITING"] as GQLRequestState[],
      key: searchTerm,
    },
  });

  const requests: Request[] = useMemo(
    () =>
      (data?.requests.nodes
        .map(request => fromGraphQLRequest(request as GQLRequest))
        .filter(request => !!request) as Request[]) ?? [],
    [data?.requests.nodes],
  );

  const [updateRequest] = useUpdateRequestMutation();

  const handleAddItemToRequest = useCallback(
    async (request: Request, itemIds: string[]) => {
      const item = await updateRequest({
        variables: {
          requestId: request.id,
          description: request.description,
          items: [
            ...new Set([...request.items.map(item => item.id), ...itemIds.map(itemId => itemId)]),
          ].map(itemId => ({ itemId })),
          reviewersId: request.reviewers.map(reviewer => reviewer.id),
          title: request.title,
          state: request.state as GQLRequestState,
        },
      });
      if (item.errors || !item.data?.updateRequest) {
        Notification.error({ message: t("Failed to update request.") });
        return;
      }

      Notification.success({ message: t("Successfully updated Request!") });
    },
    [updateRequest, t],
  );

  const [publishItem] = usePublishItemMutation();

  const handlePublish = useCallback(
    async (itemIds: string[]) => {
      const item = await publishItem({
        variables: {
          itemIds: itemIds,
        },
        refetchQueries: ["SearchItem", "GetItem", "GetItemsByIds"],
      });
      if (item.errors || !item.data?.publishItem) {
        Notification.error({ message: t("Failed to publish items.") });
        return;
      }

      Notification.success({ message: t("Successfully published items!") });
    },
    [publishItem, t],
  );

  const [unpublishItem] = useUnpublishItemMutation();

  const handleUnpublish = useCallback(
    async (itemIds: string[]) => {
      const item = await unpublishItem({
        variables: {
          itemIds: itemIds,
        },
        refetchQueries: ["SearchItem", "GetItem"],
      });
      if (item.errors || !item.data?.unpublishItem) {
        Notification.error({ message: t("Failed to unpublish items.") });
        return;
      }

      Notification.success({ message: t("Successfully unpublished items!") });
    },
    [unpublishItem, t],
  );

  const handleAddItemToRequestModalClose = useCallback(
    () => setAddItemToRequestModalShown(false),
    [],
  );

  const handleAddItemToRequestModalOpen = useCallback(() => {
    setPage(1);
    setPageSize(10);
    setSearchTerm("");
    setAddItemToRequestModalShown(true);
    getModalRequests();
  }, [getModalRequests]);

  const handleRequestTableChange = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  }, []);

  const handleRequestSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term ?? "");
    setPage(1);
  }, []);

  const handleRequestTableReload = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    currentWorkspace,
    currentModel,
    currentProject,
    requests,
    addItemToRequestModalShown,
    handlePublish,
    handleUnpublish,
    handleRequestTableChange,
    handleRequestSearchTerm,
    handleRequestTableReload,
    handleAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    loading,
    totalCount: data?.requests.totalCount ?? 0,
    page,
    pageSize,
  };
};
