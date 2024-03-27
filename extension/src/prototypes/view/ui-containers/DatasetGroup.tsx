import { FC } from "react";
import invariant from "tiny-invariant";

import { DatasetTreeItem } from "../../ui-components";
import { PlateauDatasetType } from "../constants/plateau";
import { DatasetGroupItem } from "../utils/datasetGroups";

import { DatasetFolderList } from "./DatasetFolderList";
import { DatasetListItem } from "./DatasetListItem";

export const DatasetGroup: FC<{
  groupItem: DatasetGroupItem;
}> = ({ groupItem: { datasets, groupId, label, useTree } }) => {
  invariant(datasets.length > 0);

  if (datasets.length > 1 || useTree) {
    return (
      <DatasetTreeItem nodeId={groupId} label={label} disabled={!datasets.length}>
        <DatasetFolderList folderId={groupId} datasets={datasets} />
      </DatasetTreeItem>
    );
  } else {
    const dataset = datasets[0];
    const isUsecaseType = dataset.type.code === PlateauDatasetType.UseCase;
    const label = isUsecaseType ? dataset.name : dataset.type.name;
    const title = label;

    return (
      <DatasetListItem
        dataset={dataset}
        municipalityCode={dataset.wardCode ?? dataset.cityCode ?? dataset.prefectureCode}
        label={label}
        title={title}
      />
    );
  }
};
