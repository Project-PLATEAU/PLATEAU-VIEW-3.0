import { ArchiveExtractionStatus, Asset } from "@reearth-cms/components/molecules/Asset/types";
import {
  Item,
  Comment,
  ItemField,
  ItemAsset,
} from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { initialValuesGet } from "@reearth-cms/components/organisms/Project/Request/RequestDetails/utils";
import {
  Asset as GQLAsset,
  Item as GQLItem,
  Comment as GQLComment,
  Request as GQLRequest,
} from "@reearth-cms/gql/graphql-client-api";

export const fromGraphQLItem = (GQLItem: GQLItem | undefined): Item | undefined => {
  if (!GQLItem) return;
  return {
    id: GQLItem.id,
    version: GQLItem.version,
    fields: GQLItem.fields.map(
      field =>
        ({
          schemaFieldId: field.schemaFieldId,
          itemGroupId: field.itemGroupId,
          type: field.type,
          value: field.value,
        }) as ItemField,
    ),
    status: GQLItem.status,
    referencedItems:
      GQLItem.referencedItems?.map(item => ({
        id: item.id,
        title: item.title ?? "",
        schemaId: item.schemaId,
        createdBy: item.createdBy?.name ?? "",
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })) ?? [],
    createdBy: GQLItem.createdBy?.name,
    updatedBy: GQLItem.updatedBy?.name,
    createdAt: GQLItem.createdAt,
    updatedAt: GQLItem.updatedAt,
    schemaId: GQLItem.schemaId,
    threadId: GQLItem.thread?.id ?? "",
    metadata: {
      id: GQLItem.metadata?.id,
      version: GQLItem.metadata?.version ?? "",
      fields: GQLItem.metadata?.fields.map(
        field =>
          ({
            schemaFieldId: field.schemaFieldId,
            type: field.type,
            value: field.value,
          }) as ItemField,
      ),
    },
    comments: GQLItem.thread?.comments?.map(comment => fromGraphQLComment(comment)) ?? [],
    assets: GQLItem.assets
      ?.map(asset => asset && { id: asset.id, fileName: asset.fileName })
      .filter((asset): asset is ItemAsset => asset !== null),
  };
};

export const fromGraphQLAsset = (asset: GQLAsset | undefined): Asset | undefined => {
  if (!asset) return;
  return {
    id: asset.id,
    fileName: asset.fileName,
    createdAt: asset.createdAt.toString(),
    createdBy: asset.createdBy?.name ?? "",
    createdByType: asset.createdByType,
    previewType: asset.previewType || "UNKNOWN",
    projectId: asset.projectId,
    size: asset.size,
    url: asset.url,
    threadId: asset.thread?.id ?? "",
    comments: asset.thread?.comments?.map(comment => fromGraphQLComment(comment)) ?? [],
    archiveExtractionStatus: asset.archiveExtractionStatus as ArchiveExtractionStatus,
    items: asset.items ?? [],
  };
};

export const fromGraphQLRequest = (request: GQLRequest | undefined): Request | undefined => {
  if (!request) return;
  return {
    id: request.id,
    threadId: request.thread?.id ?? "",
    title: request.title,
    description: request.description ?? "",
    comments: request.thread?.comments?.map(comment => fromGraphQLComment(comment)) ?? [],
    createdAt: request.createdAt,
    reviewers: request.reviewers,
    state: request.state,
    createdBy: request.createdBy ?? undefined,
    updatedAt: request.updatedAt,
    approvedAt: request.approvedAt ?? undefined,
    closedAt: request.closedAt ?? undefined,
    items: request.items?.map(item => ({
      id: item.itemId,
      modelName: item?.item?.value.model.name,
      initialValues: initialValuesGet(item.item?.value.fields),
      schema: item.item?.value.schema ? item.item?.value.schema : undefined,
    })),
  };
};

export const fromGraphQLComment = (GQLComment: GQLComment): Comment => {
  return {
    id: GQLComment.id,
    author: {
      id: GQLComment.author?.id,
      name: GQLComment.author?.name ?? "Anonymous",
      type: GQLComment.author
        ? GQLComment.author.__typename === "User"
          ? "User"
          : "Integration"
        : null,
    },
    content: GQLComment.content,
    createdAt: GQLComment.createdAt.toString(),
  };
};
