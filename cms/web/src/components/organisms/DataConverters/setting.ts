import { Integration } from "@reearth-cms/components/molecules/Integration/types";
import {
  WorkspaceSettings,
  Member,
  Workspace,
} from "@reearth-cms/components/molecules/Workspace/types";
import {
  WorkspaceSettings as GQLWorkspaceSettings,
  TileType,
  TerrainType,
  UrlResourceProps,
  CesiumResourceProps,
  Integration as GQLIntegration,
  Workspace as GQLWorkspace,
  WorkspaceMember,
  WorkspaceUserMember,
} from "@reearth-cms/gql/graphql-client-api";

export const fromGraphQLWorkspaceSettings = (
  GQLWorkspaceSettings: GQLWorkspaceSettings,
): WorkspaceSettings => {
  return {
    id: GQLWorkspaceSettings.id,
    tiles: {
      resources:
        GQLWorkspaceSettings.tiles?.resources.map(resource => ({
          id: resource.id,
          type: resource.type as TileType,
          props: {
            image: (resource.props as UrlResourceProps).image,
            name: (resource.props as UrlResourceProps).name,
            url: (resource.props as UrlResourceProps).url,
          },
        })) ?? [],
      selectedResource: GQLWorkspaceSettings.tiles?.selectedResource ?? undefined,
      enabled: GQLWorkspaceSettings.tiles?.enabled ?? undefined,
    },
    terrains: {
      resources:
        GQLWorkspaceSettings.terrains?.resources.map(resource => ({
          id: resource.id,
          type: resource.type as TerrainType,
          props: {
            url: (resource.props as CesiumResourceProps).url,
            name: (resource.props as CesiumResourceProps).name,
            image: (resource.props as CesiumResourceProps).image,
            cesiumIonAccessToken: (resource.props as CesiumResourceProps).cesiumIonAccessToken,
            cesiumIonAssetId: (resource.props as CesiumResourceProps).cesiumIonAssetId,
          },
        })) ?? [],
      selectedResource: GQLWorkspaceSettings.terrains?.selectedResource ?? undefined,
      enabled: GQLWorkspaceSettings.terrains?.enabled ?? undefined,
    },
  };
};

export const fromGraphQLIntegration = (integration: GQLIntegration): Integration => ({
  id: integration.id,
  name: integration.name,
  description: integration.description,
  logoUrl: integration.logoUrl,
  developerId: integration.developerId,
  developer: integration.developer,
  iType: integration.iType,
  config: {
    token: integration.config?.token,
    webhooks: integration.config?.webhooks,
  },
});

export const fromGraphQLWorkspace = (workspace: GQLWorkspace): Workspace => {
  return {
    id: workspace.id,
    name: workspace.name,
    personal: workspace.personal,
    members: workspace.members.map(member => fromGraphQLMember(member)),
  };
};

export const fromGraphQLMember = (member: WorkspaceMember): Member => {
  switch (member.__typename) {
    case "WorkspaceIntegrationMember":
      return {
        id: member.integrationId,
        active: member.active,
        integration: member.integration ? fromGraphQLIntegration(member.integration) : undefined,
        invitedById: member.invitedById,
        integrationRole: member.role,
      };
    case "WorkspaceUserMember":
    default:
      return {
        userId: (member as WorkspaceUserMember).userId,
        role: member.role,
        user: {
          id: (member as WorkspaceUserMember).user?.id ?? "",
          name: (member as WorkspaceUserMember).user?.name ?? "",
          email: (member as WorkspaceUserMember).user?.email ?? "",
        },
      };
  }
};
