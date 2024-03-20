import styled from "@emotion/styled";
import { Key, useMemo, useCallback } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import {
  ListToolBarProps,
  ProColumns,
  OptionConfig,
  TableRowSelection,
  TablePaginationConfig,
} from "@reearth-cms/components/atoms/ProTable";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

type StretchColumn = ProColumns<Request> & { minWidth: number };

type Props = {
  requests: Request[];
  loading: boolean;
  selectedRequest: Request | undefined;
  onRequestSelect: (assetId: string) => void;
  onEdit: (requestId: string) => void;
  onSearchTerm: (term?: string) => void;
  selection: {
    selectedRowKeys: Key[];
  };
  setSelection: (input: { selectedRowKeys: Key[] }) => void;
  onRequestsReload: () => void;
  onRequestDelete: (requestIds: string[]) => void;
  onRequestTableChange: (
    page: number,
    pageSize: number,
    requestState?: RequestState[] | null,
    createdByMe?: boolean,
    reviewedByMe?: boolean,
  ) => void;
  totalCount: number;
  reviewedByMe: boolean;
  createdByMe: boolean;
  requestState: RequestState[];
  page: number;
  pageSize: number;
};

const RequestListTable: React.FC<Props> = ({
  requests,
  loading,
  selectedRequest,
  onRequestSelect,
  onEdit,
  onSearchTerm,
  selection,
  setSelection,
  onRequestsReload,
  onRequestDelete,
  onRequestTableChange,
  totalCount,
  reviewedByMe,
  createdByMe,
  requestState,
  page,
  pageSize,
}) => {
  const t = useT();

  const columns: StretchColumn[] = useMemo(
    () => [
      {
        title: "",
        render: (_, request) => (
          <Button type="link" icon={<Icon icon="edit" />} onClick={() => onEdit(request.id)} />
        ),
        width: 48,
        minWidth: 48,
        align: "center",
      },
      {
        title: () => <Icon icon="message" />,
        dataIndex: "commentsCount",
        key: "commentsCount",
        render: (_, request) => {
          return (
            <CommentsButton type="link" onClick={() => onRequestSelect(request.id)}>
              <CustomTag
                value={request.comments?.length || 0}
                color={request.id === selectedRequest?.id ? "#87e8de" : undefined}
              />
            </CommentsButton>
          );
        },
        width: 48,
        minWidth: 48,
        align: "center",
      },
      {
        title: t("Title"),
        dataIndex: "title",
        key: "title",
        width: 100,
        minWidth: 100,
        ellipsis: true,
      },
      {
        title: t("State"),
        dataIndex: "requestState",
        key: "requestState",
        render: (_, request) => {
          let color = "";
          let text = t("DRAFT");
          switch (request.state) {
            case "APPROVED":
              color = "#52C41A";
              text = t("APPROVED");
              break;
            case "CLOSED":
              color = "#F5222D";
              text = t("CLOSED");
              break;
            case "WAITING":
              color = "#FA8C16";
              text = t("WAITING");
              break;
            case "DRAFT":
            default:
              break;
          }
          return <Badge color={color} text={text} />;
        },
        filters: [
          { text: t("WAITING"), value: "WAITING" },
          { text: t("APPROVED"), value: "APPROVED" },
          { text: t("CLOSED"), value: "CLOSED" },
          { text: t("DRAFT"), value: "DRAFT" },
        ],
        defaultFilteredValue: requestState,
        width: 100,
        minWidth: 100,
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy.name",
        key: "createdBy",
        render: (_, request) => (
          <Space>
            <UserAvatar username={request.createdBy?.name} size={"small"} />
            {request.createdBy?.name}
          </Space>
        ),
        valueEnum: {
          all: { text: "All", status: "Default" },
          createdByMe: {
            text: t("Current user"),
          },
        },
        filters: true,
        defaultFilteredValue: createdByMe ? ["createdByMe"] : null,
        width: 105,
        minWidth: 105,
        ellipsis: true,
      },
      {
        title: t("Reviewers"),
        dataIndex: "reviewers.name",
        key: "reviewers",
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
        valueEnum: {
          all: { text: "All", status: "Default" },
          reviewedByMe: {
            text: t("Current user"),
          },
        },
        filters: true,
        defaultFilteredValue: reviewedByMe ? ["reviewedByMe"] : null,
        width: 105,
        minWidth: 105,
        ellipsis: true,
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        key: "createdAt",
        render: (_text, record) => dateTimeFormat(record.createdAt),
        width: 150,
        minWidth: 150,
      },
      {
        title: t("Updated At"),
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (_text, record) => dateTimeFormat(record.createdAt),
        width: 150,
        minWidth: 150,
      },
    ],
    [createdByMe, onEdit, onRequestSelect, requestState, reviewedByMe, selectedRequest?.id, t],
  );

  const options: OptionConfig = useMemo(
    () => ({
      search: true,
      fullScreen: true,
      reload: onRequestsReload,
    }),
    [onRequestsReload],
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

  const handleToolbarEvents: ListToolBarProps = useMemo(
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
          <DeleteButton onClick={() => onRequestDelete?.(props.selectedRowKeys)}>
            <Icon icon="delete" /> {t("Close")}
          </DeleteButton>
        </Space>
      );
    },
    [onRequestDelete, t],
  );

  return (
    <ResizableProTable
      dataSource={requests}
      columns={columns}
      tableAlertOptionRender={AlertOptions}
      search={false}
      rowKey="id"
      options={options}
      pagination={pagination}
      toolbar={handleToolbarEvents}
      rowSelection={rowSelection}
      loading={loading}
      onChange={(pagination, filters) => {
        onRequestTableChange(
          pagination.current ?? 1,
          pagination.pageSize ?? 10,
          filters?.requestState as RequestState[] | null,
          !!filters.createdBy?.[0],
          !!filters?.reviewers?.[0],
        );
      }}
      heightOffset={72}
    />
  );
};

export default RequestListTable;

const CommentsButton = styled(Button)`
  padding: 0;
`;

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

const DeselectButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.a`
  color: #ff7875;
`;
