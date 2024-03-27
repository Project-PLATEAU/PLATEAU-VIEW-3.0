import styled from "@emotion/styled";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useBlocker } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Notification from "@reearth-cms/components/atoms/Notification";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Space from "@reearth-cms/components/atoms/Space";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import ContentSidebarWrapper from "@reearth-cms/components/molecules/Content/Form/SidebarWrapper";
import LinkItemRequestModal from "@reearth-cms/components/molecules/Content/LinkItemRequestModal/LinkItemRequestModal";
import PublishItemModal from "@reearth-cms/components/molecules/Content/PublishItemModal";
import RequestCreationModal from "@reearth-cms/components/molecules/Content/RequestCreationModal";
import {
  Item,
  FormItem,
  ItemField,
  ItemValue,
} from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { FieldType, Group, Field } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";
import { transformMomentToString } from "@reearth-cms/utils/format";

import { AssetField, GroupField, ReferenceField } from "./fields/ComplexFieldComponents";
import { DefaultField } from "./fields/FieldComponents";
import { FIELD_TYPE_COMPONENT_MAP } from "./fields/FieldTypesMap";

interface Props {
  item?: Item;
  loadingReference: boolean;
  linkedItemsModalList?: FormItem[];
  showPublishAction?: boolean;
  requests: Request[];
  itemId?: string;
  initialFormValues: any;
  initialMetaFormValues: any;
  loading: boolean;
  model?: Model;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType: UploadType;
  requestModalShown: boolean;
  requestCreationLoading: boolean;
  addItemToRequestModalShown: boolean;
  workspaceUserMembers: UserMember[];
  totalCount: number;
  page: number;
  pageSize: number;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  linkItemModalTitle: string;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onReferenceModelUpdate: (modelId: string, referenceFieldId: string) => void;
  onSearchTerm: (term?: string) => void;
  onLinkItemTableReload: () => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableReload: () => void;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onItemCreate: (data: {
    schemaId: string;
    metaSchemaId?: string;
    fields: ItemField[];
    metaFields: ItemField[];
  }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  onMetaItemUpdate: (data: { metaItemId: string; metaFields: ItemField[] }) => Promise<void>;
  onBack: (modelId?: string) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  onPublish: (itemIds: string[]) => Promise<void>;
  onRequestCreate: (data: {
    title: string;
    description: string;
    state: RequestState;
    reviewersId: string[];
    items: {
      itemId: string;
    }[];
  }) => Promise<void>;
  onChange: (request: Request, itemIds: string[]) => void;
  onModalClose: () => void;
  onModalOpen: () => void;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
  onCheckItemReference: (value: string, correspondingFieldId: string) => Promise<boolean>;
}

const ContentForm: React.FC<Props> = ({
  item,
  loadingReference,
  linkedItemsModalList,
  showPublishAction,
  requests,
  itemId,
  model,
  initialFormValues,
  initialMetaFormValues,
  loading,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  requestModalShown,
  addItemToRequestModalShown,
  workspaceUserMembers,
  totalCount,
  page,
  pageSize,
  onLinkItemTableReload,
  onRequestTableChange,
  onRequestSearchTerm,
  onRequestTableReload,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  requestCreationLoading,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onSearchTerm,
  onLinkItemTableChange,
  onPublish,
  onUnpublish,
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onItemCreate,
  onItemUpdate,
  onMetaItemUpdate,
  onBack,
  onAssetsGet,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onRequestCreate,
  onChange,
  onModalClose,
  onModalOpen,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onGetAsset,
  onGroupGet,
  onCheckItemReference,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [metaForm] = Form.useForm();
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const changedKeys = useRef(new Set<string>());
  const formItemsData = useMemo(() => item?.referencedItems ?? [], [item?.referencedItems]);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      currentLocation.pathname !== nextLocation.pathname && changedKeys.current.size > 0,
  );

  const checkIfSingleGroupField = useCallback(
    (key: string, value: any) => {
      return (
        initialFormValues[key] &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !moment.isMoment(value) &&
        value !== null
      );
    },
    [initialFormValues],
  );

  const emptyConvert = useCallback((value: any) => {
    if (value === "" || value === null || (Array.isArray(value) && value.length === 0)) {
      return undefined;
    } else {
      return value;
    }
  }, []);

  const handleValuesChange = useCallback(
    (changedValues: any) => {
      const [key, value] = Object.entries(changedValues)[0];
      if (checkIfSingleGroupField(key, value)) {
        const [groupFieldKey, groupFieldValue] = Object.entries(initialFormValues[key])[0];
        const changedFieldValue = (value as any)[groupFieldKey];
        if (
          JSON.stringify(emptyConvert(changedFieldValue)) ===
          JSON.stringify(emptyConvert(groupFieldValue))
        ) {
          changedKeys.current.delete(key);
        } else if (changedFieldValue !== undefined) {
          changedKeys.current.add(key);
        }
      } else if (
        JSON.stringify(emptyConvert(value)) === JSON.stringify(emptyConvert(initialFormValues[key]))
      ) {
        changedKeys.current.delete(key);
      } else {
        changedKeys.current.add(key);
      }
    },
    [checkIfSingleGroupField, emptyConvert, initialFormValues],
  );

  useEffect(() => {
    const openNotification = () => {
      const key = `open${Date.now()}`;
      const btn = (
        <Space>
          <Button
            onClick={() => {
              Notification.close(key);
              blocker.reset?.();
            }}>
            {t("Cancel")}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              Notification.close(key);
              blocker.proceed?.();
            }}>
            {t("Leave")}
          </Button>
        </Space>
      );
      Notification.config({
        maxCount: 1,
      });

      Notification.info({
        message: t("This item has unsaved data"),
        description: t("Are you going to leave?"),
        btn,
        key,
        placement: "top",
        // TODO: Change to false when antd is updated
        closeIcon: <span />,
      });
    };
    if (blocker.state === "blocked") {
      openNotification();
    }
  }, [t, blocker]);

  useEffect(() => {
    const handleBeforeUnloadEvent = (event: BeforeUnloadEvent) => {
      if (changedKeys.current.size === 0) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnloadEvent, true);
    return () => window.removeEventListener("beforeunload", handleBeforeUnloadEvent, true);
  }, []);

  useEffect(() => {
    form.setFieldsValue(initialFormValues);
  }, [form, initialFormValues]);

  useEffect(() => {
    metaForm.setFieldsValue(initialMetaFormValues);
  }, [metaForm, initialMetaFormValues]);

  const handleBack = useCallback(() => {
    onBack(model?.id);
  }, [onBack, model]);

  const unpublishedItems = useMemo(
    () => formItemsData?.filter(item => item.status !== "PUBLIC") ?? [],
    [formItemsData],
  );

  const inputValueGet = useCallback((value: ItemValue, multiple: boolean) => {
    if (multiple) {
      if (Array.isArray(value)) {
        return value.map(v => (moment.isMoment(v) ? transformMomentToString(v) : v));
      } else {
        return [];
      }
    } else {
      return moment.isMoment(value) ? transformMomentToString(value) : value ?? "";
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const modelFields = new Map((model?.schema.fields || []).map(field => [field.id, field]));
      const groupFields = new Map<string, Field>();
      if (model) {
        await Promise.all(
          model.schema.fields.map(async field => {
            if (field.typeProperty?.groupId) {
              const group = await onGroupGet(field.typeProperty.groupId);
              group?.schema.fields?.forEach(field => groupFields.set(field.id, field));
            }
          }),
        );
      }

      const values = await form.validateFields();
      const fields: ItemField[] = [];
      for (const [key, value] of Object.entries(values)) {
        const modelField = modelFields.get(key);
        if (modelField) {
          fields.push({
            value: inputValueGet(value as ItemValue, modelField.multiple),
            schemaFieldId: key,
            type: modelField.type,
          });
        } else if (typeof value === "object" && value !== null) {
          for (const [groupFieldKey, groupFieldValue] of Object.entries(value)) {
            const groupField = groupFields.get(key);
            if (groupField) {
              fields.push({
                value: inputValueGet(groupFieldValue, groupField.multiple),
                schemaFieldId: key,
                itemGroupId: groupFieldKey,
                type: groupField.type,
              });
            }
          }
        }
      }

      const metaValues = await metaForm.validateFields();
      const metaFields: ItemField[] = [];
      for (const [key, value] of Object.entries(metaValues)) {
        const type = model?.metadataSchema?.fields?.find(field => field.id === key)?.type;
        if (type) {
          metaFields.push({
            value: moment.isMoment(value) ? transformMomentToString(value) : value ?? "",
            schemaFieldId: key,
            type,
          });
        }
      }

      changedKeys.current.clear();

      if (itemId) {
        await onItemUpdate?.({
          itemId: itemId,
          fields,
        });
      } else if (model?.schema.id) {
        await onItemCreate?.({
          schemaId: model?.schema.id,
          metaSchemaId: model?.metadataSchema?.id,
          metaFields,
          fields,
        });
      }
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [model, form, metaForm, itemId, onGroupGet, inputValueGet, onItemUpdate, onItemCreate]);

  const handleMetaUpdate = useCallback(async () => {
    if (!itemId || !item?.metadata?.id) return;
    try {
      const metaValues = await metaForm.validateFields();
      const metaFields: { schemaFieldId: string; type: FieldType; value: string }[] = [];
      for (const [key, value] of Object.entries(metaValues)) {
        metaFields.push({
          value: (moment.isMoment(value) ? transformMomentToString(value) : value ?? "") as string,
          schemaFieldId: key,
          type: model?.metadataSchema?.fields?.find(field => field.id === key)?.type as FieldType,
        });
      }
      await onMetaItemUpdate?.({
        metaItemId: item.metadata.id,
        metaFields,
      });
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [itemId, item, metaForm, onMetaItemUpdate, model?.metadataSchema?.fields]);

  const items: MenuProps["items"] = useMemo(() => {
    const menuItems = [
      {
        key: "addToRequest",
        label: t("Add to Request"),
        onClick: onAddItemToRequestModalOpen,
      },
      {
        key: "unpublish",
        label: t("Unpublish"),
        onClick: () => itemId && (onUnpublish([itemId]) as any),
      },
    ];
    if (showPublishAction) {
      menuItems.unshift({
        key: "NewRequest",
        label: t("New Request"),
        onClick: onModalOpen,
      });
    }
    return menuItems;
  }, [itemId, showPublishAction, onAddItemToRequestModalOpen, onUnpublish, onModalOpen, t]);

  const handlePublishSubmit = useCallback(async () => {
    if (!itemId || !unpublishedItems) return;
    if (unpublishedItems.length === 0) {
      onPublish([itemId]);
    } else {
      setPublishModalOpen(true);
    }
  }, [itemId, unpublishedItems, onPublish, setPublishModalOpen]);

  const handlePublishItemClose = useCallback(() => {
    setPublishModalOpen(false);
  }, [setPublishModalOpen]);

  return (
    <>
      <StyledForm
        form={form}
        layout="vertical"
        initialValues={initialFormValues}
        onValuesChange={handleValuesChange}>
        <PageHeader
          title={model?.name}
          onBack={handleBack}
          extra={
            <>
              <Button htmlType="submit" onClick={handleSubmit} loading={loading}>
                {t("Save")}
              </Button>
              {itemId && (
                <>
                  {showPublishAction && (
                    <Button type="primary" onClick={handlePublishSubmit}>
                      {t("Publish")}
                    </Button>
                  )}
                  {!showPublishAction && (
                    <Button type="primary" onClick={onModalOpen}>
                      {t("New Request")}
                    </Button>
                  )}
                  <Dropdown menu={{ items }} trigger={["click"]}>
                    <Button>
                      <Icon icon="ellipsis" />
                    </Button>
                  </Dropdown>
                </>
              )}
            </>
          }
        />
        <FormItemsWrapper>
          {model?.schema.fields.map(field => {
            const FieldComponent =
              FIELD_TYPE_COMPONENT_MAP[
                field.type as
                  | "Select"
                  | "Date"
                  | "Tag"
                  | "Bool"
                  | "Checkbox"
                  | "URL"
                  | "TextArea"
                  | "MarkdownText"
                  | "Integer"
              ] || DefaultField;

            if (field.type === "Asset") {
              return (
                <StyledFormItemWrapper key={field.id}>
                  <AssetField
                    field={field}
                    assetList={assetList}
                    itemAssets={item?.assets}
                    fileList={fileList}
                    loadingAssets={loadingAssets}
                    uploading={uploading}
                    uploadModalVisibility={uploadModalVisibility}
                    uploadUrl={uploadUrl}
                    uploadType={uploadType}
                    totalCount={totalCount}
                    page={page}
                    pageSize={pageSize}
                    onAssetTableChange={onAssetTableChange}
                    onUploadModalCancel={onUploadModalCancel}
                    setUploadUrl={setUploadUrl}
                    setUploadType={setUploadType}
                    onAssetsCreate={onAssetsCreate}
                    onAssetCreateFromUrl={onAssetCreateFromUrl}
                    onAssetsGet={onAssetsGet}
                    onAssetsReload={onAssetsReload}
                    onAssetSearchTerm={onAssetSearchTerm}
                    setFileList={setFileList}
                    setUploadModalVisibility={setUploadModalVisibility}
                    onGetAsset={onGetAsset}
                  />
                </StyledFormItemWrapper>
              );
            } else if (field.type === "Reference") {
              return (
                <StyledFormItemWrapper key={field.id}>
                  <ReferenceField
                    field={field}
                    loading={loadingReference}
                    linkedItemsModalList={linkedItemsModalList}
                    formItemsData={formItemsData}
                    linkItemModalTitle={linkItemModalTitle}
                    linkItemModalTotalCount={linkItemModalTotalCount}
                    linkItemModalPage={linkItemModalPage}
                    linkItemModalPageSize={linkItemModalPageSize}
                    onReferenceModelUpdate={onReferenceModelUpdate}
                    onSearchTerm={onSearchTerm}
                    onLinkItemTableReload={onLinkItemTableReload}
                    onLinkItemTableChange={onLinkItemTableChange}
                    onCheckItemReference={onCheckItemReference}
                  />
                </StyledFormItemWrapper>
              );
            } else if (field.type === "Group") {
              return (
                <StyledFormItemWrapper key={field.id}>
                  <GroupField
                    field={field}
                    form={form}
                    loadingReference={loadingReference}
                    linkedItemsModalList={linkedItemsModalList}
                    linkItemModalTitle={linkItemModalTitle}
                    formItemsData={formItemsData}
                    itemAssets={item?.assets}
                    assetList={assetList}
                    fileList={fileList}
                    loadingAssets={loadingAssets}
                    uploading={uploading}
                    uploadModalVisibility={uploadModalVisibility}
                    uploadUrl={uploadUrl}
                    uploadType={uploadType}
                    totalCount={totalCount}
                    page={page}
                    pageSize={pageSize}
                    linkItemModalTotalCount={linkItemModalTotalCount}
                    linkItemModalPage={linkItemModalPage}
                    linkItemModalPageSize={linkItemModalPageSize}
                    onSearchTerm={onSearchTerm}
                    onReferenceModelUpdate={onReferenceModelUpdate}
                    onLinkItemTableReload={onLinkItemTableReload}
                    onLinkItemTableChange={onLinkItemTableChange}
                    onAssetTableChange={onAssetTableChange}
                    onUploadModalCancel={onUploadModalCancel}
                    setUploadUrl={setUploadUrl}
                    setUploadType={setUploadType}
                    onAssetsCreate={onAssetsCreate}
                    onAssetCreateFromUrl={onAssetCreateFromUrl}
                    onAssetsGet={onAssetsGet}
                    onAssetsReload={onAssetsReload}
                    onAssetSearchTerm={onAssetSearchTerm}
                    setFileList={setFileList}
                    setUploadModalVisibility={setUploadModalVisibility}
                    onGetAsset={onGetAsset}
                    onGroupGet={onGroupGet}
                    onCheckItemReference={onCheckItemReference}
                  />
                </StyledFormItemWrapper>
              );
            } else {
              return (
                <StyledFormItemWrapper key={field.id}>
                  <FieldComponent field={field} />
                </StyledFormItemWrapper>
              );
            }
          })}
        </FormItemsWrapper>
      </StyledForm>
      <SideBarWrapper>
        <Form form={metaForm} layout="vertical" initialValues={initialMetaFormValues}>
          <ContentSidebarWrapper item={item} />
          {model?.metadataSchema?.fields?.map(field => {
            const FieldComponent =
              FIELD_TYPE_COMPONENT_MAP[
                field.type as "Tag" | "Date" | "Bool" | "Checkbox" | "URL"
              ] || DefaultField;
            return (
              <MetaFormItemWrapper key={field.id}>
                <FieldComponent field={field} onMetaUpdate={handleMetaUpdate} />
              </MetaFormItemWrapper>
            );
          })}
        </Form>
      </SideBarWrapper>
      {itemId && (
        <>
          <RequestCreationModal
            unpublishedItems={unpublishedItems}
            itemId={itemId}
            open={requestModalShown}
            onClose={onModalClose}
            onSubmit={onRequestCreate}
            requestCreationLoading={requestCreationLoading}
            workspaceUserMembers={workspaceUserMembers}
          />
          <LinkItemRequestModal
            itemIds={[itemId]}
            onChange={onChange}
            onLinkItemRequestModalCancel={onAddItemToRequestModalClose}
            visible={addItemToRequestModalShown}
            linkedRequest={undefined}
            requestList={requests}
            onRequestTableChange={onRequestTableChange}
            requestModalLoading={requestModalLoading}
            requestModalTotalCount={requestModalTotalCount}
            requestModalPage={requestModalPage}
            requestModalPageSize={requestModalPageSize}
            onRequestSearchTerm={onRequestSearchTerm}
            onRequestTableReload={onRequestTableReload}
          />
          <PublishItemModal
            unpublishedItems={unpublishedItems}
            itemId={itemId}
            open={publishModalOpen}
            onClose={handlePublishItemClose}
            onSubmit={onPublish}
          />
        </>
      )}
    </>
  );
};

const StyledFormItemWrapper = styled.div`
  width: 500px;
  word-wrap: break-word;
`;

const StyledForm = styled(Form)`
  width: 100%;
  height: 100%;
  background: #fff;
  label {
    width: 100%;
    display: flex;
  }
`;

const FormItemsWrapper = styled.div`
  max-height: calc(100% - 72px);
  overflow-y: auto;
  padding: 36px;
`;

const SideBarWrapper = styled.div`
  background-color: #fafafa;
  padding: 8px;
  width: 400px;
  max-height: 100%;
  overflow-y: auto;
`;

const MetaFormItemWrapper = styled.div`
  padding: 12px;
  margin-bottom: 8px;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 2px;
`;

export default ContentForm;
