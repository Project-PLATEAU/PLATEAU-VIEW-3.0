import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";

import { PreviewType as PreviewTypeType } from "./Asset/AssetBody/previewTypeSelect";

export type PreviewType = PreviewTypeType;
export type ArchiveExtractionStatus =
  | "SKIPPED"
  | "PENDING"
  | "IN_PROGRESS"
  | "DONE"
  | "FAILED"
  | undefined;

export type ViewerType =
  | "geo"
  | "geo_3d_tiles"
  | "geo_mvt"
  | "image"
  | "image_svg"
  | "model_3d"
  | "unknown";

export type Asset = {
  id: string;
  createdAt: string;
  createdBy: string;
  createdByType: string;
  file?: AssetFile;
  fileName: string;
  previewType?: PreviewType;
  projectId: string;
  size: number;
  url: string;
  threadId: string;
  comments: Comment[];
  archiveExtractionStatus?: ArchiveExtractionStatus;
  items: AssetItem[];
};

export type AssetItem = {
  itemId: string;
  modelId: string;
};

export type AssetFile = {
  children?: AssetFile[];
  contentType?: string;
  name: string;
  path: string;
  size: number;
};
