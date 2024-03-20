import { Outlet } from "react-router-dom";

import CMSWrapperMolecule from "@reearth-cms/components/molecules/CMSWrapper";
import MoleculeHeader from "@reearth-cms/components/molecules/Common/Header";
import ProjectMenu from "@reearth-cms/components/molecules/Common/ProjectMenu";
import WorkspaceCreationModal from "@reearth-cms/components/molecules/Common/WorkspaceCreationModal";
import WorkspaceMenu from "@reearth-cms/components/molecules/Common/WorkspaceMenu";

import useHooks from "./hooks";

const CMSWrapper: React.FC = () => {
  const {
    username,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    workspaceModalShown,
    currentProject,
    selectedKey,
    secondaryRoute,
    collapsed,
    handleCollapse,
    handleProjectMenuNavigate,
    handleWorkspaceMenuNavigate,
    handleWorkspaceModalClose,
    handleWorkspaceModalOpen,
    handleWorkspaceCreate,
    handleNavigateToSettings,
    handleWorkspaceNavigation,
    handleHomeNavigation,
    logoUrl,
  } = useHooks();

  return (
    <>
      <CMSWrapperMolecule
        collapsed={collapsed}
        onCollapse={handleCollapse}
        headerComponent={
          <MoleculeHeader
            onWorkspaceModalOpen={handleWorkspaceModalOpen}
            onNavigateToSettings={handleNavigateToSettings}
            onWorkspaceNavigation={handleWorkspaceNavigation}
            onHomeNavigation={handleHomeNavigation}
            personalWorkspace={personalWorkspace}
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            currentProject={currentProject}
            username={username}
            logoUrl={logoUrl}
          />
        }
        sidebarComponent={
          secondaryRoute === "project" ? (
            <ProjectMenu
              defaultSelectedKey={selectedKey}
              inlineCollapsed={collapsed}
              onNavigate={handleProjectMenuNavigate}
            />
          ) : (
            <WorkspaceMenu
              defaultSelectedKey={selectedKey}
              inlineCollapsed={collapsed}
              isPersonalWorkspace={personalWorkspace?.id === currentWorkspace?.id}
              onNavigate={handleWorkspaceMenuNavigate}
            />
          )
        }
        contentComponent={<Outlet />}
      />
      <WorkspaceCreationModal
        open={workspaceModalShown}
        onClose={handleWorkspaceModalClose}
        onSubmit={handleWorkspaceCreate}
      />
    </>
  );
};

export default CMSWrapper;
