import styled from "@emotion/styled";
import { MenuProps } from "antd";
import { useMemo } from "react";

import { useAuth } from "@reearth-cms/auth";
import Header from "@reearth-cms/components/atoms/Header";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import { Project, Workspace } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

import HeaderDropdown from "./Dropdown";

export type { User } from "./types";

export interface Props {
  username?: string;
  personalWorkspace?: Workspace;
  currentWorkspace?: Workspace;
  workspaces?: any[];
  currentProject?: Project;
  onWorkspaceModalOpen: () => void;
  onNavigateToSettings: () => void;
  onWorkspaceNavigation: (id: number) => void;
  onHomeNavigation: () => void;
  logoUrl?: string;
}

const HeaderMolecule: React.FC<Props> = ({
  username,
  personalWorkspace,
  currentWorkspace,
  workspaces,
  currentProject,
  onWorkspaceModalOpen,
  onNavigateToSettings,
  onWorkspaceNavigation,
  onHomeNavigation,
  logoUrl,
}) => {
  const t = useT();
  const { logout } = useAuth();
  const url = useMemo(() => {
    if (window.REEARTH_CONFIG?.editorUrl && currentWorkspace?.id) {
      return new URL(`dashboard/${currentWorkspace.id}`, window.REEARTH_CONFIG?.editorUrl);
    }
    return undefined;
  }, [currentWorkspace?.id]);

  const currentIsPersonal = useMemo(
    () => currentWorkspace?.id === personalWorkspace?.id,
    [currentWorkspace?.id, personalWorkspace?.id],
  );

  const WorkspacesItems: MenuProps["items"] = useMemo(
    () => [
      {
        label: t("Personal Account"),
        key: "personal-account",
        type: "group",
        children: workspaces
          ?.filter(workspace => workspace.id === personalWorkspace?.id)
          ?.map(workspace => ({
            label: (
              <Tooltip title={workspace.name} placement="right">
                <MenuText>{workspace.name}</MenuText>
              </Tooltip>
            ),
            key: workspace.id,
            icon: <UserAvatar username={workspace.name} size="small" />,
            style: { paddingLeft: 0, paddingRight: 0 },
            onClick: () => onWorkspaceNavigation(workspace.id),
          })),
      },
      {
        type: "divider",
      },
      {
        label: t("Workspaces"),
        key: "workspaces",
        type: "group",
        children: workspaces
          ?.filter(workspace => workspace.id !== personalWorkspace?.id)
          ?.map(workspace => ({
            label: (
              <Tooltip title={workspace.name} placement="right">
                <MenuText>{workspace.name}</MenuText>
              </Tooltip>
            ),
            key: workspace.id,
            icon: <UserAvatar username={workspace.name} size="small" shape="square" />,
            style: { paddingLeft: 0, paddingRight: 0 },
            onClick: () => onWorkspaceNavigation(workspace.id),
          })),
      },
      {
        label: t("Create Workspace"),
        key: "new-workspace",
        icon: <Icon icon="userGroupAdd" />,
        onClick: onWorkspaceModalOpen,
      },
    ],
    [t, workspaces, onWorkspaceModalOpen, personalWorkspace?.id, onWorkspaceNavigation],
  );

  const AccountItems: MenuProps["items"] = useMemo(
    () => [
      {
        label: t("Account Settings"),
        key: "account-settings",
        icon: <Icon icon="user" />,
        onClick: onNavigateToSettings,
      },
      {
        label: t("Logout"),
        key: "logout",
        icon: <Icon icon="logout" />,
        onClick: logout,
      },
    ],
    [t, onNavigateToSettings, logout],
  );

  return (
    <MainHeader>
      {logoUrl ? (
        <LogoIcon src={logoUrl} onClick={onHomeNavigation} />
      ) : (
        <Logo onClick={onHomeNavigation}>{t("Re:Earth CMS")}</Logo>
      )}
      <VerticalDivider />
      <WorkspaceDropdown
        name={currentWorkspace?.name}
        items={WorkspacesItems}
        personal={currentIsPersonal}
      />
      {currentProject?.name && (
        <CurrentProject>
          <Break>/</Break>
          <ProjectText>{currentProject.name}</ProjectText>
        </CurrentProject>
      )}
      <Spacer />
      <AccountDropdown name={username} items={AccountItems} personal={true} />
      {url && (
        <LinkWrapper>
          <EditorLink rel="noreferrer" href={url.href} target="_blank">
            {t("Go to Editor")}
          </EditorLink>
        </LinkWrapper>
      )}
    </MainHeader>
  );
};

const MainHeader = styled(Header)`
  display: flex;
  align-items: center;
  height: 48px;
  line-height: 41px;
  padding: 0;
  background-color: #1d1d1d;

  .ant-space-item {
    color: #dbdbdb;
  }
`;

const Logo = styled.div`
  display: inline-block;
  color: #df3013;
  font-weight: 500;
  font-size: 14px;
  line-height: 48px;
  cursor: pointer;
  padding: 0 40px 0 20px;
`;

const LogoIcon = styled.img`
  width: 100px;
  margin: 0 0 0 10px;
  cursor: pointer;
`;

const Spacer = styled.div`
  flex: 1;
`;

const VerticalDivider = styled.div`
  display: inline-block;
  height: 32px;
  color: #fff;
  margin: 0;
  vertical-align: middle;
  border-top: 0;
  border-left: 1px solid #303030;
`;

const WorkspaceDropdown = styled(HeaderDropdown)`
  margin-left: 20px;
  padding-left: 20px;
`;

const AccountDropdown = styled(HeaderDropdown)`
  padding-right: 20px;
`;

const ProjectText = styled.p`
  margin: 0;
`;

const Break = styled.p`
  margin: 0 10px 0 10px;
`;

const CurrentProject = styled.div`
  height: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  color: #dbdbdb;
`;

const MenuText = styled.p`
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 140px;
`;

const LinkWrapper = styled.div`
  padding-right: 16px;
`;

const EditorLink = styled.a`
  border: 1px solid;
  color: #d9d9d9;
  padding: 5px 16px;
  :hover {
    color: #d9d9d9;
  }
`;

export default HeaderMolecule;
