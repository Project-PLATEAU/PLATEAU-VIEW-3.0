import Loading from "@reearth-cms/components/atoms/Loading";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import RequestMolecule from "@reearth-cms/components/molecules/Request/Details/Request";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";

export type Props = {
  me?: User;
  isCloseActionEnabled: boolean;
  isApproveActionEnabled: boolean;
  currentRequest?: Request;
  workspaceUserMembers: UserMember[];
  onRequestApprove: (requestId: string) => Promise<void>;
  onRequestUpdate: (data: RequestUpdatePayload) => Promise<void>;
  onRequestDelete: (requestsId: string[]) => Promise<void>;
  onCommentCreate: (content: string) => Promise<void>;
  onCommentUpdate: (commentId: string, content: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onBack: () => void;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  loading: boolean;
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
};

const RequestDetailsMolecule: React.FC<Props> = ({
  me,
  isCloseActionEnabled,
  isApproveActionEnabled,
  currentRequest,
  workspaceUserMembers,
  onRequestApprove,
  onRequestUpdate,
  onRequestDelete,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete,
  onBack,
  assetList,
  fileList,
  loadingAssets,
  loading,
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
  onAssetsReload,
  onAssetsGet,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onGetAsset,
}) => {
  return loading ? (
    <Loading spinnerSize="large" minHeight="100vh" />
  ) : currentRequest ? (
    <RequestMolecule
      me={me}
      isCloseActionEnabled={isCloseActionEnabled}
      isApproveActionEnabled={isApproveActionEnabled}
      currentRequest={currentRequest}
      workspaceUserMembers={workspaceUserMembers}
      onRequestApprove={onRequestApprove}
      onRequestUpdate={onRequestUpdate}
      onRequestDelete={onRequestDelete}
      onCommentCreate={onCommentCreate}
      onCommentUpdate={onCommentUpdate}
      onCommentDelete={onCommentDelete}
      onBack={onBack}
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
    <NotFound />
  );
};
export default RequestDetailsMolecule;
