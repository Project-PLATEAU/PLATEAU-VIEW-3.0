import styled from "@emotion/styled";
import { Key, useMemo, useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import DownloadButton from "@reearth-cms/components/atoms/DownloadButton";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Popover from "@reearth-cms/components/atoms/Popover";
import {
  ListToolBarProps,
  ProColumns,
  OptionConfig,
  TableRowSelection,
  TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import ArchiveExtractionStatus from "@reearth-cms/components/molecules/Asset/AssetListTable/ArchiveExtractionStatus";
import { Asset, AssetItem } from "@reearth-cms/components/molecules/Asset/types";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";
import { getExtension } from "@reearth-cms/utils/file";
import { dateTimeFormat, bytesFormat } from "@reearth-cms/utils/format";

import { compressedFileFormats } from "../../Common/Asset";

type StretchColumn = ProColumns<Asset> & { minWidth: number };

type Props = {
  assetList: Asset[];
  loading: boolean;
  selectedAsset: Asset | undefined;
  totalCount: number;
  page: number;
  pageSize: number;
  onAssetItemSelect: (item: AssetItem) => void;
  onAssetSelect: (assetId: string) => void;
  onEdit: (assetId: string) => void;
  onSearchTerm: (term?: string) => void;
  selection: {
    selectedRowKeys: Key[];
  };
  setSelection: (input: { selectedRowKeys: Key[] }) => void;
  onAssetsReload: () => void;
  onAssetDelete: (assetIds: string[]) => Promise<void>;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
};

const AssetListTable: React.FC<Props> = ({
  assetList,
  selection,
  loading,
  selectedAsset,
  totalCount,
  page,
  pageSize,
  onAssetItemSelect,
  onAssetSelect,
  onEdit,
  onSearchTerm,
  setSelection,
  onAssetsReload,
  onAssetDelete,
  onAssetTableChange,
}) => {
  const t = useT();

  const columns: StretchColumn[] = useMemo(
    () => [
      {
        title: "",
        render: (_, asset) => (
          <Icon icon="edit" color={"#1890ff"} onClick={() => onEdit(asset.id)} />
        ),
        align: "center",
        width: 48,
        minWidth: 48,
      },
      {
        title: () => <Icon icon="message" />,
        dataIndex: "commentsCount",
        key: "commentsCount",
        render: (_, asset) => {
          return (
            <CommentsButton type="link" onClick={() => onAssetSelect(asset.id)}>
              <CustomTag
                value={asset.comments?.length || 0}
                color={asset.id === selectedAsset?.id ? "#87e8de" : undefined}
              />
            </CommentsButton>
          );
        },
        align: "center",
        width: 48,
        minWidth: 48,
      },
      {
        title: t("File"),
        dataIndex: "fileName",
        key: "NAME",
        sorter: true,
        width: 340,
        minWidth: 340,
        ellipsis: true,
      },
      {
        title: t("Size"),
        dataIndex: "size",
        key: "SIZE",
        sorter: true,
        render: (_text, record) => bytesFormat(record.size),
        width: 100,
        minWidth: 100,
      },
      {
        title: t("Preview Type"),
        dataIndex: "previewType",
        key: "previewType",
        width: 120,
        minWidth: 120,
      },
      {
        title: t("Status"),
        dataIndex: "archiveExtractionStatus",
        key: "archiveExtractionStatus",
        render: (_, asset) => {
          const assetExtension = getExtension(asset.fileName);
          return (
            compressedFileFormats.includes(assetExtension) && (
              <ArchiveExtractionStatus archiveExtractionStatus={asset.archiveExtractionStatus} />
            )
          );
        },
        width: 130,
        minWidth: 130,
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        key: "DATE",
        sorter: true,
        render: (_text, record) => dateTimeFormat(record.createdAt),
        width: 150,
        minWidth: 150,
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy",
        key: "createdBy",
        render: (_, item) => (
          <Space>
            <UserAvatar username={item.createdBy} size={"small"} />
            {item.createdBy}
          </Space>
        ),
        width: 105,
        minWidth: 105,
        ellipsis: true,
      },
      {
        title: t("ID"),
        dataIndex: "id",
        key: "id",
        width: 240,
        minWidth: 240,
        ellipsis: true,
      },
      {
        title: t("Linked to"),
        key: "linkedTo",
        render: (_, asset) => {
          if (asset.items.length === 1) {
            return (
              <StyledButton type="link" onClick={() => onAssetItemSelect(asset?.items[0])}>
                {asset?.items[0].itemId}
              </StyledButton>
            );
          }
          if (asset.items.length > 1) {
            const content = (
              <>
                {asset.items.map(item => (
                  <div key={item.itemId}>
                    <Button type="link" onClick={() => onAssetItemSelect(item)}>
                      {item.itemId}
                    </Button>
                  </div>
                ))}
              </>
            );
            return (
              <Popover placement="bottom" title={t("Linked to")} content={content}>
                <MoreItemsButton type="default">
                  <Icon icon="linked" /> x{asset.items.length}
                </MoreItemsButton>
              </Popover>
            );
          }
        },
        width: 230,
        minWidth: 230,
      },
    ],
    [onAssetItemSelect, onAssetSelect, onEdit, selectedAsset?.id, t],
  );

  const options: OptionConfig = useMemo(
    () => ({
      search: true,
      fullScreen: true,
      reload: onAssetsReload,
    }),
    [onAssetsReload],
  );

  const pagination: TablePaginationConfig = useMemo(
    () => ({
      showSizeChanger: true,
      current: page,
      total: totalCount,
      pageSize: pageSize,
    }),
    [page, pageSize, totalCount],
  );

  const rowSelection: TableRowSelection = useMemo(
    () => ({
      selectedRowKeys: selection.selectedRowKeys,
      onChange: (selectedRowKeys: any) => {
        setSelection({
          ...selection,
          selectedRowKeys: selectedRowKeys,
        });
      },
    }),
    [selection, setSelection],
  );

  const toolbar: ListToolBarProps = useMemo(
    () => ({
      search: (
        <Input.Search
          allowClear
          placeholder={t("input search text")}
          onSearch={(value: string) => {
            onSearchTerm(value);
          }}
        />
      ),
    }),
    [onSearchTerm, t],
  );

  const AlertOptions = useCallback(
    (props: any) => {
      return (
        <Space size={16}>
          <DeselectButton onClick={props.onCleanSelected}>
            <Icon icon="clear" /> {t("Deselect")}
          </DeselectButton>
          <DownloadButton displayDefaultIcon type="link" selected={props.selectedRows} />
          <DeleteButton onClick={() => onAssetDelete?.(props.selectedRowKeys)}>
            <Icon icon="delete" /> {t("Delete")}
          </DeleteButton>
        </Space>
      );
    },
    [onAssetDelete, t],
  );

  return (
    <ResizableProTable
      dataSource={assetList}
      columns={columns}
      tableAlertOptionRender={AlertOptions}
      search={false}
      rowKey="id"
      options={options}
      pagination={pagination}
      toolbar={toolbar}
      rowSelection={rowSelection}
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
      heightOffset={72}
    />
  );
};

export default AssetListTable;

const CommentsButton = styled(Button)`
  padding: 0;
`;

const DeselectButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.a`
  color: #ff7875;
`;

const MoreItemsButton = styled(Button)`
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1890ff;
`;

const StyledButton = styled(Button)`
  padding: 0;
`;
