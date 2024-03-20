import Icon from "@reearth-cms/components/atoms/Icon";
import ComplexInnerContents from "@reearth-cms/components/atoms/InnerContents/complex";
import NotFound from "@reearth-cms/components/atoms/NotFound/partial";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import Sidebar from "@reearth-cms/components/molecules/Common/Sidebar";
import ContentForm from "@reearth-cms/components/molecules/Content/Form";
import { Item, FormItem, ItemField } from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Asset/AssetList/hooks";

type Props = {
  linkedItemsModalList?: FormItem[];
  showPublishAction?: boolean;
  requests: Request[];
  collapsed?: boolean;
  model?: Model;
  modelsMenu: React.ReactNode;
  initialFormValues: { [key: string]: any };
  initialMetaFormValues: { [key: string]: any };
  item?: Item;
  itemId?: string;
  itemLoading: boolean;
  loading: boolean;
  requestCreationLoading: boolean;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType: UploadType;
  commentsPanel?: JSX.Element;
  requestModalShown: boolean;
  addItemToRequestModalShown: boolean;
  workspaceUserMembers: UserMember[];
  totalCount: number;
  page: number;
  pageSize: number;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  linkItemModalTitle: string;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onReferenceModelUpdate: (modelId: string, referenceFieldId: string) => void;
  onSearchTerm: (term?: string) => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  onPublish: (itemIds: string[]) => Promise<void>;
  onLinkItemTableReload: () => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableReload: () => void;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
  onCollapse?: (collapse: boolean) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onItemCreate: (data: {
    schemaId: string;
    metaSchemaId?: string;
    fields: ItemField[];
    metaFields: ItemField[];
  }) => Promise<void>;
  onItemUpdate: (data: { itemId: string; fields: ItemField[] }) => Promise<void>;
  onMetaItemUpdate: (data: { metaItemId: string; metaFields: ItemField[] }) => Promise<void>;
  onBack: (modelId?: string) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onRequestCreate: (data: {
    title: string;
    description: string;
    state: RequestState;
    reviewersId: string[];
    items: {
      itemId: string;
    }[];
  }) => Promise<void>;
  onChange: (request: Request, itemIds: string[]) => void;
  onModalClose: () => void;
  onModalOpen: () => void;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onGroupGet: (id: string) => Promise<Group | undefined>;
};

const ContentDetailsMolecule: React.FC<Props> = ({
  linkedItemsModalList,
  showPublishAction,
  requests,
  collapsed,
  model,
  modelsMenu,
  initialFormValues,
  initialMetaFormValues,
  item,
  itemId,
  itemLoading,
  loading,
  requestCreationLoading,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  commentsPanel,
  requestModalShown,
  addItemToRequestModalShown,
  workspaceUserMembers,
  totalCount,
  page,
  pageSize,
  onLinkItemTableReload,
  onRequestTableChange,
  onRequestSearchTerm,
  onRequestTableReload,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onSearchTerm,
  onLinkItemTableChange,
  onPublish,
  onUnpublish,
  onCollapse,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onItemCreate,
  onItemUpdate,
  onMetaItemUpdate,
  onBack,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsGet,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onRequestCreate,
  onChange,
  onModalClose,
  onModalOpen,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onAssetTableChange,
  onGetAsset,
  onGroupGet,
}) => {
  return (
    <ComplexInnerContents
      left={
        <Sidebar
          collapsed={collapsed}
          onCollapse={onCollapse}
          collapsedWidth={54}
          width={208}
          trigger={<Icon icon={collapsed ? "panelToggleRight" : "panelToggleLeft"} />}>
          {modelsMenu}
        </Sidebar>
      }
      center={
        itemId && !itemLoading && !item ? (
          <NotFound />
        ) : (
          <ContentForm
            item={item}
            linkItemModalTitle={linkItemModalTitle}
            linkItemModalTotalCount={linkItemModalTotalCount}
            linkItemModalPage={linkItemModalPage}
            linkItemModalPageSize={linkItemModalPageSize}
            onReferenceModelUpdate={onReferenceModelUpdate}
            onSearchTerm={onSearchTerm}
            onLinkItemTableChange={onLinkItemTableChange}
            linkedItemsModalList={linkedItemsModalList}
            showPublishAction={showPublishAction}
            requests={requests}
            requestCreationLoading={requestCreationLoading}
            onLinkItemTableReload={onLinkItemTableReload}
            onRequestTableChange={onRequestTableChange}
            onRequestSearchTerm={onRequestSearchTerm}
            onRequestTableReload={onRequestTableReload}
            requestModalLoading={requestModalLoading}
            requestModalTotalCount={requestModalTotalCount}
            requestModalPage={requestModalPage}
            requestModalPageSize={requestModalPageSize}
            loading={loading}
            itemId={itemId}
            model={model}
            initialFormValues={initialFormValues}
            initialMetaFormValues={initialMetaFormValues}
            assetList={assetList}
            onAssetTableChange={onAssetTableChange}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            fileList={fileList}
            loadingAssets={loadingAssets}
            uploading={uploading}
            uploadModalVisibility={uploadModalVisibility}
            uploadUrl={uploadUrl}
            uploadType={uploadType}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            onChange={onChange}
            onUploadModalCancel={onUploadModalCancel}
            setUploadUrl={setUploadUrl}
            setUploadType={setUploadType}
            onBack={onBack}
            onItemCreate={onItemCreate}
            onItemUpdate={onItemUpdate}
            onMetaItemUpdate={onMetaItemUpdate}
            onAssetsCreate={onAssetsCreate}
            onAssetCreateFromUrl={onAssetCreateFromUrl}
            onAssetsGet={onAssetsGet}
            onAssetsReload={onAssetsReload}
            onAssetSearchTerm={onAssetSearchTerm}
            setFileList={setFileList}
            setUploadModalVisibility={setUploadModalVisibility}
            requestModalShown={requestModalShown}
            addItemToRequestModalShown={addItemToRequestModalShown}
            onRequestCreate={onRequestCreate}
            onModalClose={onModalClose}
            onModalOpen={onModalOpen}
            onAddItemToRequestModalOpen={onAddItemToRequestModalOpen}
            onAddItemToRequestModalClose={onAddItemToRequestModalClose}
            workspaceUserMembers={workspaceUserMembers}
            onGetAsset={onGetAsset}
            onGroupGet={onGroupGet}
          />
        )
      }
      right={commentsPanel}
    />
  );
};

export default ContentDetailsMolecule;
