import { FeatureInspectorBasicBlock } from "./blocks/FeatureInspectorBasicBlock";
import { FeatureInspectorEmphasisPropertyBlock } from "./blocks/FeatureInspectorEmphasisPropertyBlock";

import { DraftSetting, EditorDataset, UpdateSetting } from ".";

type FeatureInspectorPageProps = {
  dataset: EditorDataset;
  setting: DraftSetting;
  updateSetting: UpdateSetting;
};

export const FeatureInspectorPage: React.FC<FeatureInspectorPageProps> = ({
  dataset,
  setting,
  updateSetting,
}) => {
  return (
    <>
      <FeatureInspectorBasicBlock
        key={`${setting.datasetId}-${setting.dataId}-feature-inspector-basic`}
        setting={setting}
        updateSetting={updateSetting}
      />
      <FeatureInspectorEmphasisPropertyBlock
        key={`${setting.datasetId}-${setting.dataId}-feature-inspector-emphasis-property`}
        setting={setting}
        dataset={dataset}
        updateSetting={updateSetting}
      />
    </>
  );
};
