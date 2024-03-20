import { Modal } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema";
import { Field, FieldType, Group } from "@reearth-cms/components/molecules/Schema/types";
import type { FormValues, ModelFormValues } from "@reearth-cms/components/molecules/Schema/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import { fromGraphQLGroup } from "@reearth-cms/components/organisms/DataConverters/schema";
import {
  useCreateFieldMutation,
  SchemaFieldType,
  SchemaFieldTypePropertyInput,
  useDeleteFieldMutation,
  useUpdateFieldMutation,
  useUpdateFieldsMutation,
  useGetModelsQuery,
  useGetGroupsQuery,
  useGetGroupQuery,
  Model as GQLModel,
  Group as GQLGroup,
  useCheckGroupKeyAvailabilityLazyQuery,
  useDeleteGroupMutation,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
  useCheckModelKeyAvailabilityLazyQuery,
  useModelsByGroupQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useModel } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const { confirm } = Modal;
  const navigate = useNavigate();
  const { projectId, workspaceId, modelId: schemaId } = useParams();
  const [currentModel, setCurrentModel] = useModel();

  const [fieldModalShown, setFieldModalShown] = useState(false);
  const [isMeta, setIsMeta] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedType, setSelectedType] = useState<FieldType | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const { data: modelsData } = useGetModelsQuery({
    variables: {
      projectId: projectId ?? "",
      pagination: { first: 100 },
    },
    skip: !projectId,
  });

  const models = useMemo(() => {
    return modelsData?.models.nodes
      ?.map<Model | undefined>(model => fromGraphQLModel(model as GQLModel))
      .filter((model): model is Model => !!model);
  }, [modelsData?.models.nodes]);

  const { data: groupsData } = useGetGroupsQuery({
    variables: {
      projectId: projectId ?? "",
    },
    skip: !projectId,
  });

  const groups = useMemo(() => {
    return groupsData?.groups
      ?.map<Group | undefined>(group => fromGraphQLGroup(group as GQLGroup))
      .filter((group): group is Group => !!group);
  }, [groupsData?.groups]);

  const { data: groupData } = useGetGroupQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      id: schemaId ?? "",
    },
    skip: !schemaId,
  });

  const group = useMemo(() => fromGraphQLGroup(groupData?.node as GQLGroup), [groupData?.node]);

  const selectedSchemaType: SelectedSchemaType = useMemo(
    () => (group ? "group" : "model"),
    [group],
  );

  useEffect(() => {
    if (!schemaId && currentModel) {
      navigate(`/workspace/${workspaceId}/project/${projectId}/schema/${currentModel.id}`);
    }
  }, [schemaId, currentModel, navigate, workspaceId, projectId]);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      navigate(`/workspace/${workspaceId}/project/${projectId}/schema/${modelId}`);
    },
    [navigate, workspaceId, projectId],
  );

  const handleGroupSelect = useCallback(
    (groupId: string) => {
      navigate(`/workspace/${workspaceId}/project/${projectId}/schema/${groupId}`);
    },
    [navigate, projectId, workspaceId],
  );

  const handleFieldKeyUnique = useCallback(
    (key: string, fieldId?: string): boolean => {
      return !currentModel?.schema.fields.some(
        field => field.key === key && (!fieldId || (fieldId && fieldId !== field.id)),
      );
    },
    [currentModel],
  );

  const [createNewField, { loading: fieldCreationLoading }] = useCreateFieldMutation({
    refetchQueries: ["GetModel", "GetGroup"],
  });

  const [updateField, { loading: fieldUpdateLoading }] = useUpdateFieldMutation({
    refetchQueries: ["GetModel", "GetGroup"],
  });

  const [deleteFieldMutation] = useDeleteFieldMutation({
    refetchQueries: ["GetModel", "GetGroup"],
  });

  const handleFieldDelete = useCallback(
    async (fieldId: string) => {
      if (!schemaId) return;
      const options = {
        variables: {
          fieldId,
          metadata: isMeta,
          modelId: selectedSchemaType === "model" ? schemaId : undefined,
          groupId: selectedSchemaType === "group" ? schemaId : undefined,
        },
      };
      const results = await deleteFieldMutation(options);
      if (results.errors) {
        Notification.error({ message: t("Failed to delete field.") });
        return;
      }
      Notification.success({ message: t("Successfully deleted field!") });
    },
    [schemaId, isMeta, selectedSchemaType, deleteFieldMutation, t],
  );

  const handleFieldUpdate = useCallback(
    async (data: FormValues) => {
      if (!schemaId || !data.fieldId) return;
      const options = {
        variables: {
          fieldId: data.fieldId,
          title: data.title,
          metadata: data.metadata,
          description: data.description,
          key: data.key,
          multiple: data.multiple,
          unique: data.unique,
          isTitle: data.isTitle,
          required: data.required,
          typeProperty: data.typeProperty as SchemaFieldTypePropertyInput,
          modelId: selectedSchemaType === "model" ? schemaId : undefined,
          groupId: selectedSchemaType === "group" ? schemaId : undefined,
        },
      };
      const field = await updateField(options);
      if (field.errors || !field.data?.updateField) {
        Notification.error({ message: t("Failed to update field.") });
        return;
      }
      Notification.success({ message: t("Successfully updated field!") });
      setFieldModalShown(false);
    },
    [schemaId, selectedSchemaType, updateField, t],
  );

  const [updateFieldsOrder] = useUpdateFieldsMutation({
    refetchQueries: ["GetModel"],
  });

  const handleFieldOrder = useCallback(
    async (fields: Field[]) => {
      if (!schemaId) return;
      const response = await updateFieldsOrder({
        variables: {
          updateFieldInput: fields.map((field, index) => ({
            fieldId: field.id,
            metadata: field.metadata,
            order: index,
            modelId: selectedSchemaType === "model" ? schemaId : undefined,
            groupId: selectedSchemaType === "group" ? schemaId : undefined,
          })),
        },
      });
      if (response.errors || !response?.data?.updateFields) {
        Notification.error({ message: t("Failed to update field.") });
        return;
      }
      Notification.success({ message: t("Successfully updated field!") });
      setFieldModalShown(false);
    },
    [schemaId, updateFieldsOrder, t, selectedSchemaType],
  );

  const handleFieldCreate = useCallback(
    async (data: FormValues) => {
      if (!schemaId) return;
      const options = {
        variables: {
          title: data.title,
          metadata: data.metadata,
          description: data.description,
          key: data.key,
          multiple: data.multiple,
          unique: data.unique,
          isTitle: data.isTitle,
          required: data.required,
          type: data.type as SchemaFieldType,
          typeProperty: data.typeProperty as SchemaFieldTypePropertyInput,
          modelId: selectedSchemaType === "model" ? schemaId : undefined,
          groupId: selectedSchemaType === "group" ? schemaId : undefined,
        },
      };
      const field = await createNewField(options);
      if (field.errors || !field.data?.createField) {
        Notification.error({ message: t("Failed to create field.") });
        setFieldModalShown(false);
        return;
      }
      Notification.success({ message: t("Successfully created field!") });
      setFieldModalShown(false);
    },
    [schemaId, selectedSchemaType, createNewField, t],
  );

  const handleFieldModalClose = useCallback(() => {
    setSelectedField(null);
    setFieldModalShown(false);
  }, [setSelectedField]);

  const handleFieldUpdateModalOpen = useCallback(
    (field: Field) => {
      setSelectedType(field.type);
      setSelectedField(field);
      setFieldModalShown(true);
    },
    [setSelectedField],
  );

  // group hooks
  const [groupModalShown, setGroupModalShown] = useState(false);
  const [groupDeletionModalShown, setGroupDeletionModalShown] = useState(false);

  const handleGroupModalOpen = useCallback(() => setGroupModalShown(true), []);
  const handleGroupModalClose = useCallback(() => setGroupModalShown(false), []);
  const handleGroupDeletionModalOpen = useCallback(
    () => setGroupDeletionModalShown(true),
    [setGroupDeletionModalShown],
  );
  const handleGroupDeletionModalClose = useCallback(
    () => setGroupDeletionModalShown(false),
    [setGroupDeletionModalShown],
  );
  const [CheckGroupKeyAvailability] = useCheckGroupKeyAvailabilityLazyQuery({
    fetchPolicy: "no-cache",
  });

  const { data: modelsByGroupData } = useModelsByGroupQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      groupId: schemaId ?? "",
    },
    skip: !schemaId || selectedSchemaType !== "group",
  });

  const [deleteGroup] = useDeleteGroupMutation({
    refetchQueries: ["GetGroups"],
  });

  const handleGroupDelete = useCallback(
    async (groupId?: string) => {
      if (!groupId) return;

      const modelsByGroup = modelsByGroupData?.modelsByGroup || [];
      const isGroupDeletable = modelsByGroup.length === 0;
      if (!isGroupDeletable) {
        handleGroupDeletionModalClose();
        const modelNames = modelsByGroup?.map(model => model?.name).join(", ");
        Modal.error({
          title: t("Group cannot be deleted"),
          content: `
          ${group?.name} ${t("is used in")} ${modelNames}. 
          ${t("If you want to delete it, please delete the field that uses it first.")}`,
        });
        return;
      }

      const res = await deleteGroup({ variables: { groupId } });
      if (res.errors || !res.data?.deleteGroup) {
        Notification.error({ message: t("Failed to delete group.") });
      } else {
        Notification.success({ message: t("Successfully deleted group!") });
        handleGroupDeletionModalClose();
        navigate(`/workspace/${workspaceId}/project/${projectId}/schema`);
      }
    },
    [
      deleteGroup,
      group?.name,
      handleGroupDeletionModalClose,
      modelsByGroupData?.modelsByGroup,
      navigate,
      projectId,
      t,
      workspaceId,
    ],
  );

  const [createNewGroup] = useCreateGroupMutation({
    refetchQueries: ["GetGroups"],
  });

  const handleGroupCreate = useCallback(
    async (data: ModelFormValues) => {
      if (!projectId) return;
      const group = await createNewGroup({
        variables: {
          projectId,
          name: data.name,
          description: data.description,
          key: data.key,
        },
      });
      if (group.errors || !group.data?.createGroup) {
        Notification.error({ message: t("Failed to create group.") });
        return;
      }
      Notification.success({ message: t("Successfully created group!") });
      handleGroupModalClose();
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/schema/${group.data?.createGroup.group.id}`,
      );
    },
    [projectId, createNewGroup, t, handleGroupModalClose, navigate, workspaceId],
  );

  const [updateNewGroup] = useUpdateGroupMutation({
    refetchQueries: ["GetGroups"],
  });

  const handleGroupUpdate = useCallback(
    async (data: ModelFormValues) => {
      if (!data.id) return;
      const group = await updateNewGroup({
        variables: {
          groupId: data.id,
          name: data.name,
          description: data.description,
          key: data.key,
        },
      });
      if (group.errors || !group.data?.updateGroup) {
        Notification.error({ message: t("Failed to update group.") });
        return;
      }
      Notification.success({ message: t("Successfully updated group!") });
      handleGroupModalClose();
    },
    [updateNewGroup, handleGroupModalClose, t],
  );

  const handleFieldCreationModalOpen = useCallback(
    (fieldType: FieldType) => {
      if (fieldType === "Group" && groups?.length === 0) {
        confirm({
          title: t("No available Group"),
          content: t("Please create a Group first to use the field"),
          okText: "Create Group",
          okType: "primary",
          cancelText: t("Cancel"),
          onOk() {
            handleGroupModalOpen();
          },
          onCancel() {
            handleGroupModalClose();
          },
        });
      } else {
        setSelectedType(fieldType);
        if (schemaId) setFieldModalShown(true);
      }
    },
    [confirm, groups?.length, handleGroupModalClose, handleGroupModalOpen, schemaId, t],
  );

  // model hooks
  const [modelModalShown, setModelModalShown] = useState(false);
  const [modelDeletionModalShown, setModelDeletionModalShown] = useState(false);

  const [CheckModelKeyAvailability] = useCheckModelKeyAvailabilityLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleModelDeletionModalOpen = useCallback(
    () => setModelDeletionModalShown(true),
    [setModelDeletionModalShown],
  );

  const handleModelDeletionModalClose = useCallback(
    () => setModelDeletionModalShown(false),
    [setModelDeletionModalShown],
  );

  const [deleteModel] = useDeleteModelMutation({
    refetchQueries: ["GetModels"],
  });

  const handleModelDelete = useCallback(
    async (modelId?: string) => {
      if (!modelId) return;
      const res = await deleteModel({ variables: { modelId } });
      if (res.errors || !res.data?.deleteModel) {
        Notification.error({ message: t("Failed to delete model.") });
      } else {
        Notification.success({ message: t("Successfully deleted model!") });
        handleModelDeletionModalClose();
        setCurrentModel(undefined);
        navigate(`/workspace/${workspaceId}/project/${projectId}/schema`);
      }
    },
    [
      deleteModel,
      handleModelDeletionModalClose,
      navigate,
      projectId,
      setCurrentModel,
      t,
      workspaceId,
    ],
  );

  const [updateNewModel] = useUpdateModelMutation({
    refetchQueries: ["GetModels"],
  });

  const handleModelModalClose = useCallback(() => setModelModalShown(false), []);
  const handleModelModalOpen = useCallback(() => setModelModalShown(true), []);

  const handleModelUpdate = useCallback(
    async (data: ModelFormValues) => {
      if (!data.id) return;
      const model = await updateNewModel({
        variables: {
          modelId: data.id,
          name: data.name,
          description: data.description,
          key: data.key,
          public: false,
        },
      });
      if (model.errors || !model.data?.updateModel) {
        Notification.error({ message: t("Failed to update model.") });
        return;
      }
      Notification.success({ message: t("Successfully updated model!") });
      handleModelModalClose();
    },
    [updateNewModel, handleModelModalClose, t],
  );

  const isGroup = useMemo(
    () => groupModalShown || selectedSchemaType === "group",
    [groupModalShown, selectedSchemaType],
  );

  const data = useMemo(() => (isGroup ? group : currentModel), [currentModel, group, isGroup]);

  const handleKeyCheck = useCallback(
    async (key: string, ignoredKey?: string) => {
      if (!projectId || !key) return false;
      if (ignoredKey && key === ignoredKey) return true;
      if (isGroup) {
        const response = await CheckGroupKeyAvailability({ variables: { projectId, key } });
        return response.data ? response.data.checkGroupKeyAvailability.available : false;
      } else {
        const response = await CheckModelKeyAvailability({ variables: { projectId, key } });
        return response.data ? response.data.checkModelKeyAvailability.available : false;
      }
    },
    [CheckGroupKeyAvailability, CheckModelKeyAvailability, isGroup, projectId],
  );

  const handleModalOpen = useMemo(
    () => (selectedSchemaType === "model" ? handleModelModalOpen : handleGroupModalOpen),
    [handleGroupModalOpen, handleModelModalOpen, selectedSchemaType],
  );

  const handleModalClose = useMemo(
    () => (isGroup ? handleGroupModalClose : handleModelModalClose),
    [handleGroupModalClose, handleModelModalClose, isGroup],
  );

  const handleDeletionModalOpen = useMemo(
    () =>
      selectedSchemaType === "model" ? handleModelDeletionModalOpen : handleGroupDeletionModalOpen,
    [handleGroupDeletionModalOpen, handleModelDeletionModalOpen, selectedSchemaType],
  );

  const handleDeletionModalClose = useMemo(
    () => (isGroup ? handleGroupDeletionModalClose : handleModelDeletionModalClose),
    [handleGroupDeletionModalClose, handleModelDeletionModalClose, isGroup],
  );

  const handleSchemaCreate = useMemo(
    () => (isGroup ? handleGroupCreate : undefined),
    [handleGroupCreate, isGroup],
  );

  const handleSchemaUpdate = useMemo(
    () => (isGroup ? handleGroupUpdate : handleModelUpdate),
    [handleGroupUpdate, handleModelUpdate, isGroup],
  );

  const handleSchemaDelete = useMemo(
    () => (isGroup ? handleGroupDelete : handleModelDelete),
    [handleGroupDelete, handleModelDelete, isGroup],
  );

  return {
    data,
    models,
    groups,
    isMeta,
    setIsMeta,
    fieldModalShown,
    selectedField,
    selectedType,
    collapsed,
    fieldCreationLoading,
    fieldUpdateLoading,
    setCollapsed,
    selectedSchemaType,
    handleModelSelect,
    handleGroupSelect,
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldModalClose,
    handleFieldCreate,
    handleFieldKeyUnique,
    handleFieldUpdate,
    handleFieldOrder,
    handleFieldDelete,
    handleKeyCheck,
    handleModalOpen,
    handleDeletionModalOpen,
    handleModalClose,
    handleDeletionModalClose,
    handleSchemaCreate,
    handleSchemaUpdate,
    handleSchemaDelete,
    groupModalShown,
    groupDeletionModalShown,
    modelModalShown,
    modelDeletionModalShown,
  };
};
