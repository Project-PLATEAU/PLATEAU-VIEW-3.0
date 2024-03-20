import { ComponentGroup } from "../../../shared/api/types";
import { FieldComponentEditor } from "../common/fieldComponentEditor";

import { FieldComponentTemplateBlock } from "./blocks/FieldComponentTemplateBlock";

import { DraftSetting, EditorDataset, UpdateSetting } from ".";

type FieldComponentsPageProps = {
  setting: DraftSetting;
  dataset: EditorDataset;
  updateSetting: UpdateSetting;
};

export const FieldComponentsPage: React.FC<FieldComponentsPageProps> = ({
  setting,
  dataset,
  updateSetting,
}) => {
  const handleComponentGroupsUpdate = (groups: ComponentGroup[]) => {
    updateSetting(s => {
      if (!s) return s;
      return { ...s, fieldComponents: { ...s.fieldComponents, groups } };
    });
  };

  return (
    <>
      <FieldComponentTemplateBlock
        key={`${setting.datasetId}-${setting.dataId}-fc-template`}
        setting={setting}
        dataset={dataset}
        componentsGroups={setting.fieldComponents?.groups}
        updateSetting={updateSetting}
      />
      {setting.fieldComponents?.groups && (
        <FieldComponentEditor
          key={`${setting.datasetId}-${setting.dataId}-fc-editor`}
          componentsGroups={setting.fieldComponents.groups}
          hidden={setting.fieldComponents.useTemplate}
          onComponentGroupsUpdate={handleComponentGroupsUpdate}
        />
      )}
    </>
  );
};
