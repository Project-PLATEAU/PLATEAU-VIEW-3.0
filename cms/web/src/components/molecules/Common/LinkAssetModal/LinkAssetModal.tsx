import styled from "@emotion/styled";
import { useState, useRef, useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import {
  ProColumns,
  ListToolBarProps,
  OptionConfig,
  TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import { UploadProps, UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import UploadAsset from "@reearth-cms/components/molecules/Asset/UploadAsset";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";

type StretchColumn = ProColumns<Asset> & { minWidth: number };

type Props = {
  visible: boolean;
  onLinkAssetModalCancel: () => void;
  linkedAsset?: ItemAsset;
  assetList: Asset[];
  fileList: UploadFile<File>[];
  loading: boolean;
  uploading: boolean;
  uploadProps: UploadProps;
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
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onChange?: (value: string) => void;
  onSelect: (selectedAsset: ItemAsset) => void;
  onAssetsReload: () => void;
  onSearchTerm: (term?: string) => void;
  displayUploadModal: () => void;
  onUploadModalCancel: () => void;
  onUploadAndLink: () => void;
};

const LinkAssetModal: React.FC<Props> = ({
  visible,
  onLinkAssetModalCancel,
  linkedAsset,
  assetList,
  fileList,
  loading,
  uploading,
  uploadProps,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  totalCount,
  page,
  pageSize,
  onAssetTableChange,
  setUploadUrl,
  setUploadType,
  onChange,
  onSelect,
  onAssetsReload,
  onSearchTerm,
  displayUploadModal,
  onUploadModalCancel,
  onUploadAndLink,
}) => {
  const t = useT();
  const [hoveredAssetId, setHoveredAssetId] = useState<string>();
  const resetFlag = useRef(false);

  const options: OptionConfig = useMemo(
    () => ({
      search: true,
      reload: onAssetsReload,
    }),
    [onAssetsReload],
  );

  const toolbar: ListToolBarProps = {
    search: (
      <Input.Search
        allowClear
        placeholder={t("input search text")}
        onSearch={(value: string) => {
          onSearchTerm(value);
        }}
        key={+resetFlag.current}
      />
    ),
  };

  const pagination: TablePaginationConfig = useMemo(
    () => ({
      showSizeChanger: true,
      current: page,
      total: totalCount,
      pageSize: pageSize,
    }),
    [page, pageSize, totalCount],
  );

  const onLinkClick = useCallback(
    (isLink: boolean, asset: Asset) => {
      onChange?.(isLink ? asset.id : "");
      onLinkAssetModalCancel();
      if (isLink) onSelect({ id: asset.id, fileName: asset.fileName });
    },
    [onChange, onLinkAssetModalCancel, onSelect],
  );

  const columns: StretchColumn[] = useMemo(
    () => [
      {
        title: "",
        hideInSetting: true,
        fixed: "left",
        align: "center",
        width: 48,
        minWidth: 48,
        render: (_, asset) => {
          const isLink =
            (asset.id === linkedAsset?.id && hoveredAssetId !== asset.id) ||
            (asset.id !== linkedAsset?.id && hoveredAssetId === asset.id);
          return (
            <Button
              type="link"
              onMouseEnter={() => setHoveredAssetId(asset.id)}
              onMouseLeave={() => setHoveredAssetId(undefined)}
              icon={<Icon icon={isLink ? "linkSolid" : "unlinkSolid"} size={16} />}
              onClick={() => onLinkClick(isLink, asset)}
            />
          );
        },
      },
      {
        title: t("File"),
        dataIndex: "fileName",
        key: "fileName",
        ellipsis: true,
        width: 170,
        minWidth: 170,
      },
      {
        title: t("Size"),
        dataIndex: "size",
        key: "size",
        render: (_text, record) => bytesFormat(record.size),
        ellipsis: true,
        width: 130,
        minWidth: 130,
      },
      {
        title: t("Preview Type"),
        dataIndex: "previewType",
        key: "previewType",
        ellipsis: true,
        width: 130,
        minWidth: 130,
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        key: "createdAt",
        ellipsis: true,
        width: 130,
        minWidth: 130,
        render: (_text, record) => dateTimeFormat(record.createdAt),
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy",
        key: "createdBy",
        ellipsis: true,
        width: 100,
        minWidth: 100,
      },
    ],
    [hoveredAssetId, linkedAsset?.id, onLinkClick, t],
  );

  return (
    <StyledModal
      title={t("Link Asset")}
      centered
      open={visible}
      onCancel={onLinkAssetModalCancel}
      afterClose={() => {
        onSearchTerm();
        resetFlag.current = !resetFlag.current;
      }}
      footer={[
        <UploadAsset
          key={1}
          alsoLink
          fileList={fileList}
          uploading={uploading}
          uploadProps={uploadProps}
          uploadModalVisibility={uploadModalVisibility}
          uploadUrl={uploadUrl}
          uploadType={uploadType}
          setUploadUrl={setUploadUrl}
          setUploadType={setUploadType}
          displayUploadModal={displayUploadModal}
          onUploadModalCancel={onUploadModalCancel}
          onUpload={onUploadAndLink}
          onUploadModalClose={onLinkAssetModalCancel}
        />,
      ]}
      width="70vw"
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        padding: "12px",
      }}>
      <ResizableProTable
        dataSource={assetList}
        columns={columns}
        search={false}
        options={options}
        pagination={pagination}
        toolbar={toolbar}
        loading={loading}
        onChange={(pagination, _, sorter: any) => {
          onAssetTableChange(
            pagination.current ?? 1,
            pagination.pageSize ?? 10,
            sorter?.order
              ? { type: sorter.columnKey, direction: sorter.order === "ascend" ? "ASC" : "DESC" }
              : undefined,
          );
        }}
        heightOffset={0}
      />
    </StyledModal>
  );
};

export default LinkAssetModal;

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
