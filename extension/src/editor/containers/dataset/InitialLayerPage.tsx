import { InitialLayerBlock } from "./blocks/InitialLayerBlock";

import { DraftSetting, UpdateSetting } from ".";

type InitialLayerPageProps = {
  setting: DraftSetting;
  updateSetting: UpdateSetting;
};

export const InitialLayerPage: React.FC<InitialLayerPageProps> = ({ setting, updateSetting }) => {
  return <InitialLayerBlock setting={setting} updateSetting={updateSetting} />;
};
