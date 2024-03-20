import { useAtomValue } from "jotai";
import { useEffect, type FC, useMemo, useRef } from "react";

import { useAddLayer } from "../../../prototypes/layers";
import { PlateauDatasetType } from "../../../prototypes/view/constants/plateau";
import { useDatasets } from "../../graphql";
import { DatasetItem, DatasetsInput } from "../../graphql/types/catalog";
import { settingsAtom } from "../../states/setting";
import { templatesAtom } from "../../states/template";
import { createRootLayerAtom } from "../../view-layers/rootLayer";

export const InitialLayers: FC = () => {
  const addLayer = useAddLayer();

  const initialDatasetInput: DatasetsInput = useMemo(
    () => ({
      areaCodes: ["13101", "13102"],
      includeTypes: [PlateauDatasetType.Building],
      year: 2022,
    }),
    [],
  );
  const query = useDatasets(initialDatasetInput);
  const settings = useAtomValue(settingsAtom);
  const templates = useAtomValue(templatesAtom);

  const initialDatasets = useMemo(() => query.data?.datasets ?? [], [query]);

  // TODO: Get share ID
  const shareId = undefined;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const templatesRef = useRef(templates);
  templatesRef.current = templates;
  useEffect(() => {
    const remove = initialDatasets.map(d => {
      const dataList = d.items as DatasetItem[];
      return addLayer(
        createRootLayerAtom({
          dataset: d,
          areaCode: d.wardCode || d.cityCode || d.prefectureCode,
          currentDataId: dataList.find(v => v.name === "LOD2（テクスチャなし）")?.id,
          settings: settingsRef.current.filter(s => s.datasetId === d.id),
          templates: templatesRef.current,
          shareId,
        }),
        { autoSelect: false },
      );
    });
    // const remove = [
    // addLayer(
    //   createRootLayerAtom({
    //     type: BUILDING_LAYER,
    //     municipalityCode: "13101",
    //     version: "2020",
    //     lod: 2,
    //     textured: false,
    //   }),
    //   { autoSelect: false },
    // ),
    //   addLayer(
    //     createViewLayer({
    //       type: BUILDING_LAYER,
    //       municipalityCode: "13102",
    //       version: "2020",
    //       lod: 2,
    //       textured: false,
    //     }),
    //     { autoSelect: false },
    //   ),
    //   // addLayer(
    //   //   createViewLayer({
    //   //     type: PEDESTRIAN_LAYER,
    //   //     location: {
    //   //       longitude: 139.769,
    //   //       latitude: 35.68,
    //   //     },
    //   //   }),
    //   //   { autoSelect: false },
    //   // ),
    //   // addLayer(
    //   //   createViewLayer({
    //   //     type: HEATMAP_LAYER,
    //   //     urls: [
    //   //       `${process.env.NEXT_PUBLIC_DATA_BASE_URL}/estat/T001102/tblT001102Q5339.txt`,
    //   //       `${process.env.NEXT_PUBLIC_DATA_BASE_URL}/estat/T001102/tblT001102Q5439.txt`,
    //   //       `${process.env.NEXT_PUBLIC_DATA_BASE_URL}/estat/T001102/tblT001102Q5340.txt`,
    //   //       `${process.env.NEXT_PUBLIC_DATA_BASE_URL}/estat/T001102/tblT001102Q5440.txt`,
    //   //     ],
    //   //     parserOptions: {
    //   //       codeColumn: 0,
    //   //       valueColumn: 4,
    //   //       skipHeader: 2,
    //   //     },
    //   //   }),
    //   //   { autoSelect: false },
    //   // ),
    // ];
    return () => {
      remove.forEach(remove => {
        remove();
      });
    };
  }, [addLayer, initialDatasets, shareId]);

  return null;
};
