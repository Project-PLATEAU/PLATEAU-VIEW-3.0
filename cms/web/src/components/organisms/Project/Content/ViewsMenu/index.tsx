import React, { Dispatch, SetStateAction } from "react";
import { useParams } from "react-router-dom";

import ViewFormModal from "@reearth-cms/components/molecules/View/ViewFormModal";
import ViewsMenuMolecule from "@reearth-cms/components/molecules/View/viewsMenu";

import { CurrentViewType } from "../ContentList/hooks";

import useHooks from "./hooks";

export type Props = {
  currentView: CurrentViewType;
  setCurrentView: Dispatch<SetStateAction<CurrentViewType>>;
  onViewChange: () => void;
};

const ViewsMenu: React.FC<Props> = ({ currentView, setCurrentView, onViewChange }) => {
  const { modelId } = useParams();

  const {
    views,
    modalState,
    handleViewRenameModalOpen,
    handleViewCreateModalOpen,
    selectedView,
    setSelectedView,
    viewModalShown,
    submitting,
    handleViewModalReset,
    handleViewCreate,
    handleViewRename,
    handleViewUpdate,
    handleViewDelete,
  } = useHooks({ modelId, currentView, setCurrentView, onViewChange });

  return (
    <>
      <ViewsMenuMolecule
        views={views}
        onViewRenameModalOpen={handleViewRenameModalOpen}
        onViewCreateModalOpen={handleViewCreateModalOpen}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        onDelete={handleViewDelete}
        onUpdate={handleViewUpdate}
        onViewChange={onViewChange}
      />
      <ViewFormModal
        modalState={modalState}
        view={selectedView}
        open={viewModalShown}
        submitting={submitting}
        onClose={handleViewModalReset}
        onCreate={handleViewCreate}
        OnUpdate={handleViewRename}
      />
    </>
  );
};

export default ViewsMenu;
