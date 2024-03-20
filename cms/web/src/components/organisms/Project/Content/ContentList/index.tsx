import ContentListMolecule from "@reearth-cms/components/molecules/Content/List";
import CommentsPanel from "@reearth-cms/components/organisms/Common/CommentsPanel";
import ViewsMenu from "@reearth-cms/components/organisms/Project/Content/ViewsMenu";
import ModelsMenu from "@reearth-cms/components/organisms/Project/ModelsMenu";
import { useT } from "@reearth-cms/i18n";

import useHooks from "./hooks";

const ContentList: React.FC = () => {
  const t = useT();

  const {
    currentModel,
    contentTableFields,
    contentTableColumns,
    collapsedModelMenu,
    collapsedCommentsPanel,
    selectedItem,
    selection,
    loading,
    totalCount,
    currentView,
    searchTerm,
    page,
    pageSize,
    requests,
    addItemToRequestModalShown,
    setCurrentView,
    handleRequestTableChange,
    requestModalLoading,
    requestModalTotalCount,
    requestModalPage,
    requestModalPageSize,
    handleBulkAddItemToRequest: handleAddItemToRequest,
    handleUnpublish,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleSearchTerm,
    handleFilterChange,
    setSelection,
    handleItemSelect,
    collapseCommentsPanel,
    collapseModelMenu,
    handleModelSelect,
    handleViewChange,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
    handleItemDelete,
    handleContentTableChange,
    handleRequestSearchTerm,
    handleRequestTableReload,
  } = useHooks();

  return (
    <ContentListMolecule
      commentsPanel={
        <CommentsPanel
          collapsed={collapsedCommentsPanel}
          onCollapse={collapseCommentsPanel}
          emptyText={
            selectedItem
              ? t("No comments.")
              : t("Please click the comment bubble in the table to check comments.")
          }
          comments={selectedItem?.comments}
          threadId={selectedItem?.threadId}
          refetchQueries={["SearchItem"]}
        />
      }
      modelsMenu={
        <ModelsMenu
          title={t("Content")}
          collapsed={collapsedModelMenu}
          onModelSelect={handleModelSelect}
          selectedSchemaType="model"
        />
      }
      viewsMenu={
        <ViewsMenu
          currentView={currentView}
          setCurrentView={setCurrentView}
          onViewChange={handleViewChange}
        />
      }
      onContentTableChange={handleContentTableChange}
      onSearchTerm={handleSearchTerm}
      onFilterChange={handleFilterChange}
      selectedItem={selectedItem}
      onItemSelect={handleItemSelect}
      collapsed={collapsedModelMenu}
      itemsDataLoading={loading}
      currentView={currentView}
      setCurrentView={setCurrentView}
      totalCount={totalCount}
      searchTerm={searchTerm}
      page={page}
      pageSize={pageSize}
      model={currentModel}
      contentTableFields={contentTableFields}
      contentTableColumns={contentTableColumns}
      selection={selection}
      requests={requests}
      onRequestTableChange={handleRequestTableChange}
      requestModalLoading={requestModalLoading}
      requestModalTotalCount={requestModalTotalCount}
      requestModalPage={requestModalPage}
      requestModalPageSize={requestModalPageSize}
      setSelection={setSelection}
      onCollapse={collapseModelMenu}
      onItemsReload={handleItemsReload}
      onItemEdit={handleNavigateToItemEditForm}
      onUnpublish={handleUnpublish}
      onItemDelete={handleItemDelete}
      onItemAdd={handleNavigateToItemForm}
      onAddItemToRequestModalClose={handleAddItemToRequestModalClose}
      onAddItemToRequestModalOpen={handleAddItemToRequestModalOpen}
      onAddItemToRequest={handleAddItemToRequest}
      addItemToRequestModalShown={addItemToRequestModalShown}
      onRequestSearchTerm={handleRequestSearchTerm}
      onRequestTableReload={handleRequestTableReload}
    />
  );
};

export default ContentList;
