import AccessibilityMolecule from "@reearth-cms/components/molecules/Accessibility";

import useHooks from "./hooks";

const Accessibility: React.FC = () => {
  const {
    models,
    scope,
    alias,
    aliasState,
    assetState,
    isSaveDisabled,
    handlePublicUpdate,
    handleAliasChange,
    handleUpdatedAssetState,
    handleUpdatedModels,
    handleSetScope,
  } = useHooks();

  return (
    <AccessibilityMolecule
      models={models}
      scope={scope}
      alias={alias}
      aliasState={aliasState}
      assetState={assetState}
      isSaveDisabled={isSaveDisabled}
      handlePublicUpdate={handlePublicUpdate}
      handleAliasChange={handleAliasChange}
      handleUpdatedAssetState={handleUpdatedAssetState}
      handleUpdatedModels={handleUpdatedModels}
      handleSetScope={handleSetScope}
    />
  );
};

export default Accessibility;
