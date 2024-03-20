import { writeFile } from "fs/promises";

import { isNotNullish } from "../../extension/src/prototypes/type-helpers";

import { convertData, convertTemplate } from "./converter";
import {
  fetchView2Data,
  fetchView2Datacatalog,
  fetchView2Template,
  fetchView3Data,
  fetchView3Template,
  // postView3Data,
  // postView3Template,
} from "./fetch";
import { RawDataCatalogItem } from "./types/view2";
import { Setting as View3Setting } from "./types/view3";

type CSVForDataSetting = {
  name?: string;
  prefecture?: string;
  city?: string;
  ward?: string;
};
const CSV_FOR_DATA_SETTING_HEADERS: (keyof CSVForDataSetting)[] = [
  "name",
  "prefecture",
  "city",
  "ward",
];

const makeCSVForDataSetting = (
  datacatalogs: RawDataCatalogItem[],
  convertedView3Data: Partial<View3Setting>[],
) => {
  const csvDatas: CSVForDataSetting[] = [];
  for (const data of convertedView3Data) {
    const datacatalog = datacatalogs.find(catalog => catalog.id === data.datasetId?.slice(2));
    if (!datacatalog) continue;
    const csvData: CSVForDataSetting = {
      name: datacatalog.name,
      prefecture: datacatalog.pref,
      city: datacatalog.city,
      ward: datacatalog.ward,
    };
    csvDatas.push(csvData);
  }

  return csvDatas
    .reduce(
      (res, csv) => {
        res.push(
          CSV_FOR_DATA_SETTING_HEADERS.map(header => {
            const v = csv[header];
            return v ?? "";
          }).filter(isNotNullish),
        );
        return res;
      },
      [CSV_FOR_DATA_SETTING_HEADERS] as string[][],
    )
    .map(s => s.join(","))
    .join("\n");
};

const main = async () => {
  const view2Data = await fetchView2Data();
  const view2Template = await fetchView2Template();
  const view2Datacatalog = await fetchView2Datacatalog();
  const view3Data = await fetchView3Data();
  const view3Template = await fetchView3Template();

  // console.log("Delete all...");
  // await dengerDeleteAllTemplate(view3Template);
  // await dengerDeleteAllData(view3Data);

  console.log("Converting templates...");
  const convertedView3Templates = convertTemplate(view2Template, view3Template);
  // await postView3Template(convertedView3Templates);
  console.log("Saved templates...");

  console.log("Converting setting data...");
  const convertedView3Data = convertData(
    view2Data,
    view2Datacatalog.filter(d => d.type_en === "usecase"),
    view3Data,
    convertedView3Templates,
  );
  // await postView3Data(convertedView3Data as View3Setting[]);
  console.log("Saved setting data...");

  console.log("Making CSV...");
  const rawCSVForDataSetting = makeCSVForDataSetting(view2Datacatalog, convertedView3Data);
  await writeFile("./dataSetting.csv", rawCSVForDataSetting);
  console.log("Saved CSV...");
};

await main();
