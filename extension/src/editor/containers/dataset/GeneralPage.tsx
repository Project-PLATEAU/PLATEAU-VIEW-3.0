import { DEFAULT_SETTING_DATA_ID } from "../../../shared/api/constants";

import { CameraBlock } from "./blocks/CameraBlock";
import { DataBlock } from "./blocks/DataBlock";
import { DataFetchingBlock } from "./blocks/DataFetchingBlock";
import { EventBlock } from "./blocks/EventBlock";
import { InitialLayerBlock } from "./blocks/InitialLayerBlock";

import { DraftSetting, EditorDataset, UpdateSetting } from ".";

type GeneralPageProps = {
  dataset?: EditorDataset;
  setting: DraftSetting;
  dataId?: string;
  updateSetting?: UpdateSetting;
};

export const GeneralPage: React.FC<GeneralPageProps> = ({
  dataset,
  setting,
  dataId,
  updateSetting,
}) => {
  return (
    <>
      <DataBlock
        key={`${setting.datasetId}-${setting.dataId}-data`}
        dataset={dataset}
        dataId={dataId}
      />
      <CameraBlock
        key={`${setting.datasetId}-${setting.dataId}-camera`}
        setting={setting}
        updateSetting={updateSetting}
      />
      <DataFetchingBlock
        key={`${setting.datasetId}-${setting.dataId}-data-fetching`}
        setting={setting}
        updateSetting={updateSetting}
      />
      <EventBlock
        key={`${setting.datasetId}-${setting.dataId}-event`}
        setting={setting}
        updateSetting={updateSetting}
      />
      {setting.dataId !== DEFAULT_SETTING_DATA_ID && (
        <InitialLayerBlock
          key={`${setting.datasetId}-${setting.dataId}-initial-layer`}
          setting={setting}
          updateSetting={updateSetting}
        />
      )}
    </>
  );
};
