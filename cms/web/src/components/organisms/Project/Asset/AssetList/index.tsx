import AssetListBody from "@reearth-cms/components/molecules/Asset/AssetList";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const AssetList: React.FC = () => {
  const t = useT();
  const {
    assetList,
    selection,
    fileList,
    uploading,
    uploadModalVisibility,
    loading,
    uploadUrl,
    uploadType,
    selectedAsset,
    collapsed,
    totalCount,
    page,
    pageSize,
    handleToggleCommentMenu,
    handleAssetItemSelect,
    handleAssetSelect,
    handleUploadModalCancel,
    setUploadUrl,
    setUploadType,
    setSelection,
    setFileList,
    setUploadModalVisibility,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleAssetDelete,
    handleSearchTerm,
    handleAssetsReload,
    handleNavigateToAsset,
    handleAssetTableChange,
  } = useHooks(true);

  return (
    <AssetListBody
      commentsPanel={
        <CommentsPanel
          collapsed={collapsed}
          onCollapse={handleToggleCommentMenu}
          emptyText={
            selectedAsset
              ? t("No comments.")
              : t("Please click the comment bubble in the table to check comments.")
          }
          comments={selectedAsset?.comments}
          threadId={selectedAsset?.threadId}
          refetchQueries={["GetAssetsItems"]}
        />
      }
      assetList={assetList}
      onAssetTableChange={handleAssetTableChange}
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      fileList={fileList}
      selection={selection}
      uploading={uploading}
      uploadModalVisibility={uploadModalVisibility}
      loading={loading}
      uploadUrl={uploadUrl}
      uploadType={uploadType}
      onAssetItemSelect={handleAssetItemSelect}
      onAssetSelect={handleAssetSelect}
      onUploadModalCancel={handleUploadModalCancel}
      setUploadUrl={setUploadUrl}
      setUploadType={setUploadType}
      selectedAsset={selectedAsset}
      onAssetsCreate={handleAssetsCreate}
      onAssetCreateFromUrl={handleAssetCreateFromUrl}
      onAssetDelete={handleAssetDelete}
      onAssetsReload={handleAssetsReload}
      onSearchTerm={handleSearchTerm}
      onEdit={handleNavigateToAsset}
      setSelection={setSelection}
      setFileList={setFileList}
      setUploadModalVisibility={setUploadModalVisibility}
    />
  );
};

export default AssetList;
