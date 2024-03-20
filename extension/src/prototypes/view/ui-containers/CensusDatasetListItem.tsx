import { useCallback, type FC } from "react";
import format from "string-template";

import { createRootLayerForLayerAtom } from "../../../shared/view-layers";
import { useAddLayer } from "../../layers";
import { DatasetIcon, DatasetTreeItem, type DatasetTreeItemProps } from "../../ui-components";
import { HEATMAP_LAYER } from "../../view-layers";
import {
  censusDatasetMeshCodes,
  type CensusDataset,
  type CensusDatasetDatum,
} from "../constants/censusDatasets";

export interface CensusDatasetListItemProps
  extends Omit<DatasetTreeItemProps, "nodeId" | "icon" | "secondaryAction"> {
  dataset: CensusDataset;
  data: CensusDatasetDatum;
}

export const CensusDatasetListItem: FC<CensusDatasetListItemProps> = ({
  dataset,
  data,
  ...props
}) => {
  const addLayer = useAddLayer();
  const handleClick = useCallback(() => {
    addLayer(
      createRootLayerForLayerAtom({
        type: HEATMAP_LAYER,
        datasetId: dataset.id,
        dataId: data.id,
        title: data.name,
        getUrl: code => format(dataset.urlTemplate, { code }),
        codes: censusDatasetMeshCodes,
        parserOptions: {
          codeColumn: 0,
          valueColumn: data.column,
          skipHeader: 2,
        },
      }),
    );
  }, [dataset, data, addLayer]);

  return (
    <DatasetTreeItem
      nodeId={`${dataset.name}:${data.name}`}
      label={data.name}
      title={data.name}
      icon={<DatasetIcon />}
      onClick={handleClick}
      {...props}
    />
  );
};
