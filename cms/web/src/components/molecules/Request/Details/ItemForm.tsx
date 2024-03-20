import styled from "@emotion/styled";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MarkdownInput from "@reearth-cms/components/atoms/Markdown";
import Select from "@reearth-cms/components/atoms/Select";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import AssetItem from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import MultiValueAsset from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueAsset";
import MultiValueSelect from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueSelect";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";

import ReferenceFormItem from "../../Content/Form/ReferenceFormItem";

export interface Props {
  initialFormValues: any;
  schema?: any;
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
  onGetAsset: (assetId: string) => Promise<string | undefined>;
}

const RequestItemForm: React.FC<Props> = ({
  schema,
  initialFormValues,
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
  onGetAsset,
}) => {
  const { Option } = Select;
  const [form] = Form.useForm();
  return (
    <StyledForm form={form} layout="vertical" initialValues={initialFormValues}>
      <FormItemsWrapper>
        {schema?.fields.map((field: any) =>
          field.type === "TextArea" ? (
            <Form.Item
              key={field.id}
              extra={field.description}
              name={field.id}
              label={
                <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
              }>
              {field.multiple ? (
                <MultiValueField
                  disabled={true}
                  rows={3}
                  showCount
                  maxLength={field.typeProperty.maxLength ?? false}
                  FieldInput={TextArea}
                />
              ) : (
                <TextArea
                  disabled={true}
                  rows={3}
                  showCount
                  maxLength={field.typeProperty.maxLength ?? false}
                />
              )}
            </Form.Item>
          ) : field.type === "MarkdownText" ? (
            <Form.Item
              key={field.id}
              extra={field.description}
              name={field.id}
              label={
                <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
              }>
              {field.multiple ? (
                <MultiValueField
                  disabled={true}
                  maxLength={field.typeProperty.maxLength ?? false}
                  FieldInput={MarkdownInput}
                />
              ) : (
                <MarkdownInput disabled={true} maxLength={field.typeProperty.maxLength ?? false} />
              )}
            </Form.Item>
          ) : field.type === "Integer" ? (
            <Form.Item
              key={field.id}
              extra={field.description}
              name={field.id}
              label={
                <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
              }>
              {field.multiple ? (
                <MultiValueField
                  disabled={true}
                  type="number"
                  min={field.typeProperty.min}
                  max={field.typeProperty.max}
                  FieldInput={InputNumber}
                />
              ) : (
                <InputNumber
                  disabled={true}
                  type="number"
                  min={field.typeProperty.min}
                  max={field.typeProperty.max}
                />
              )}
            </Form.Item>
          ) : field.type === "Asset" ? (
            <Form.Item
              key={field.id}
              extra={field.description}
              name={field.id}
              label={
                <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
              }>
              {field.multiple ? (
                <MultiValueAsset
                  disabled={true}
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
              ) : (
                <AssetItem
                  key={field.id}
                  disabled={true}
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
              )}
            </Form.Item>
          ) : field.type === "Reference" ? (
            <Form.Item
              key={field.id}
              extra={field.description}
              name={field.id}
              label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
              <ReferenceFormItem
                key={field.id}
                correspondingFieldId={field.id}
                modelId={field.typeProperty.modelId}
                disabled
              />
            </Form.Item>
          ) : field.type === "Select" ? (
            <Form.Item
              key={field.id}
              extra={field.description}
              name={field.id}
              label={
                <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
              }>
              {field.multiple ? (
                <MultiValueSelect disabled={true} selectedValues={field.typeProperty?.values} />
              ) : (
                <Select disabled={true} allowClear>
                  {field.typeProperty?.values?.map((value: string) => (
                    <Option key={value} value={value}>
                      {value}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : field.type === "URL" ? (
            <Form.Item
              key={field.id}
              extra={field.description}
              name={field.id}
              label={
                <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
              }>
              {field.multiple ? (
                <MultiValueField
                  disabled={true}
                  showCount={true}
                  maxLength={field.typeProperty.maxLength ?? 500}
                  FieldInput={Input}
                />
              ) : (
                <Input
                  disabled={true}
                  showCount={true}
                  maxLength={field.typeProperty.maxLength ?? 500}
                />
              )}
            </Form.Item>
          ) : (
            <Form.Item
              key={field.id}
              extra={field.description}
              name={field.id}
              label={
                <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
              }>
              {field.multiple ? (
                <MultiValueField
                  disabled={true}
                  showCount={true}
                  maxLength={field.typeProperty.maxLength ?? 500}
                  FieldInput={Input}
                />
              ) : (
                <Input
                  disabled={true}
                  showCount={true}
                  maxLength={field.typeProperty.maxLength ?? 500}
                />
              )}
            </Form.Item>
          ),
        )}
      </FormItemsWrapper>
    </StyledForm>
  );
};

export default RequestItemForm;

const StyledForm = styled(Form)`
  padding: 16px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #fff;
  label {
    width: 100%;
    display: flex;
  }
`;

const FormItemsWrapper = styled.div`
  width: 50%;
  @media (max-width: 1200px) {
    width: 100%;
  }
`;
