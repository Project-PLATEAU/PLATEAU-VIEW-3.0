import styled from "@emotion/styled";
import { useMemo } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import Radio from "@reearth-cms/components/atoms/Radio";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import useHooks from "./hooks";

type StretchColumn = ProColumns<Request> & { minWidth: number };

type Props = {
  itemIds: string[];
  visible: boolean;
  onLinkItemRequestModalCancel: () => void;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  onRequestTableChange: (page: number, pageSize: number) => void;
  linkedRequest?: Request;
  requestList: Request[];
  onChange?: (value: Request, itemIds: string[]) => void;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableReload: () => void;
};

const LinkItemRequestModal: React.FC<Props> = ({
  itemIds,
  visible,
  onLinkItemRequestModalCancel,
  requestList,
  onRequestTableChange,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  onChange,
  onRequestSearchTerm,
  onRequestTableReload,
}) => {
  const t = useT();
  const { pagination, submit, resetFlag, selectedRequestId, setSelectedRequestId } = useHooks(
    itemIds,
    onLinkItemRequestModalCancel,
    requestList,
    requestModalTotalCount,
    requestModalPage,
    requestModalPageSize,
    onChange,
  );

  const columns: StretchColumn[] = useMemo(
    () => [
      {
        title: "",
        hideInSetting: true,
        fixed: "left",
        align: "center",
        width: 32,
        minWidth: 32,
        render: (_, request) => {
          return (
            <Radio.Group
              onChange={() => {
                setSelectedRequestId(request.id);
              }}
              value={selectedRequestId}>
              <Radio value={request.id} />
            </Radio.Group>
          );
        },
      },
      {
        title: t("Title"),
        dataIndex: "title",
        key: "title",
        ellipsis: true,
        width: 200,
        minWidth: 200,
      },
      {
        title: t("State"),
        dataIndex: "requestState",
        key: "requestState",
        ellipsis: true,
        width: 130,
        minWidth: 130,
        render: (_, request) => {
          let color = "";
          switch (request.state) {
            case "APPROVED":
              color = "#52C41A";
              break;
            case "CLOSED":
              color = "#F5222D";
              break;
            case "WAITING":
              color = "#FA8C16";
              break;
            case "DRAFT":
            default:
              break;
          }
          return <Badge color={color} text={request.state} />;
        },
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy.name",
        key: "createdBy",
        ellipsis: true,
        width: 100,
        minWidth: 100,
        render: (_, request) => {
          return request.createdBy?.name;
        },
      },
      {
        title: t("Reviewers"),
        dataIndex: "reviewers.name",
        key: "reviewers",
        ellipsis: true,
        width: 130,
        minWidth: 130,
        render: (_, request) => (
          <Space>
            <div>
              {request.reviewers
                .filter((_, index) => index < 3)
                .map(reviewer => (
                  <StyledUserAvatar key={reviewer.name} username={reviewer.name} size={"small"} />
                ))}
            </div>
            {request.reviewers.map(reviewer => reviewer.name).join(", ")}
          </Space>
        ),
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
    [selectedRequestId, setSelectedRequestId, t],
  );

  const options = useMemo(
    () => ({
      reload: onRequestTableReload,
    }),
    [onRequestTableReload],
  );

  const toolbar = {
    search: (
      <Input.Search
        allowClear
        placeholder={t("input search text")}
        onSearch={onRequestSearchTerm}
        key={+resetFlag.current}
      />
    ),
  };

  return (
    <StyledModal
      open={visible}
      title={t("Add to Request")}
      centered
      onOk={submit}
      onCancel={onLinkItemRequestModalCancel}
      width="70vw"
      bodyStyle={{
        minHeight: "50vh",
        position: "relative",
        padding: "12px 12px 0",
      }}
      afterClose={() => {
        resetFlag.current = !resetFlag.current;
      }}>
      <ResizableProTable
        dataSource={requestList}
        columns={columns}
        search={false}
        pagination={pagination}
        loading={requestModalLoading}
        onChange={pagination => {
          onRequestTableChange(pagination.current ?? 1, pagination.pageSize ?? 10);
        }}
        options={options}
        toolbar={toolbar}
        heightOffset={0}
      />
    </StyledModal>
  );
};

export default LinkItemRequestModal;

const StyledUserAvatar = styled(UserAvatar)`
  :nth-child(1) {
    z-index: 2;
  }
  :nth-child(2) {
    z-index: 1;
  }
  :nth-child(n + 2) {
    margin-left: -18px;
  }
`;

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
