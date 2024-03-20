import MemberAddModal from "@reearth-cms/components/molecules/Member/MemberAddModal";
import MemberRoleModal from "@reearth-cms/components/molecules/Member/MemberRoleModal";
import MemberTable from "@reearth-cms/components/molecules/Member/MemberTable";

import useHooks from "./hooks";

const Members: React.FC = () => {
  const {
    me,
    owner,
    searchedUser,
    handleSearchTerm,
    changeSearchedUser,
    searchedUserList,
    changeSearchedUserList,
    handleUserSearch,
    handleUserAdd,
    handleUsersAddToWorkspace,
    handleMemberOfWorkspaceUpdate,
    selectedMember,
    roleModalShown,
    handleMemberRemoveFromWorkspace,
    handleRoleModalClose,
    handleRoleModalOpen,
    handleMemberAddModalClose,
    handleMemberAddModalOpen,
    MemberAddModalShown,
    workspaceUserMembers,
  } = useHooks();

  return (
    <>
      <MemberTable
        me={me}
        owner={owner}
        handleMemberRemoveFromWorkspace={handleMemberRemoveFromWorkspace}
        handleSearchTerm={handleSearchTerm}
        handleRoleModalOpen={handleRoleModalOpen}
        handleMemberAddModalOpen={handleMemberAddModalOpen}
        workspaceUserMembers={workspaceUserMembers}
      />
      <MemberRoleModal
        member={selectedMember}
        open={roleModalShown}
        onClose={handleRoleModalClose}
        onSubmit={handleMemberOfWorkspaceUpdate}
      />
      <MemberAddModal
        open={MemberAddModalShown}
        searchedUser={searchedUser}
        searchedUserList={searchedUserList}
        changeSearchedUserList={changeSearchedUserList}
        onClose={handleMemberAddModalClose}
        onUserSearch={handleUserSearch}
        onUserAdd={handleUserAdd}
        changeSearchedUser={changeSearchedUser}
        onSubmit={handleUsersAddToWorkspace}
      />
    </>
  );
};

export default Members;
