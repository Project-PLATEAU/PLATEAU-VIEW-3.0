import { useParams } from "react-router-dom";

import Groups from "@reearth-cms/components/molecules/Model/ModelsList/Groups";
import ModelListBody from "@reearth-cms/components/molecules/Model/ModelsList/ModelListBody";
import ModelListHeader from "@reearth-cms/components/molecules/Model/ModelsList/ModelListHeader";
import Models from "@reearth-cms/components/molecules/Model/ModelsList/Models";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema";

import useHooks from "./hooks";

interface Props {
  title: string;
  collapsed?: boolean;
  selectedSchemaType: SelectedSchemaType;
  displayGroups?: boolean;
  onModelSelect: (modelId: string) => void;
  onGroupSelect?: (groupId: string) => void;
}

const ModelsMenu: React.FC<Props> = ({
  title,
  collapsed,
  selectedSchemaType,
  displayGroups,
  onModelSelect,
  onGroupSelect,
}) => {
  const { modelId: schemaId } = useParams();

  const {
    models,
    groups,
    modelModalShown,
    groupModalShown,
    handleModelModalOpen,
    handleModelModalClose,
    handleGroupModalOpen,
    handleGroupModalClose,
    handleModelCreate,
    handleGroupCreate,
    handleModelKeyCheck,
    handleGroupKeyCheck,
    handleUpdateModelsOrder,
  } = useHooks({
    modelId: selectedSchemaType === "model" ? schemaId : undefined,
  });

  return (
    <>
      <ModelListHeader title={title} collapsed={collapsed} />
      <ModelListBody>
        <Models
          title={title}
          collapsed={collapsed}
          selectedKey={schemaId}
          models={models}
          onModelSelect={onModelSelect}
          onModalOpen={handleModelModalOpen}
          open={modelModalShown}
          onModelKeyCheck={handleModelKeyCheck}
          onClose={handleModelModalClose}
          onCreate={handleModelCreate}
          onUpdateModelsOrder={handleUpdateModelsOrder}
        />
        {displayGroups && (
          <Groups
            title={title}
            collapsed={collapsed}
            selectedKey={schemaId}
            groups={groups}
            onGroupSelect={onGroupSelect}
            onModalOpen={handleGroupModalOpen}
            open={groupModalShown}
            onGroupKeyCheck={handleGroupKeyCheck}
            onClose={handleGroupModalClose}
            onCreate={handleGroupCreate}
          />
        )}
      </ModelListBody>
    </>
  );
};

export default ModelsMenu;
