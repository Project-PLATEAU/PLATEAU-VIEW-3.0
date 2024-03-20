export type Comment = {
  id: string;
  author: { id?: string; name: string; type: "User" | "Integration" | null };
  content: string;
  createdAt: string;
};

export type RefetchQueries = (
  | "GetItem"
  | "SearchItem"
  | "GetAssetItem"
  | "GetAssetsItems"
  | "GetRequests"
)[];
