import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, type FC } from "react";
import format from "string-template";

import { rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { createRootLayerForLayerAtom } from "../../../shared/view-layers";
import { removeLayerAtom, useAddLayer } from "../../layers";
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
  const id = `${dataset.id}-${data.id}`;
  const layer = useAtomValue(
    useMemo(() => atom(get => get(rootLayersLayersAtom).find(layer => layer.id === id)), [id]),
  );
  const addLayer = useAddLayer();
  const removeLayer = useSetAtom(removeLayerAtom);
  const handleClick = useCallback(() => {
    if (layer == null) {
      addLayer(
        createRootLayerForLayerAtom({
          type: HEATMAP_LAYER,
          id,
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
    } else {
      removeLayer(layer.id);
    }
  }, [
    layer,
    addLayer,
    id,
    dataset.id,
    dataset.urlTemplate,
    data.id,
    data.name,
    data.column,
    removeLayer,
  ]);

  return (
    <DatasetTreeItem
      nodeId={`${dataset.name}:${data.name}`}
      label={data.name}
      title={data.name}
      icon={<DatasetIcon />}
      selected={layer != null}
      onClick={handleClick}
      {...props}
    />
  );
};
