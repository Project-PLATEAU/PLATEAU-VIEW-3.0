import { useAtomValue } from "jotai";
import { groupBy } from "lodash-es";
import { FC, useMemo } from "react";
import invariant from "tiny-invariant";

import { useAreaDatasets } from "../../../shared/graphql";
import { areasAtom } from "../../../shared/states/address";
import { DatasetTreeView } from "../../ui-components";

import { DatasetGroup } from "./DatasetGroup";

export const CityDatasetsList: FC<{
  cityName: string;
}> = ({ cityName }) => {
  const areas = useAtomValue(areasAtom);
  const municipalityMeta = useMemo(
    () => areas?.find(area => area.type === "municipality" && area.name === cityName),
    [areas, cityName],
  );

  const query = useAreaDatasets(municipalityMeta?.code ?? "");

  const groups = useMemo(
    () =>
      query.data?.area?.datasets != null
        ? Object.entries(groupBy(query.data.area.datasets, d => d.type.name)).map(
            ([key, value]) => ({
              label: key,
              groupId: value.map(({ id }) => id).join(":"),
              datasets: value.sort((a, b) => a.type.order - b.type.order),
            }),
          )
        : undefined,
    [query.data?.area?.datasets],
  );
  return (
    <DatasetTreeView>
      {groups?.map(groupItem => {
        invariant(query.data?.area?.code != null);
        return <DatasetGroup key={groupItem.groupId} groupItem={groupItem} />;
      })}
    </DatasetTreeView>
  );
};
