import { groupBy } from "lodash-es";
import { FC, useMemo } from "react";

import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";

import { DatasetFolderItem, FolderItem } from "./DatasetFolerItem";
import { DatasetListItem } from "./DatasetListItem";

type DatasetFolderListProps = {
  folderId: string;
  datasets?: DatasetFragmentFragment[];
  level?: number;
};

export const DatasetFolderList: FC<DatasetFolderListProps> = ({
  folderId,
  datasets,
  level = 0,
}) => {
  const folderList = useMemo(() => {
    const folders: FolderItem[] = [];
    Object.entries(groupBy(datasets, d => d.name.split("/")[level])).forEach(([key, value]) => {
      if (key !== "undefined") {
        folders.push({
          label: key,
          subFolderId: `${folderId}:${key}${value.length === 1 ? `:${value[0].id}` : ""}`,
          datasets: value.sort((a, b) => a.type.order - b.type.order),
          folderDataset:
            value.find(v => v.name.split("/")[level + 1] === undefined && v.items.length === 0) ??
            undefined,
        });
      } else {
        value.forEach((v, index) => {
          if (v.items.length === 0) return;
          folders.push({
            label: `${index}`,
            subFolderId: `${folderId}:${v.id}}`,
            datasets: [v],
          });
        });
      }
    });
    return folders;
  }, [folderId, datasets, level]);

  return (
    <>
      {Object.values(folderList).map(folder => {
        if (folder.datasets.length === 1) {
          const label = folder.datasets[0].name.split("/").pop();
          return (
            <DatasetListItem
              key={folder.datasets[0].id}
              municipalityCode={
                folder.datasets[0].wardCode ??
                folder.datasets[0].cityCode ??
                folder.datasets[0].prefectureCode
              }
              dataset={folder.datasets[0]}
              label={label}
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
