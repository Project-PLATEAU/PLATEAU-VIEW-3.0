import { IconButton } from "@mui/material";
import { FC, useCallback, useState, type MouseEvent } from "react";

import { DatasetFragmentFragment } from "../../../shared/graphql/types/catalog";
import { DatasetTreeItem, InfoIcon } from "../../ui-components";

import { DatasetDialog } from "./DatasetDialog";
import { DatasetFolderList } from "./DatasetFolderList";

export type FolderItem = {
  label: string;
  subFolderId: string;
  datasets: DatasetFragmentFragment[];
  folderDataset?: DatasetFragmentFragment;
};

type DatasetFolderItemProps = {
  folderItem: FolderItem;
  level: number;
};

export const DatasetFolderItem: FC<DatasetFolderItemProps> = ({ folderItem, level }) => {
  const [infoOpen, setInfoOpen] = useState(false);
  const handleInfo = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setInfoOpen(true);
  }, []);
  const handleInfoClose = useCallback(() => {
    setInfoOpen(false);
  }, []);

  return (
    <>
      <DatasetTreeItem
        nodeId={folderItem.subFolderId}
        label={folderItem.label}
        title={folderItem.label}
        disabled={!folderItem.datasets.length}
        secondaryAction={
          !!folderItem.folderDataset?.description && (
            <IconButton size="small" onClick={handleInfo}>
              <InfoIcon />
            </IconButton>
          )
        }>
        <DatasetFolderList
          folderId={folderItem.subFolderId}
          datasets={folderItem.datasets}
          level={level}
        />
      </DatasetTreeItem>
      {!!folderItem.folderDataset?.description && (
        <DatasetDialog
          open={infoOpen}
          dataset={folderItem.folderDataset}
          municipalityCode={
            folderItem.folderDataset.wardCode ??
            folderItem.folderDataset.cityCode ??
            folderItem.folderDataset.prefectureCode
          }
          onClose={handleInfoClose}
          isFolder
        />
      )}
    </>
  );
};
