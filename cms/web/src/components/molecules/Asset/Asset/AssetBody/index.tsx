import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import { DefaultOptionType } from "@reearth-cms/components/atoms/Select";
import AssetMolecule from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/Asset";
import { PreviewType } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";
import { Asset, AssetItem, ViewerType } from "@reearth-cms/components/molecules/Asset/types";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  asset?: Asset;
  assetFileExt?: string;
  selectedPreviewType: PreviewType;
  isModalVisible: boolean;
  viewerType: ViewerType;
  displayUnzipFileList: boolean;
  decompressing: boolean;
  commentsPanel?: JSX.Element;
  onAssetItemSelect: (item: AssetItem) => void;
  onAssetDecompress: (assetId: string) => void;
  onTypeChange: (
    value: PreviewType,
    option: DefaultOptionType | DefaultOptionType[],
  ) => void | undefined;
  onModalCancel: () => void;
  onChangeToFullScreen: () => void;
  onBack: () => void;
  onSave: () => void;
  workspaceSettings?: WorkspaceSettings;
};

const AssetWrapper: React.FC<Props> = ({
  asset,
  assetFileExt,
  selectedPreviewType,
  isModalVisible,
  viewerType,
  displayUnzipFileList,
  decompressing,
  commentsPanel,
  onAssetItemSelect,
  onAssetDecompress,
  onTypeChange,
  onModalCancel,
  onChangeToFullScreen,
  onBack,
  onSave,
  workspaceSettings,
}) => {
  const t = useT();

  return asset ? (
    <ComplexInnerContents
      center={
        <Wrapper>
          <PageHeader
            title={`${t("Asset")}/${asset?.fileName}`}
            extra={<Button onClick={onSave}>{t("Save")}</Button>}
            onBack={onBack}
          />
          <AssetMolecule
            asset={asset}
            assetFileExt={assetFileExt}
            selectedPreviewType={selectedPreviewType}
            isModalVisible={isModalVisible}
            viewerType={viewerType}
            displayUnzipFileList={displayUnzipFileList}
            decompressing={decompressing}
            onAssetDecompress={onAssetDecompress}
            onAssetItemSelect={onAssetItemSelect}
            onTypeChange={onTypeChange}
            onModalCancel={onModalCancel}
            onChangeToFullScreen={onChangeToFullScreen}
            workspaceSettings={workspaceSettings}
          />
        </Wrapper>
      }
      right={commentsPanel}
    />
  ) : (
    <NotFound />
  );
};

export default AssetWrapper;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
`;
