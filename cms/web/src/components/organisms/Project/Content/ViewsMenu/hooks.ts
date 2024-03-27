import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { AndCondition, View } from "@reearth-cms/components/molecules/View/types";
import {
  fromGraphQLView,
  toGraphAndConditionInput,
  toGraphColumnSelectionInput,
  toGraphItemSort,
} from "@reearth-cms/components/organisms/DataConverters/table";
import { filterConvert } from "@reearth-cms/components/organisms/Project/Content/ContentList/utils";
import {
  View as GQLView,
  useCreateViewMutation,
  useDeleteViewMutation,
  useGetViewsQuery,
  useUpdateViewMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject } from "@reearth-cms/state";

import { CurrentViewType } from "../ContentList/hooks";

type Params = {
  currentView: CurrentViewType;
  setCurrentView: Dispatch<SetStateAction<CurrentViewType>>;
  onViewChange: () => void;
};

export type modalStateType = "rename" | "create";

export default ({ currentView, setCurrentView, onViewChange }: Params) => {
  const { modelId } = useParams();
  const t = useT();
  const [prevModelId, setPrevModelId] = useState<string>();
  const [viewModalShown, setViewModalShown] = useState(false);
  const [views, setViews] = useState<View[]>([]);
  const [selectedView, setSelectedView] = useState<View>();
  const [modalState, setModalState] = useState<modalStateType>("create");
  const [submitting, setSubmitting] = useState(false);
  const [currentProject] = useProject();

  const projectId = useMemo(() => currentProject?.id, [currentProject]);

  const { data } = useGetViewsQuery({
    variables: { modelId: modelId ?? "" },
    skip: !modelId,
  });

  useEffect(() => {
    const viewList = data?.view
      ?.map(view => fromGraphQLView(view as GQLView))
      .filter((view): view is View => !!view);
    if (viewList) {
      if (prevModelId !== modelId) {
        setSelectedView(viewList[0]);
        setPrevModelId(modelId);
      } else if (viewList.length > views.length) {
        setSelectedView(viewList[viewList.length - 1]);
      } else if (viewList.length < views.length) {
        setSelectedView(viewList[0]);
      }
    }
    setViews(viewList ?? []);
  }, [data?.view, modelId, prevModelId, views.length]);

  useEffect(() => {
    if (selectedView) {
      setCurrentView(prev => ({
        ...prev,
        id: selectedView.id,
        sort: selectedView.sort
          ? {
              field: {
                id:
                  selectedView.sort.field.type === "FIELD" ||
                  selectedView.sort.field.type === "META_FIELD"
                    ? selectedView.sort.field.id
                    : undefined,
                type: selectedView.sort.field.type,
              },
              direction: selectedView.sort?.direction ? selectedView.sort?.direction : "ASC",
            }
          : undefined,
        columns: selectedView.columns ? selectedView.columns : [],
        filter: filterConvert(selectedView.filter as AndCondition),
      }));
    } else {
      //initial currentView when there is no view in the specific model
      setCurrentView({
        columns: [],
      });
    }
  }, [selectedView, setCurrentView]);

  const handleViewRenameModalOpen = useCallback(() => {
    setModalState("rename");
    setViewModalShown(true);
  }, []);

  const handleViewCreateModalOpen = useCallback(() => {
    setModalState("create");
    setViewModalShown(true);
  }, []);

  const handleViewModalReset = useCallback(() => {
    setViewModalShown(false);
    setSubmitting(false);
  }, [setViewModalShown, setSubmitting]);

  const [createNewView] = useCreateViewMutation({
    refetchQueries: ["GetViews"],
  });

  const handleViewCreate = useCallback(
    async (data: { name: string }) => {
      setSubmitting(true);
      const view = await createNewView({
        variables: {
          name: data.name,
          projectId: projectId ?? "",
          modelId: modelId ?? "",
          sort: currentView?.sort ? toGraphItemSort(currentView?.sort) : undefined,
          columns: currentView?.columns
            ? currentView?.columns.map(column => toGraphColumnSelectionInput(column))
            : undefined,
          filter: currentView.filter
            ? {
                and: toGraphAndConditionInput(currentView.filter),
              }
            : undefined,
        },
      });
      if (view.errors || !view.data?.createView) {
        Notification.error({ message: t("Failed to create view.") });
        return;
      }
      setViewModalShown(false);
      onViewChange();
      Notification.success({ message: t("Successfully created view!") });
    },
    [
      createNewView,
      projectId,
      modelId,
      currentView?.sort,
      currentView?.columns,
      currentView?.filter,
      onViewChange,
      t,
    ],
  );

  const [updateNewView] = useUpdateViewMutation({
    refetchQueries: ["GetViews"],
  });

  const handleViewUpdate = useCallback(
    async (viewId: string, name: string) => {
      if (!viewId) return;
      setSubmitting(true);
      const view = await updateNewView({
        variables: {
          viewId: viewId,
          name: name,
          sort: currentView?.sort ? toGraphItemSort(currentView?.sort) : undefined,
          columns: currentView?.columns
            ? currentView?.columns.map(column => toGraphColumnSelectionInput(column))
            : undefined,
          filter: currentView.filter
            ? {
                and: toGraphAndConditionInput(currentView.filter),
              }
            : undefined,
        },
      });
      if (view.errors || !view.data?.updateView) {
        Notification.error({ message: t("Failed to update view.") });
        return;
      }
      Notification.success({ message: t("Successfully updated view!") });
      handleViewModalReset();
    },
    [updateNewView, currentView, t, handleViewModalReset],
  );

  const handleViewRename = useCallback(
    async (data: { viewId?: string; name: string }) => {
      if (!data.viewId) return;
      setSubmitting(true);
      const sort = selectedView?.sort ? toGraphItemSort(selectedView?.sort) : undefined;
      const columns = selectedView?.columns
        ? selectedView?.columns.map(column => toGraphColumnSelectionInput(column))
        : undefined;
      const currentfilter = filterConvert(selectedView?.filter as AndCondition);
      const view = await updateNewView({
        variables: {
          viewId: data.viewId,
          name: data.name,
          sort: sort,
          columns: columns,
          filter: currentfilter
            ? {
                and: toGraphAndConditionInput(currentfilter),
              }
            : undefined,
        },
      });
      if (view.errors || !view.data?.updateView) {
        Notification.error({ message: t("Failed to rename view.") });
        return;
      }
      Notification.success({ message: t("Successfully renamed view!") });
      handleViewModalReset();
    },
    [handleViewModalReset, t, updateNewView, setSubmitting, selectedView],
  );

  const [deleteView] = useDeleteViewMutation({
    refetchQueries: ["GetViews"],
  });

  const handleViewDelete = useCallback(
    async (viewId?: string) => {
      if (!viewId) return;
      const res = await deleteView({ variables: { viewId } });
      if (res.errors || !res.data?.deleteView) {
        Notification.error({ message: t("Failed to delete view.") });
      } else {
        Notification.success({ message: t("Successfully deleted view!") });
        onViewChange();
      }
    },
    [deleteView, onViewChange, t],
  );

  return {
    views,
    modalState,
    handleViewRenameModalOpen,
    handleViewCreateModalOpen,
    selectedView,
    setSelectedView,
    viewModalShown,
    submitting,
    handleViewModalReset,
    handleViewCreate,
    handleViewUpdate,
    handleViewRename,
    handleViewDelete,
  };
};
