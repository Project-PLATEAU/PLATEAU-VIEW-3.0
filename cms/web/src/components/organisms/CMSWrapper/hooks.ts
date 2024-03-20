import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import Notification from "@reearth-cms/components/atoms/Notification";
import { PublicScope } from "@reearth-cms/components/molecules/Accessibility/types";
import { Role, Workspace } from "@reearth-cms/components/molecules/Workspace/types";
import { fromGraphQLMember } from "@reearth-cms/components/organisms/DataConverters/setting";
import {
  useCreateWorkspaceMutation,
  useGetMeQuery,
  useGetProjectQuery,
  ProjectPublicationScope,
  WorkspaceMember,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace, useProject, useUserId, useWorkspaceId } from "@reearth-cms/state";
import { splitPathname } from "@reearth-cms/utils/path";

export default () => {
  const t = useT();
  const { projectId, workspaceId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logoUrl = window.REEARTH_CONFIG?.logoUrl;

  const [, setCurrentUserId] = useUserId();
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();
  const [, setCurrentWorkspaceId] = useWorkspaceId();
  const [currentProject, setCurrentProject] = useProject();
  const [workspaceModalShown, setWorkspaceModalShown] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { data, refetch } = useGetMeQuery();

  const [, secondaryRoute, subRoute] = useMemo(() => splitPathname(pathname), [pathname]);

  const username = useMemo(() => data?.me?.name || "", [data?.me?.name]);

  setCurrentUserId(data?.me?.id);

  const handleCollapse = useCallback((collapse: boolean) => {
    setCollapsed(collapse);
  }, []);

  const workspaces = data?.me?.workspaces;
  const workspace = workspaces?.find(workspace => workspace.id === workspaceId);
  const personalWorkspace: Workspace = useMemo(() => {
    const foundWorkspace = workspaces?.find(
      workspace => workspace.id === data?.me?.myWorkspace?.id,
    );
    return {
      id: foundWorkspace?.id,
      name: foundWorkspace?.name,
      members: foundWorkspace?.members?.map(member => fromGraphQLMember(member as WorkspaceMember)),
    };
  }, [data?.me?.myWorkspace?.id, workspaces]);
  const personal = workspaceId === data?.me?.myWorkspace?.id;

  useEffect(() => {
    if (currentWorkspace || workspaceId || !data) return;
    setCurrentWorkspace(data.me?.myWorkspace ?? undefined);
    setCurrentWorkspaceId(data.me?.myWorkspace?.id);
    navigate(`/workspace/${data.me?.myWorkspace?.id}`);
  }, [data, navigate, setCurrentWorkspace, setCurrentWorkspaceId, currentWorkspace, workspaceId]);

  useEffect(() => {
    if (workspace?.id && workspace.id !== currentWorkspace?.id) {
      setCurrentWorkspace({
        personal,
        ...workspace,
      });
      setCurrentWorkspaceId(workspace.id);
    }
  }, [currentWorkspace, workspace, personal, setCurrentWorkspace, setCurrentWorkspaceId]);

  const [createWorkspaceMutation] = useCreateWorkspaceMutation();
  const handleWorkspaceCreate = useCallback(
    async (data: { name: string }) => {
      const results = await createWorkspaceMutation({
        variables: { name: data.name },
        refetchQueries: ["GetWorkspaces"],
      });
      if (results.data?.createWorkspace) {
        Notification.success({ message: t("Successfully created workspace!") });
        setCurrentWorkspace(results.data.createWorkspace.workspace);
        navigate(`/workspace/${results.data.createWorkspace.workspace.id}`);
      }
      refetch();
    },
    [createWorkspaceMutation, setCurrentWorkspace, refetch, navigate, t],
  );

  const handleWorkspaceModalClose = useCallback(() => {
    setWorkspaceModalShown(false);
  }, []);

  const handleWorkspaceModalOpen = useCallback(() => setWorkspaceModalShown(true), []);

  const handleNavigateToSettings = useCallback(() => {
    navigate(`/workspace/${personalWorkspace?.id}/account`);
  }, [personalWorkspace?.id, navigate]);

  const { data: projectData } = useGetProjectQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  useEffect(() => {
    if (projectId) {
      const project = projectData?.node?.__typename === "Project" ? projectData.node : undefined;
      if (project) {
        setCurrentProject({
          id: project.id,
          name: project.name,
          description: project.description,
          scope: convertScope(project.publication?.scope),
          alias: project.alias,
          assetPublic: project.publication?.assetPublic,
          requestRoles: project.requestRoles as Role[],
        });
      }
    } else {
      setCurrentProject(undefined);
    }
  }, [projectId, projectData?.node, setCurrentProject]);

  const handleProjectMenuNavigate = useCallback(
    (info: MenuInfo) => {
      if (info.key === "home") {
        navigate(`/workspace/${workspaceId}`);
      } else if (info.key === "overview") {
        navigate(`/workspace/${workspaceId}/project/${projectId}`);
      } else {
        navigate(`/workspace/${workspaceId}/project/${projectId}/${info.key}`);
      }
    },
    [navigate, workspaceId, projectId],
  );

  const handleWorkspaceMenuNavigate = useCallback(
    (info: MenuInfo) => {
      if (info.key === "home") {
        navigate(`/workspace/${workspaceId}`);
      } else {
        navigate(`/workspace/${workspaceId}/${info.key}`);
      }
    },
    [navigate, workspaceId],
  );

  const handleWorkspaceNavigation = useCallback(
    (id: number) => {
      navigate(`/workspace/${id}`);
    },
    [navigate],
  );

  const handleHomeNavigation = useCallback(() => {
    navigate(`/workspace/${currentWorkspace?.id}`);
  }, [currentWorkspace?.id, navigate]);

  return {
    username,
    personalWorkspace,
    workspaces,
    currentWorkspace,
    workspaceModalShown,
    currentProject,
    selectedKey: subRoute,
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
  };
};

const convertScope = (scope?: ProjectPublicationScope): PublicScope | undefined => {
  switch (scope) {
    case "PUBLIC":
      return "public";
    case "PRIVATE":
      return "private";
  }
  return "private";
};
