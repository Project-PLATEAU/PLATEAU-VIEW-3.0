import ProjectOverviewMolecule from "@reearth-cms/components/molecules/ProjectOverview";
import DeletionModal from "@reearth-cms/components/molecules/Schema/DeletionModal";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";

import useHooks from "./hooks";

const ProjectOverview: React.FC = () => {
  const {
    currentProject,
    models,
    modelModalShown,
    selectedModel,
    modelDeletionModalShown,
    handleSchemaNavigation,
    handleContentNavigation,
    handleModelKeyCheck,
    handleModelModalOpen,
    handleModelModalReset,
    handleModelCreate,
    handleModelDeletionModalOpen,
    handleModelDeletionModalClose,
    handleModelUpdateModalOpen,
    handleModelDelete,
    handleModelUpdate,
  } = useHooks();

  return (
    <>
      <ProjectOverviewMolecule
        projectName={currentProject?.name}
        projectDescription={currentProject?.description}
        models={models}
        onSchemaNavigate={handleSchemaNavigation}
        onContentNavigate={handleContentNavigation}
        onModelModalOpen={handleModelModalOpen}
        onModelDeletionModalOpen={handleModelDeletionModalOpen}
        onModelUpdateModalOpen={handleModelUpdateModalOpen}
      />
      <FormModal
        data={selectedModel}
        open={modelModalShown}
        onClose={handleModelModalReset}
        onCreate={handleModelCreate}
        onUpdate={handleModelUpdate}
        onKeyCheck={handleModelKeyCheck}
        isModel
      />
      <DeletionModal
        open={modelDeletionModalShown}
        data={selectedModel}
        onDelete={handleModelDelete}
        onClose={handleModelDeletionModalClose}
        isModel
      />
    </>
  );
};

export default ProjectOverview;
