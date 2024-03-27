import { groupBy } from "lodash-es";
import { FC, useMemo } from "react";

import { DatasetItem } from "../utils/datasetGroups";

import { DatasetFolderItem, FolderItem } from "./DatasetFolerItem";
import { DatasetListItem } from "./DatasetListItem";

type DatasetFolderListProps = {
  folderId: string;
  datasets?: DatasetItem[];
  level?: number;
};

export const DatasetFolderList: FC<DatasetFolderListProps> = ({
  folderId,
  datasets,
  level = 0,
}) => {
  const folderList = useMemo(() => {
    const folders: FolderItem[] = [];
    Object.entries(groupBy(datasets, d => (d.folderPath ?? d.name).split("/")[level])).forEach(
      ([key, value]) => {
        if (key !== "undefined") {
          folders.push({
            label: key,
            subFolderId: `${folderId}:${key}`,
            datasets: value,
            folderDataset:
              value.find(
                v =>
                  (v.folderPath ?? v.name).split("/")[level + 1] === undefined &&
                  v.items.length === 0,
              ) ?? undefined,
            isLastLevel:
              value.length === 1 &&
              (value[0].folderPath ?? value[0].name).split("/").length <= level + 1,
          });
        } else {
          value.forEach(v => {
            if (v.items.length === 0) return;
            folders.push({
              label: (v.folderPath ?? v.name).split("/").pop() ?? v.name,
              subFolderId: `${folderId}:${v.id}}`,
              datasets: [v],
              isLastLevel: true,
            });
          });
        }
      },
    );
    return folders;
  }, [folderId, datasets, level]);

  return (
    <>
      {folderList.map(folder => {
        if (folder.isLastLevel) {
          return (
            <DatasetListItem
              key={folder.datasets[0].id}
              municipalityCode={
                folder.datasets[0].wardCode ??
                folder.datasets[0].cityCode ??
                folder.datasets[0].prefectureCode
              }
              dataset={folder.datasets[0]}
              label={folder.label}
              title={folder.datasets[0].name}
            />
          );
        } else {
          return (
            <DatasetFolderItem key={folder.subFolderId} folderItem={folder} level={level + 1} />
          );
        }
      })}
    </>
  );
};
