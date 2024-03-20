import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Content from "@reearth-cms/components/atoms/Content";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import PageHeader from "@reearth-cms/components/atoms/PageHeader";
import Search from "@reearth-cms/components/atoms/Search";
import Table from "@reearth-cms/components/atoms/Table";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Thumbnail",
    dataIndex: "thumbnail",
    key: "thumbnail",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
  },
  {
    title: "Action",
    dataIndex: "action",
    key: "action",
  },
];

type Props = {
  me: {
    id?: string;
    myWorkspace?: string;
  };
  owner: boolean;
  handleMemberRemoveFromWorkspace: (userId: string) => Promise<void>;
  handleSearchTerm: (term?: string) => void;
  handleRoleModalOpen: (member: UserMember) => void;
  handleMemberAddModalOpen: () => void;
  workspaceUserMembers?: UserMember[];
};

const MemberTable: React.FC<Props> = ({
  me,
  owner,
  handleMemberRemoveFromWorkspace,
  handleSearchTerm,
  handleRoleModalOpen,
  handleMemberAddModalOpen,
  workspaceUserMembers,
}) => {
  const t = useT();

  const { confirm } = Modal;

  const handleMemberDelete = useCallback(
    (member: UserMember) => {
      confirm({
        title: t("Are you sure to remove this member?"),
        icon: <Icon icon="exclamationCircle" />,
        content: t(
          "Remove this member from workspace means this member will not view any content of this workspace.",
        ),
        onOk() {
          handleMemberRemoveFromWorkspace(member?.userId);
        },
      });
    },
    [confirm, handleMemberRemoveFromWorkspace, t],
  );

  const dataSource = workspaceUserMembers?.map(member => ({
    key: member.userId,
    name: member.user.name,
    thumbnail: <UserAvatar username={member.user.name} />,
    email: member.user.email,
    role: member.role,
    action: (
      <>
        {member.userId !== me?.id && (
          <Button type="link" onClick={() => handleRoleModalOpen(member)} disabled={!owner}>
            {t("Change Role?")}
          </Button>
        )}
        {member.role !== "OWNER" && (
          <StyledButton type="link" onClick={() => handleMemberDelete(member)} disabled={!owner}>
            {t("Remove")}
          </StyledButton>
        )}
      </>
    ),
  }));

  return (
    <PaddedContent>
      <PageHeader
        title={t("Members")}
        extra={
          <Button
            type="primary"
            onClick={handleMemberAddModalOpen}
            icon={<Icon icon="userGroupAdd" />}>
            {t("New Member")}
          </Button>
        }
      />
      <ActionHeader>
        <StyledSearch
          onSearch={handleSearchTerm}
          placeholder={t("search for a member")}
          allowClear
        />
      </ActionHeader>
      <StyledTable dataSource={dataSource} columns={columns} />
    </PaddedContent>
  );
};

const PaddedContent = styled(Content)`
  margin: 16px;
  background-color: #fff;
  min-height: 100%;
`;

const ActionHeader = styled(Content)`
  border-top: 1px solid #f0f0f0;
  padding: 16px;
  display: flex;
  justify-content: space-between;
`;

const StyledButton = styled(Button)`
  margin-left: 8px;
`;

const StyledSearch = styled(Search)`
  width: 264px;
`;

const StyledTable = styled(Table)`
  padding: 24px;
  overflow-x: auto;
`;

export default MemberTable;
