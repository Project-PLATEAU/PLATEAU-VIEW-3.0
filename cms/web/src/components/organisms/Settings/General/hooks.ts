import { useCallback, useMemo } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  WorkspaceSettings,
  TileInput,
  TerrainInput,
  UserMember,
} from "@reearth-cms/components/molecules/Workspace/types";
import { fromGraphQLWorkspaceSettings } from "@reearth-cms/components/organisms/DataConverters/setting";
import {
  useGetWorkspaceSettingsQuery,
  useUpdateWorkspaceSettingsMutation,
  ResourceInput,
  WorkspaceSettings as GQLWorkspaceSettings,
  useGetMeQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";

export default () => {
  const t = useT();

  const [currentWorkspace] = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const { data, refetch } = useGetWorkspaceSettingsQuery({
    variables: { workspaceId: workspaceId ?? "" },
  });

  const defaultSettings: WorkspaceSettings = useMemo(
    () => ({
      id: workspaceId ?? "",
      tiles: {
        resources: [],
      },
      terrains: {
        enabled: false,
        resources: [],
      },
    }),
    [workspaceId],
  );

  const workspaceSettings: WorkspaceSettings = useMemo(() => {
    return data?.node
      ? fromGraphQLWorkspaceSettings(data.node as GQLWorkspaceSettings)
      : defaultSettings;
  }, [data?.node, defaultSettings]);

  const tiles: TileInput[] = useMemo(() => {
    const tiles: TileInput[] = [];
    workspaceSettings?.tiles?.resources?.map(resource => tiles.push({ tile: resource }));
    return tiles;
  }, [workspaceSettings?.tiles?.resources]);

  const terrains: TerrainInput[] = useMemo(() => {
    const terrains: TerrainInput[] = [];
    workspaceSettings?.terrains?.resources?.map(resource => terrains.push({ terrain: resource }));
    return terrains;
  }, [workspaceSettings?.terrains?.resources]);

  const [updateWorkspaceMutation] = useUpdateWorkspaceSettingsMutation();

  const handleWorkspaceSettingsUpdate = useCallback(
    async (tiles: TileInput[], terrains: TerrainInput[], isEnable?: boolean) => {
      if (!workspaceId) return;
      const res = await updateWorkspaceMutation({
        variables: {
          id: workspaceId,
          tiles: {
            resources: tiles as ResourceInput[],
            selectedResource: tiles[0]?.tile?.id,
          },
          terrains: {
            resources: terrains as ResourceInput[],
            selectedResource: terrains[0]?.terrain?.id,
            enabled: isEnable ?? workspaceSettings?.terrains?.enabled,
          },
        },
      });

      if (res.errors) {
        Notification.error({ message: t("Failed to update workspace.") });
      } else {
        Notification.success({ message: t("Successfully updated workspace!") });
      }
      refetch();
    },
    [refetch, t, updateWorkspaceMutation, workspaceId, workspaceSettings?.terrains?.enabled],
  );

  const handleTerrainToggle = useCallback(
    (isEnable: boolean) => {
      handleWorkspaceSettingsUpdate(tiles, terrains, isEnable);
    },
    [handleWorkspaceSettingsUpdate, tiles, terrains],
  );

  const { data: userData } = useGetMeQuery();
  const hasPrivilege: boolean = useMemo(() => {
    const myRole = currentWorkspace?.members?.find(
      (m): m is UserMember => "userId" in m && m.userId === userData?.me?.id,
    )?.role;
    return myRole === "OWNER" || myRole === "MAINTAINER";
  }, [currentWorkspace?.members, userData?.me?.id]);

  return {
    workspaceSettings,
    tiles,
    terrains,
    handleWorkspaceSettingsUpdate,
    handleTerrainToggle,
    hasPrivilege,
  };
};
