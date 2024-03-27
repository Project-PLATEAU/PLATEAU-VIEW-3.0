import { useCallback, useState, useEffect } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { PublicScope } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import {
  useUpdateModelMutation,
  useGetModelsQuery,
  Model as GQLModel,
  ProjectPublicationScope,
  useUpdateProjectMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const [currentProject] = useProject();

  const [models, setModels] = useState<Model[]>();
  const [scope, setScope] = useState(currentProject?.scope);
  const [aliasState, setAlias] = useState(currentProject?.alias);
  const [updatedModels, setUpdatedModels] = useState<Model[]>([]);
  const [assetState, setAssetState] = useState<boolean | undefined>(currentProject?.assetPublic);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);

  const { data: modelsData } = useGetModelsQuery({
    variables: {
      projectId: currentProject?.id ?? "",
      pagination: { first: 100 },
    },
    skip: !currentProject?.id,
  });

  useEffect(() => {
    const filteredModel = modelsData?.models.nodes
      ?.map<Model | undefined>(model => fromGraphQLModel(model as GQLModel))
      .filter((model): model is Model => !!model);
    setModels(filteredModel);
  }, [modelsData]);

  useEffect(() => {
    setScope(currentProject?.scope);
  }, [currentProject?.scope]);

  useEffect(() => {
    setAlias(currentProject?.alias);
  }, [currentProject?.alias]);

  useEffect(() => {
    setAssetState(currentProject?.assetPublic);
  }, [currentProject?.assetPublic]);

  useEffect(() => {
    setIsSaveDisabled(
      updatedModels.length === 0 &&
        currentProject?.scope === scope &&
        currentProject?.alias === aliasState &&
        currentProject?.assetPublic === assetState,
    );
  }, [
    aliasState,
    assetState,
    currentProject?.alias,
    currentProject?.assetPublic,
    currentProject?.scope,
    scope,
    updatedModels.length,
  ]);

  const [updateProjectMutation] = useUpdateProjectMutation();
  const [updateModelMutation] = useUpdateModelMutation({
    refetchQueries: ["GetModels"],
  });

  const handlePublicUpdate = useCallback(async () => {
    if (!currentProject?.id || (!scope && updatedModels.length === 0)) return;
    let errors = false;

    if ((scope && scope !== currentProject.scope) || aliasState) {
      const gqlScope =
        scope === "public" ? ProjectPublicationScope.Public : ProjectPublicationScope.Private;
      const projRes = await updateProjectMutation({
        variables: {
          alias: aliasState,
          projectId: currentProject.id,
          publication: { scope: gqlScope, assetPublic: assetState },
        },
      });
      if (projRes.errors) {
        errors = true;
      }
    }

    if (updatedModels) {
      updatedModels.forEach(async model => {
        const modelRes = await updateModelMutation({
          variables: { modelId: model.id, public: model.public },
        });
        if (modelRes.errors) {
          errors = true;
        }
      });
    }
    if (errors) {
      Notification.error({ message: t("Failed to update publication settings.") });
    } else {
      Notification.success({
        message: t("Successfully updated publication settings!"),
      });
    }
    setUpdatedModels([]);
  }, [
    currentProject?.id,
    currentProject?.scope,
    scope,
    updatedModels,
    aliasState,
    updateProjectMutation,
    assetState,
    updateModelMutation,
    t,
  ]);

  const handleAliasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAlias(e.currentTarget.value);
  }, []);

  const handleUpdatedAssetState = useCallback((state: boolean) => {
    setAssetState(state);
  }, []);

  const handleUpdatedModels = useCallback(
    (model: Model) => {
      if (updatedModels.find(um => um.id === model.id)) {
        setUpdatedModels(ums => ums.filter(um => um.id !== model.id));
      } else {
        setUpdatedModels(ums => [...ums, model]);
      }
      setModels(ms => ms?.map(m => (m.id === model.id ? { ...m, public: model.public } : m)));
    },
    [updatedModels],
  );

  const handleSetScope = (projectScope: PublicScope) => {
    setScope(projectScope);
  };

  return {
    models,
    scope,
    alias: currentProject?.alias,
    aliasState,
    assetState,
    isSaveDisabled,
    handlePublicUpdate,
    handleAliasChange,
    handleUpdatedAssetState,
    handleUpdatedModels,
    handleSetScope,
  };
};
