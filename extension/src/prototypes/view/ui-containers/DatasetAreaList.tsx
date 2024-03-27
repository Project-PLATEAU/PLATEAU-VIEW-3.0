import { useAtom, useAtomValue } from "jotai";
import { atomWithReset } from "jotai/utils";
import { useCallback, useMemo, type FC, useContext } from "react";

import { useAreaDatasets, useAreas, useDatasets } from "../../../shared/graphql";
import { AreasQuery } from "../../../shared/graphql/types/catalog";
import { AppOverlayLayoutContext, DatasetTreeItem, DatasetTreeView } from "../../ui-components";
import { censusDatasets } from "../constants/censusDatasets";
import { datasetTypeNames } from "../constants/datasetTypeNames";
import { PlateauDatasetType } from "../constants/plateau";
import { getDatasetGroups } from "../utils/datasetGroups";

import { CensusDatasetListItem } from "./CensusDatasetListItem";
import { DatasetFolderList } from "./DatasetFolderList";
import { DatasetGroup } from "./DatasetGroup";
import { DatasetListItem, joinPath } from "./DatasetListItem";

const expandedAtom = atomWithReset<string[]>([]);

const GlobalItem: FC<{}> = () => {
  const query = useDatasets({
    includeTypes: ["global"],
  });
  return (
    <DatasetTreeItem nodeId="global" label={datasetTypeNames.global} loading={query.loading}>
      <DatasetFolderList folderId="global" datasets={query.data?.datasets} />
    </DatasetTreeItem>
  );
};

const MunicipalityItem: FC<{
  municipality: AreasQuery["areas"][number];
  parents?: string[];
  prefCode?: number;
}> = ({ municipality, parents = [], prefCode }) => {
  const query = useAreaDatasets(municipality.code);

  const { typicalTypeGroups, dataGroups, genericGroups } = useMemo(
    () =>
      getDatasetGroups({
        datasets: query.data?.area?.datasets,
        prefCode: prefCode,
        cityCode: municipality.code,
      }),
    [query.data?.area?.datasets, prefCode, municipality.code],
  );

  if (query.data?.area?.datasets?.length === 1) {
    const dataset = query.data.area?.datasets[0];
    const isUsecaseType = dataset.type.code === PlateauDatasetType.UseCase;
    const titleString = isUsecaseType
      ? dataset.name
      : `${parents.join(" ")} ${municipality.name} ${dataset.type.name}`;
    return (
      <DatasetListItem
        dataset={dataset}
        municipalityCode={dataset.wardCode ?? dataset.cityCode ?? dataset.prefectureCode}
        label={
          isUsecaseType
            ? joinPath([...parents, dataset.name])
            : joinPath([...parents, municipality.name, dataset.type.name])
        }
        title={titleString}
      />
    );
  }

  return (
    <DatasetTreeItem
      nodeId={municipality.id}
      label={joinPath([...parents, municipality.name])}
      loading={query.loading}
      disabled={!typicalTypeGroups?.length && !dataGroups?.length && !genericGroups?.length}>
      {typicalTypeGroups?.map(groupItem => (
        <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />
      ))}
      {dataGroups?.map(groupItem => (
        <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />
      ))}
      {genericGroups?.map(groupItem => (
        <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />
      ))}
    </DatasetTreeItem>
  );
};

const PrefectureItem: FC<{
  prefecture: AreasQuery["areas"][number];
}> = ({ prefecture }) => {
  const query = useAreas({
    parentCode: prefecture.code,
  });
  const areas = useMemo(() => query.data?.areas.filter(a => a.code.length !== 2) ?? [], [query]);

  // Handle the datasets belongs to this perfecture but no municipality
  const prefectureDatasetQuery = useAreaDatasets(prefecture.code);
  const { typicalTypeGroups, dataGroups, genericGroups } = useMemo(
    () =>
      getDatasetGroups({
        datasets: prefectureDatasetQuery.data?.area?.datasets?.filter(d => !d.cityCode),
        prefCode: prefecture.code,
      }),
    [prefectureDatasetQuery.data?.area?.datasets, prefecture.code],
  );

  if (areas.length === 1 && !typicalTypeGroups && !dataGroups && !genericGroups) {
    return (
      <MunicipalityItem
        municipality={areas[0]}
        parents={[prefecture.name]}
        prefCode={prefecture.code}
      />
    );
  }

  return (
    <DatasetTreeItem
      nodeId={prefecture.code}
      label={prefecture.name}
      loading={query.loading}
      disabled={
        !areas.length && !typicalTypeGroups?.length && !dataGroups?.length && !genericGroups?.length
      }>
      {areas.map(municipality => (
        <MunicipalityItem
          key={municipality.code}
          municipality={municipality}
          prefCode={prefecture.code}
        />
      ))}
      {typicalTypeGroups?.map(groupItem => (
        <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />
      ))}
      {dataGroups?.map(groupItem => (
        <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />
      ))}
      {genericGroups?.map(groupItem => (
        <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />
      ))}
    </DatasetTreeItem>
  );
};

const RegionalMeshItem: FC = () => {
  return (
    <DatasetTreeItem nodeId="RegionalMesh" label="地域メッシュ">
      {censusDatasets.map(dataset => (
        <DatasetTreeItem
          key={dataset.name}
          nodeId={`RegionalMesh:${dataset.name}`}
          label={dataset.name}>
          {dataset.data.map(data => (
            <CensusDatasetListItem key={data.name} dataset={dataset} data={data} />
          ))}
        </DatasetTreeItem>
      ))}
    </DatasetTreeItem>
  );
};

export const DatasetAreaList: FC = () => {
  const query = useAreas({ includeParents: true });
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
      <RegionalMeshItem />
      <GlobalItem />
      {query.data?.areas.map(
        prefecture =>
          prefecture.__typename === "Prefecture" && (
            <PrefectureItem key={prefecture.code} prefecture={prefecture} />
          ),
      )}
    </DatasetTreeView>
  );
};
