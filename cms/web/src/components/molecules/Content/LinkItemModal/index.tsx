import styled from "@emotion/styled";
import { useState, useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import { ProColumns, ListToolBarProps, OptionConfig } from "@reearth-cms/components/atoms/ProTable";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import { FormItem } from "../types";

import useHooks from "./hooks";

type StretchColumn = ProColumns<FormItem> & { minWidth: number };

type Props = {
  onChange?: (value: string) => void;
  linkedItemsModalList?: FormItem[];
  visible?: boolean;
  linkedItem?: string;
  correspondingFieldId: string;
  linkItemModalTitle?: string;
  linkItemModalTotalCount?: number;
  linkItemModalPage?: number;
  linkItemModalPageSize?: number;
  onSearchTerm: (term?: string) => void;
  onLinkItemTableReload: () => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onLinkItemModalCancel: () => void;
};

const LinkItemModal: React.FC<Props> = ({
  visible,
  correspondingFieldId,
  linkedItemsModalList,
  linkedItem,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onSearchTerm,
  onLinkItemTableReload,
  onLinkItemTableChange,
  onLinkItemModalCancel,
  onChange,
}) => {
  const [hoveredAssetId, setHoveredItemId] = useState<string>();
  const t = useT();
  const { confirm } = Modal;
  const { value, pagination, handleInput, handleCheckItemReference } = useHooks(
    linkItemModalTotalCount,
    linkItemModalPage,
    linkItemModalPageSize,
    visible,
  );

  const options: OptionConfig = useMemo(
    () => ({
      reload: onLinkItemTableReload,
    }),
    [onLinkItemTableReload],
  );

  const handleClick = useCallback(
    async (link: boolean, item: FormItem) => {
      if (!link) {
        onChange?.("");
        onLinkItemModalCancel();
        return;
      }

      const response = await handleCheckItemReference(item.id, correspondingFieldId);
      const isReferenced = response?.data?.isItemReferenced;

      if (isReferenced) {
        confirm({
          title: t("This item has been referenced"),
          content: t(
            "Are you going to refer to it? The previous reference will be canceled automatically",
          ),
          icon: <Icon icon="exclamationCircle" />,
          onOk() {
            onChange?.(item.id);
            onLinkItemModalCancel();
          },
        });
      } else {
        onChange?.(item.id);
        onLinkItemModalCancel();
      }
    },
    [confirm, correspondingFieldId, handleCheckItemReference, onChange, onLinkItemModalCancel, t],
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
        render: (_, item) => {
          const link =
            (item.id === linkedItem && hoveredAssetId !== item.id) ||
            (item.id !== linkedItem && hoveredAssetId === item.id);
          return (
            <Button
              type="link"
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(undefined)}
              icon={<Icon icon={link ? "linkSolid" : "unlinkSolid"} size={16} />}
              onClick={() => handleClick(link, item)}
            />
          );
        },
      },
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        ellipsis: true,
        width: 210,
        minWidth: 210,
      },
      {
        title: t("Title"),
        dataIndex: "title",
        key: "title",
        ellipsis: true,
        width: 230,
        minWidth: 230,
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy",
        key: "createdBy",
        ellipsis: true,
        width: 100,
        minWidth: 100,
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
    ],
    [t, linkedItem, hoveredAssetId, handleClick],
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
          value={value}
          onChange={handleInput}
        />
      ),
    }),
    [t, value, handleInput, onSearchTerm],
  );

  return (
    <StyledModal
      open={visible}
      title={linkItemModalTitle}
      centered
      width="70vw"
      footer={null}
      onCancel={onLinkItemModalCancel}
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        padding: "12px",
      }}>
      <ResizableProTable
        dataSource={linkedItemsModalList}
        columns={columns}
        search={false}
        options={options}
        toolbar={toolbar}
        pagination={pagination}
        onChange={pagination => {
          onLinkItemTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
        }}
        heightOffset={0}
      />
    </StyledModal>
  );
};

export default LinkItemModal;

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
