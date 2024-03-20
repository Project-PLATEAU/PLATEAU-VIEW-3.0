import { useState, useCallback, Key, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset, AssetItem } from "@reearth-cms/components/molecules/Asset/types";
import { fromGraphQLAsset } from "@reearth-cms/components/organisms/DataConverters/content";
import {
  useGetAssetsLazyQuery,
  useCreateAssetMutation,
  useDeleteAssetMutation,
  Asset as GQLAsset,
  SortDirection as GQLSortDirection,
  AssetSortType as GQLSortType,
  useGetAssetsItemsLazyQuery,
  useCreateAssetUploadMutation,
  useGetAssetLazyQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

export type AssetSortType = "DATE" | "NAME" | "SIZE";
export type SortDirection = "ASC" | "DESC";
type UploadType = "local" | "url";

export default (isItemsRequired: boolean) => {
  const t = useT();

  const [uploadModalVisibility, setUploadModalVisibility] = useState(false);

  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });
  const [selectedAssetId, setSelectedAssetId] = useState<string>();
  const [fileList, setFileList] = useState<UploadFile<File>[]>([]);
  const [uploadUrl, setUploadUrl] = useState({
    url: "",
    autoUnzip: true,
  });
  const [uploadType, setUploadType] = useState<UploadType>("local");
  const [uploading, setUploading] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [createAssetMutation] = useCreateAssetMutation();
  const [createAssetUploadMutation] = useCreateAssetUploadMutation();

  const [sort, setSort] = useState<{ type?: AssetSortType; direction?: SortDirection } | undefined>(
    {
      type: "DATE",
      direction: "DESC",
    },
  );

  const [getAsset] = useGetAssetLazyQuery();

  const handleGetAsset = useCallback(
    async (assetId: string) => {
      const { data } = await getAsset({
        variables: {
          assetId,
        },
      });
      if (!data?.node || data.node.__typename !== "Asset") return;
      return data.node.fileName;
    },
    [getAsset],
  );

  const params = {
    fetchPolicy: "cache-and-network" as const,
    variables: {
      projectId: projectId ?? "",
      pagination: { first: pageSize, offset: (page - 1) * pageSize },
      sort: sort
        ? { sortBy: sort.type as GQLSortType, direction: sort.direction as GQLSortDirection }
        : undefined,
      keyword: searchTerm,
    },
    notifyOnNetworkStatusChange: true,
    skip: !projectId,
  };

  const [getAssets, { data, refetch, loading, networkStatus }] = isItemsRequired
    ? useGetAssetsItemsLazyQuery(params)
    : useGetAssetsLazyQuery(params);

  useEffect(() => {
    isItemsRequired && getAssets();
  }, [getAssets, isItemsRequired]);

  const assetList = useMemo(
    () =>
      (data?.assets.nodes
        .map(asset => fromGraphQLAsset(asset as GQLAsset))
        .filter(asset => !!asset) as Asset[]) ?? [],
    [data?.assets.nodes],
  );

  const isRefetching = networkStatus === 3;

  const handleUploadModalCancel = useCallback(() => {
    setUploadModalVisibility(false);
    setUploading(false);
    setFileList([]);
    setUploadUrl({ url: "", autoUnzip: true });
    setUploadType("local");
  }, [setUploadModalVisibility, setUploading, setFileList, setUploadUrl, setUploadType]);

  const handleAssetsCreate = useCallback(
    (files: UploadFile<File>[]) =>
      (async () => {
        if (!projectId) return [];
        setUploading(true);
        const results = (
          await Promise.all(
            files.map(async file => {
              let cursor = "";
              let offset = 0;
              let uploadToken = "";
              // eslint-disable-next-line no-constant-condition
              while (true) {
                const createAssetUploadResult = await createAssetUploadMutation({
                  variables: {
                    projectId,
                    filename: file.name,
                    contentLength: file.size ?? 0,
                    cursor,
                  },
                });
                if (
                  createAssetUploadResult.errors ||
                  !createAssetUploadResult.data?.createAssetUpload
                ) {
                  Notification.error({ message: t("Failed to add one or more assets.") });
                  handleUploadModalCancel();
                  return undefined;
                }
                const { url, token, contentType, contentLength, next } =
                  createAssetUploadResult.data.createAssetUpload;
                uploadToken = token ?? "";
                if (url === "") {
                  break;
                }
                const headers = contentType ? { "content-type": contentType } : undefined;
                await fetch(url, {
                  method: "PUT",
                  body: (file as any).slice(offset, offset + contentLength),
                  headers,
                });
                if (!next) {
                  break;
                }
                cursor = next;
                offset += contentLength;
              }
              const result = await createAssetMutation({
                variables: {
                  projectId,
                  token: uploadToken,
                  file: uploadToken === "" ? file : null,
                  skipDecompression: !!file.skipDecompression,
                },
              });
              if (result.errors || !result.data?.createAsset) {
                Notification.error({ message: t("Failed to add one or more assets.") });
                handleUploadModalCancel();
                return undefined;
              }
              return fromGraphQLAsset(result.data.createAsset.asset as GQLAsset);
            }),
          )
        ).filter(Boolean);
        if (results?.length > 0) {
          Notification.success({ message: t("Successfully added one or more assets!") });
          await refetch();
        }
        handleUploadModalCancel();
        return results;
      })(),
    [
      projectId,
      handleUploadModalCancel,
      createAssetMutation,
      createAssetUploadMutation,
      t,
      refetch,
    ],
  );

  const handleAssetCreateFromUrl = useCallback(
    async (url: string, autoUnzip: boolean) => {
      if (!projectId) return undefined;
      setUploading(true);
      try {
        const result = await createAssetMutation({
          variables: {
            projectId,
            token: null,
            url,
            skipDecompression: !autoUnzip,
          },
        });
        if (result.data?.createAsset) {
          Notification.success({ message: t("Successfully added asset!") });
          await refetch();
          return fromGraphQLAsset(result.data.createAsset.asset as GQLAsset);
        }
        return undefined;
      } catch {
        Notification.error({ message: t("Failed to add asset.") });
      } finally {
        handleUploadModalCancel();
      }
    },
    [projectId, createAssetMutation, t, refetch, handleUploadModalCancel],
  );

  const [deleteAssetMutation] = useDeleteAssetMutation();
  const handleAssetDelete = useCallback(
    (assetIds: string[]) =>
      (async () => {
        if (!projectId) return;
        const results = await Promise.all(
          assetIds.map(async assetId => {
            const result = await deleteAssetMutation({
              variables: { assetId },
            });
            if (result.errors) {
              Notification.error({ message: t("Failed to delete one or more assets.") });
            }
          }),
        );
        if (results) {
          await refetch();
          Notification.success({ message: t("One or more assets were successfully deleted!") });
          setSelection({ selectedRowKeys: [] });
        }
      })(),
    [t, deleteAssetMutation, refetch, projectId],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term ?? "");
    setPage(1);
  }, []);

  const handleAssetsGet = useCallback(() => {
    getAssets();
  }, [getAssets]);

  const handleAssetsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleNavigateToAsset = (assetId: string) => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/asset/${assetId}`);
  };

  const handleAssetSelect = useCallback(
    (id: string) => {
      setSelectedAssetId(id);
      setCollapsed(false);
    },
    [setCollapsed, setSelectedAssetId],
  );

  const handleAssetItemSelect = useCallback(
    (assetItem: AssetItem) => {
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/content/${assetItem.modelId}/details/${assetItem.itemId}`,
      );
    },
    [navigate, projectId, workspaceId],
  );

  const handleToggleCommentMenu = useCallback(
    (value: boolean) => {
      setCollapsed(value);
    },
    [setCollapsed],
  );

  const selectedAsset = useMemo(
    () => assetList.find(asset => asset.id === selectedAssetId),
    [assetList, selectedAssetId],
  );

  const handleAssetTableChange = useCallback(
    (
      page: number,
      pageSize: number,
      sorter?: { type?: AssetSortType; direction?: SortDirection },
    ) => {
      setPage(page);
      setPageSize(pageSize);
      setSort({
        type: sorter?.type ? sorter.type : "DATE",
        direction: sorter?.direction ? sorter.direction : "DESC",
      });
    },
    [],
  );

  return {
    assetList,
    selection,
    fileList,
    uploading,
    isLoading: loading ?? isRefetching,
    uploadModalVisibility,
    loading,
    uploadUrl,
    uploadType,
    selectedAsset,
    collapsed,
    totalCount: data?.assets.totalCount ?? 0,
    page,
    pageSize,
    sort,
    handleToggleCommentMenu,
    handleAssetItemSelect,
    handleAssetSelect,
    handleUploadModalCancel,
    setUploadUrl,
    setUploadType,
    setSelection,
    setFileList,
    setUploading,
    setUploadModalVisibility,
    handleAssetsCreate,
    handleAssetCreateFromUrl,
    handleAssetTableChange,
    handleAssetDelete,
    handleSearchTerm,
    handleAssetsGet,
    handleAssetsReload,
    handleNavigateToAsset,
    handleGetAsset,
  };
};
