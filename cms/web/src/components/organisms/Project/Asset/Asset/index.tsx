import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Loading from "@reearth-cms/components/atoms/Loading";
import AssetWrapper from "@reearth-cms/components/molecules/Asset/Asset/AssetBody";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import useSettingsHooks from "@reearth-cms/components/organisms/Settings/General/hooks";

import useHooks from "./hooks";

const Asset: React.FC = () => {
  const navigate = useNavigate();
  const { workspaceId, projectId, assetId } = useParams();
  const {
    asset,
    assetFileExt,
    isLoading,
    selectedPreviewType,
    isModalVisible,
    collapsed,
    viewerType,
    displayUnzipFileList,
    decompressing,
    handleAssetDecompress,
    handleAssetItemSelect,
    handleToggleCommentMenu,
    handleAssetUpdate,
    handleTypeChange,
    handleModalCancel,
    handleFullScreen,
  } = useHooks(assetId);

  const { workspaceSettings } = useSettingsHooks();

  const handleSave = useCallback(async () => {
    if (assetId) {
      await handleAssetUpdate(assetId, selectedPreviewType);
    }
  }, [assetId, handleAssetUpdate, selectedPreviewType]);

  const handleBack = useCallback(() => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/asset/`);
  }, [navigate, projectId, workspaceId]);

  return isLoading ? (
    <Loading spinnerSize="large" minHeight="100vh" />
  ) : (
    <AssetWrapper
      commentsPanel={
        <CommentsPanel
          comments={asset?.comments}
          threadId={asset?.threadId}
          collapsed={collapsed}
          onCollapse={handleToggleCommentMenu}
          refetchQueries={["GetAssetItem"]}
        />
      }
      asset={asset}
      assetFileExt={assetFileExt}
      selectedPreviewType={selectedPreviewType}
      isModalVisible={isModalVisible}
      viewerType={viewerType}
      displayUnzipFileList={displayUnzipFileList}
      decompressing={decompressing}
      onAssetItemSelect={handleAssetItemSelect}
      onAssetDecompress={handleAssetDecompress}
      onTypeChange={handleTypeChange}
      onModalCancel={handleModalCancel}
      onChangeToFullScreen={handleFullScreen}
      onBack={handleBack}
      onSave={handleSave}
      workspaceSettings={workspaceSettings}
    />
  );
};

export default Asset;
