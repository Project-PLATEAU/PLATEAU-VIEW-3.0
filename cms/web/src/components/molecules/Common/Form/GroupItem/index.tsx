import styled from "@emotion/styled";
import { useCallback, useMemo, MouseEvent, useState, useEffect } from "react";

import Collapse from "@reearth-cms/components/atoms/Collapse";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import {
  AssetField,
  ReferenceField,
} from "@reearth-cms/components/molecules/Content/Form/fields/ComplexFieldComponents";
import { DefaultField } from "@reearth-cms/components/molecules/Content/Form/fields/FieldComponents";
import { FIELD_TYPE_COMPONENT_MAP } from "@reearth-cms/components/molecules/Content/Form/fields/FieldTypesMap";
import { FormItem, ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { Field, Group } from "@reearth-cms/components/molecules/Schema/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  order?: number;
  parentField: Field;
  linkedItemsModalList?: FormItem[];
  linkItemModalTitle: string;
  formItemsData: FormItem[];
  itemAssets?: ItemAsset[];
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType: UploadType;
  totalCount: number;
  page: number;
  pageSize: number;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onSearchTerm: (term?: string) => void;
  onReferenceModelUpdate: (modelId: string, referenceFieldId: string) => void;
  onLinkItemTableReload: () => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
};

const GroupItem: React.FC<Props> = ({
  value,
  order,
  parentField,
  linkedItemsModalList,
  linkItemModalTitle,
  formItemsData,
  itemAssets,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  totalCount,
  page,
  pageSize,
  onSearchTerm,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onLinkItemTableReload,
  onLinkItemTableChange,
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsGet,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onMoveUp,
  onMoveDown,
  onDelete,
  disableMoveUp,
  disableMoveDown,
  onGetAsset,
  onGroupGet,
}) => {
  const { Panel } = Collapse;

  const [fields, setFields] = useState<Field[]>();

  useEffect(() => {
    const handleFieldsSet = async (id: string) => {
      const group = await onGroupGet(id);
      setFields(group?.schema.fields);
    };

    if (parentField?.typeProperty?.groupId) handleFieldsSet(parentField.typeProperty.groupId);
  }, [onGroupGet, parentField?.typeProperty?.groupId]);

  const itemGroupId = useMemo(() => value ?? "", [value]);

  const handleMoveUp = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      onMoveUp?.();
      e.stopPropagation();
    },
    [onMoveUp],
  );

  const handleMoveDown = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      onMoveDown?.();
      e.stopPropagation();
    },
    [onMoveDown],
  );

  const handleDelete = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      onDelete?.();
      e.stopPropagation();
    },
    [onDelete],
  );

  return (
    <StyledCollapse defaultActiveKey={["1"]}>
      <Panel
        header={parentField?.title + (order !== undefined ? ` (${order + 1})` : "")}
        key="1"
        extra={
          order !== undefined && (
            <>
              <IconWrapper disabled={disableMoveUp} onClick={handleMoveUp}>
                <Icon icon="arrowUp" />
              </IconWrapper>
              <IconWrapper disabled={disableMoveDown} onClick={handleMoveDown}>
                <Icon icon="arrowDown" />
              </IconWrapper>
              <IconWrapper onClick={handleDelete}>
                <Icon icon="delete" />
              </IconWrapper>
            </>
          )
        }>
        <FormItemsWrapper>
          {fields?.map((field: Field) => {
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
                    itemGroupId={itemGroupId}
                    itemAssets={itemAssets}
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
                    itemGroupId={itemGroupId}
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
                  />
                </StyledFormItemWrapper>
              );
            } else {
              return (
                <StyledFormItemWrapper key={field.id}>
                  <FieldComponent field={field} itemGroupId={itemGroupId} />
                </StyledFormItemWrapper>
              );
            }
          })}
        </FormItemsWrapper>
      </Panel>
    </StyledCollapse>
  );
};

const StyledCollapse = styled(Collapse)`
  width: 500px;
`;

const IconWrapper = styled.span<{ disabled?: boolean }>`
  margin-right: 10px;
  display: ${({ disabled }) => (disabled ? "none" : "inline-block")};
`;

const StyledFormItemWrapper = styled.div`
  width: 468px;
  word-wrap: break-word;
`;

const FormItemsWrapper = styled.div`
  width: 50%;
  @media (max-width: 1200px) {
    width: 100%;
  }
`;

export default GroupItem;
