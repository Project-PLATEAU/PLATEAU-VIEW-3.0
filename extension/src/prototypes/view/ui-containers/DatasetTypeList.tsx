import { useAtom, useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import { unionBy } from "lodash-es";
import { useCallback, type FC, useContext, useMemo } from "react";

import { useAreaDatasets, useAreas, useDatasetTypes } from "../../../shared/graphql";
import { AreasQuery } from "../../../shared/graphql/types/catalog";
import { AppOverlayLayoutContext, DatasetTreeItem, DatasetTreeView } from "../../ui-components";
import { isGenericDatasetType } from "../constants/generic";
import { PlateauDatasetType } from "../constants/plateau";

import { DatasetFolderList } from "./DatasetFolderList";
import { DatasetListItem, joinPath } from "./DatasetListItem";

const expandedAtom = atomWithReset<string[]>([]);

const MunicipalityItem: FC<{
  datasetType: PlateauDatasetType;
  municipality: AreasQuery["areas"][number];
  parents?: string[];
}> = ({ datasetType, municipality, parents = [] }) => {
  const query = useAreaDatasets(municipality.code, {
    includeTypes: [datasetType],
  });
  const isGenericDataset = isGenericDatasetType(datasetType);

  const datasets = useMemo(
    () =>
      query.data?.area?.datasets?.map(d => ({
        ...d,
        folderPath: d.groups ? `${d.groups?.slice(1).join("/")}/${d.name}` : d.name,
      })),
    [query.data?.area?.datasets],
  );

  if (isGenericDataset) {
    return (
      <DatasetTreeItem
        nodeId={`${datasetType}:municipality:${municipality.code}`}
        label={joinPath([...parents, municipality.name])}
        title={municipality.name}
        loading={query.loading}
        disabled={!datasets?.length}>
        <DatasetFolderList
          folderId={`${datasetType}:municipality:${municipality.code}`}
          datasets={datasets}
        />
      </DatasetTreeItem>
    );
  }

  if (datasets?.length === 1) {
    const dataset = datasets[0];
    const label =
      dataset.type.code === PlateauDatasetType.UseCase
        ? joinPath([...parents, dataset.name])
        : joinPath([...parents, municipality.name]);
    const titleString =
      dataset.type.code === PlateauDatasetType.UseCase
        ? dataset.name
        : `${parents.join(" ")} ${municipality.name} ${dataset.type.name}`;
    return (
      <DatasetListItem
        dataset={datasets[0]}
        municipalityCode={municipality.code}
        label={label}
        title={titleString}
      />
    );
  }

  return (
    <DatasetTreeItem
      nodeId={`${datasetType}:municipality:${municipality.code}`}
      label={joinPath([...parents, municipality.name])}
      title={municipality.name}
      loading={query.loading}
      disabled={!datasets?.length}>
      <DatasetFolderList
        folderId={`${datasetType}:municipality:${municipality.code}`}
        datasets={datasets}
      />
    </DatasetTreeItem>
  );
};

const PrefectureItem: FC<{
  datasetType: PlateauDatasetType;
  prefecture: AreasQuery["areas"][number];
}> = ({ prefecture, datasetType }) => {
  const query = useAreas({
    parentCode: prefecture.code,
    datasetTypes: [datasetType],
  });

  // Handle the datasets belongs to this perfecture and type but no municipality
  const prefectureDatasetQuery = useAreaDatasets(prefecture.code);
  const prefectureDatasets = useMemo(
    () =>
      prefectureDatasetQuery.data?.area?.datasets?.filter(
        d => !d.cityCode && d.type.code === datasetType,
      ) ?? [],
    [prefectureDatasetQuery.data?.area?.datasets, datasetType],
  );
  const isGenericDataset = isGenericDatasetType(datasetType);

  if (query.data?.areas?.length === 1 && prefectureDatasets.length === 0) {
    return (
      <MunicipalityItem
        datasetType={datasetType}
        municipality={query.data.areas[0]}
        parents={[prefecture.name]}
      />
    );
  }

  return (
    <DatasetTreeItem
      nodeId={`${datasetType}:prefecture:${prefecture.code}`}
      label={prefecture.name}
      title={prefecture.name}
      loading={query.loading}
      disabled={!query.data?.areas.length}>
      {query.data?.areas.map(municipality => (
        <MunicipalityItem
          key={municipality.code}
          datasetType={datasetType}
          municipality={municipality}
        />
      ))}
      {isGenericDataset ? (
        <DatasetFolderList
          folderId={`${datasetType}:prefecture:direct`}
          datasets={prefectureDatasets}
        />
      ) : (
        prefectureDatasets.map(dataset => (
          <DatasetListItem
            key={dataset.id}
            municipalityCode={"direct"}
            dataset={dataset}
            label={dataset.name}
            title={dataset.name}
          />
        ))
      )}
    </DatasetTreeItem>
  );
};

const DatasetTypeItem: FC<{ datasetType: PlateauDatasetType; name: string }> = ({
  datasetType,
  name,
}) => {
  const query = useAreas({
    datasetTypes: [datasetType],
    includeParents: true,
  });
  return (
    <DatasetTreeItem
      nodeId={datasetType}
      label={name}
      title={name}
      loading={query.loading}
      disabled={!query.data?.areas.length}>
      {query.data?.areas.map(
        prefecture =>
          prefecture.__typename === "Prefecture" && (
            <PrefectureItem
              key={prefecture.code}
              datasetType={datasetType}
              prefecture={prefecture}
            />
          ),
      )}
    </DatasetTreeItem>
  );
};

export const DatasetTypeList: FC = () => {
  const { data: datasetTypeOrder } = useDatasetTypes();
  const types = useMemo(() => unionBy(datasetTypeOrder, "name"), [datasetTypeOrder]);

  const [expanded, setExpanded] = useAtom(expandedAtom);
  const handleNodeToggle = useCallback(
    (_event: unknown, nodeIds: string[]) => {
      setExpanded(nodeIds);
    },
    [setExpanded],
  );

  const { maxMainHeightAtom, searchHeaderHeight } = useContext(AppOverlayLayoutContext);
  const maxMainHeight = useAtomValue(maxMainHeightAtom);

  return (
    <DatasetTreeView
      expanded={expanded}
      onNodeToggle={handleNodeToggle}
      maxheight={maxMainHeight - searchHeaderHeight}>
      {types?.map(type => (
        <DatasetTypeItem
          key={type.id}
          name={type.name}
          datasetType={type.code as PlateauDatasetType}
        />
      ))}
    </DatasetTreeView>
  );
};
