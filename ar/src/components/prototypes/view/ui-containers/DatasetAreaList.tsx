import { useAtom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { groupBy } from "lodash";
import { useCallback, useMemo, type FC, useContext } from "react";
import invariant from "tiny-invariant";

import {
  useAreaDatasets,
  useAreas,
  useDatasets,
} from "../../../shared/graphql";
import {
  AreasQuery,
  DatasetFragmentFragment,
} from "../../../shared/graphql/types/catalog";
import {
  AppOverlayLayoutContext,
  DatasetTreeItem,
  DatasetTreeView,
} from "../../ui-components";
import { datasetTypeNames } from "../constants/datasetTypeNames";
import { datasetTypeOrder } from "../constants/datasetTypeOrder";
import { PlateauDatasetType } from "../constants/plateau";

import { DatasetListItem, joinPath } from "./DatasetListItem";

// import { censusDatasets } from "../constants/censusDatasets";
// import { CensusDatasetListItem } from "./CensusDatasetListItem";

const expandedAtom = atomWithReset<string[]>([]);

export const DatasetGroup: FC<{
  groupId: string;
  datasets: DatasetFragmentFragment[];
}> = ({ groupId, datasets }) => {
  invariant(datasets.length > 0);

  if (datasets.length > 1) {
    return (
      <DatasetTreeItem nodeId={groupId} label={datasets[0].type.name} disabled={!datasets.length}>
        {datasets.map(dataset => {
          return (
            <DatasetListItem
              key={dataset.id}
              municipalityCode={dataset.wardCode ?? dataset.cityCode ?? dataset.prefectureCode}
              dataset={dataset}
              label={dataset.name}
              title={dataset.name}
            />
          );
        })}
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

const GlobalItem: FC<{}> = () => {
  const query = useDatasets({
    includeTypes: ["global"],
  });
  return (
    <DatasetTreeItem
      nodeId="global"
      label={datasetTypeNames.global}
      loading={query.loading}
    >
      {query.data?.datasets?.map((dataset) => (
        <DatasetListItem
          key={dataset.id}
          dataset={dataset}
          municipalityCode={
            dataset.wardCode ?? dataset.cityCode ?? dataset.prefectureCode
          }
          label={dataset.name}
        />
      ))}
    </DatasetTreeItem>
  );
};

const MunicipalityItem: FC<{
  municipality: AreasQuery["areas"][number];
  parents?: string[];
}> = ({ municipality, parents = [] }) => {
  const query = useAreaDatasets(municipality.code);
  const groups = useMemo(
    () =>
      query.data?.area?.datasets != null
        ? Object.entries(groupBy(query.data.area.datasets, d => d.type.name))
            .map(([, value]) => value)
            .map(value => ({
              groupId: value.map(({ id }) => id).join(":"),
              datasets: value.sort((a, b) => a.type.order - b.type.order),
            }))
        : undefined,
    [query.data?.area?.datasets],
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
      disabled={!groups?.length}>
      {groups?.map(({ groupId, datasets }) => {
        invariant(query.data?.area?.code != null);
        return <DatasetGroup key={groupId} groupId={groupId} datasets={datasets} />;
      })}
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
  const groups = useMemo(
    () =>
      prefectureDatasetQuery.data?.area?.datasets != null
        ? Object.entries(
            groupBy(
              prefectureDatasetQuery.data.area.datasets.filter(d => !d.cityCode),
              d => d.type.name,
            ),
          )
            .map(([, value]) => value)
            .map(value => ({
              groupId: value.map(({ id }) => id).join(":"),
              datasets: value.sort((a, b) => a.type.order - b.type.order),
            }))
        : [],
    [prefectureDatasetQuery.data?.area?.datasets],
  );

  if (areas.length === 1 && groups.length === 0) {
    return <MunicipalityItem municipality={areas[0]} parents={[prefecture.name]} />;
  }
  return (
    <DatasetTreeItem
      nodeId={prefecture.code}
      label={prefecture.name}
      loading={query.loading}
      disabled={!areas.length}>
      {areas.map(municipality => (
        <MunicipalityItem key={municipality.code} municipality={municipality} />
      ))}
      {groups?.map(({ groupId, datasets }) => (
        <DatasetGroup key={groupId} groupId={groupId} datasets={datasets} />
      ))}
    </DatasetTreeItem>
  );
};

// const RegionalMeshItem: FC = () => {
//   return (
//     <DatasetTreeItem nodeId="RegionalMesh" label="地域メッシュ">
//       {censusDatasets.map(dataset => (
//         <DatasetTreeItem
//           key={dataset.name}
//           nodeId={`RegionalMesh:${dataset.name}`}
//           label={dataset.name}>
//           {dataset.data.map(data => (
//             <CensusDatasetListItem key={data.name} dataset={dataset} data={data} />
//           ))}
//         </DatasetTreeItem>
//       ))}
//     </DatasetTreeItem>
//   );
// };

// 都道府県タブを選択した際のリスト
export const DatasetAreaList: FC = () => {
  const query = useAreas();
  const [expanded, setExpanded] = useAtom(expandedAtom);
  const handleNodeToggle = useCallback(
    (_event: unknown, nodeIds: string[]) => {
      setExpanded(nodeIds);
    },
    [setExpanded]
  );
  const { searchHeaderHeight } = useContext(AppOverlayLayoutContext);

  return (
    <DatasetTreeView
      expanded={expanded}
      onNodeToggle={handleNodeToggle}
      maxheight={window.innerHeight - searchHeaderHeight}
    >
      {/* TODO: Suport heat-map */}
      {/* <RegionalMeshItem /> */}
      {/* <GlobalItem /> */}
      {query.data?.areas.map(
        (prefecture) =>
          prefecture.__typename === "Prefecture" && (
            <PrefectureItem key={prefecture.code} prefecture={prefecture} />
          )
      )}
    </DatasetTreeView>
  );
};
