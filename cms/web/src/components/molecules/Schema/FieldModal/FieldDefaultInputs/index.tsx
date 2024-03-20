import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";

import { FieldType } from "../../types";

import AssetField from "./AssetField";
import BooleanField from "./BooleanField";
import CheckboxField from "./CheckboxField";
import DateField from "./DateField";
import GroupField from "./GroupField";
import IntegerField from "./IntegerField";
import MarkdownField from "./Markdown";
import SelectField from "./SelectField";
import TagField from "./TagField";
import TextAreaField from "./TextArea";
import TextField from "./TextField";
import URLField from "./URLField";

export interface Props {
  selectedType: FieldType;
  multiple?: boolean;
  selectedValues: string[];
  selectedTags?: { id: string; name: string; color: string }[];
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  defaultValue?: string;
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
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
}

const FieldDefaultInputs: React.FC<Props> = ({
  selectedType,
  selectedValues,
  selectedTags,
  multiple,
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
  onAssetSearchTerm,
  onAssetsGet,
  onAssetsReload,
  onAssetsCreate,
  onAssetCreateFromUrl,
  setFileList,
  setUploadModalVisibility,
  onGetAsset,
}) => {
  return selectedType ? (
    selectedType === "TextArea" ? (
      <TextAreaField multiple={multiple} />
    ) : selectedType === "MarkdownText" ? (
      <MarkdownField multiple={multiple} />
    ) : selectedType === "Integer" ? (
      <IntegerField multiple={multiple} />
    ) : selectedType === "Bool" ? (
      <BooleanField multiple={multiple} />
    ) : selectedType === "Date" ? (
      <DateField multiple={multiple} />
    ) : selectedType === "Tag" ? (
      <TagField selectedTags={selectedTags} multiple={multiple} />
    ) : selectedType === "Checkbox" ? (
      <CheckboxField multiple={multiple} />
    ) : selectedType === "Asset" ? (
      <AssetField
        multiple={multiple}
        assetList={assetList}
        fileList={fileList}
        loadingAssets={loadingAssets}
        uploading={uploading}
        uploadModalVisibility={uploadModalVisibility}
        uploadUrl={uploadUrl}
        uploadType={uploadType}
        onAssetTableChange={onAssetTableChange}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onUploadModalCancel={onUploadModalCancel}
        setUploadUrl={setUploadUrl}
        setUploadType={setUploadType}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrl}
        onAssetSearchTerm={onAssetSearchTerm}
        onAssetsGet={onAssetsGet}
        onAssetsReload={onAssetsReload}
        setFileList={setFileList}
        setUploadModalVisibility={setUploadModalVisibility}
        onGetAsset={onGetAsset}
      />
    ) : selectedType === "Select" ? (
      <SelectField selectedValues={selectedValues} multiple={multiple} />
    ) : selectedType === "URL" ? (
      <URLField multiple={multiple} />
    ) : selectedType === "Group" ? (
      <GroupField />
    ) : (
      <TextField multiple={multiple} />
    )
  ) : null;
};

export default FieldDefaultInputs;
