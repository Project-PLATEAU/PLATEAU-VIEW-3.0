import { expect, test } from "vitest";

import { DatasetTypeCategory } from "../../../shared/graphql/types/catalog";

import { getDatasetGroups } from "./datasetGroups";

test("Dataset group", () => {
  const d1 = {
    id: "d_13101_bldg",
    name: "建築物モデル（千代田区）",
    groups: ["公園モデル"],
    type: {
      id: "dt_bldg_2",
      code: "bldg",
      name: "建築物モデル",
      category: DatasetTypeCategory.Plateau,
      order: 25,
    },
    year: 2022,
    items: [],
  };

  const d2 = {
    id: "d_13100_tran",
    name: "道路モデル（東京都23区）",
    groups: null,
    type: {
      id: "dt_tran_2",
      code: "tran",
      name: "道路モデル",
      category: DatasetTypeCategory.Plateau,
      order: 26,
    },
    year: 2022,
    items: [],
  };

  const d3 = {
    id: "d_13100_frn",
    name: "都市設備モデル（東京都23区）",
    groups: ["公園モデル"],
    type: {
      id: "dt_frn_2",
      code: "frn",
      name: "都市設備モデル",
      category: DatasetTypeCategory.Plateau,
      order: 30,
    },
    year: 2022,
    items: [],
  };
  const datasets = [d1, d2, d3];

  expect(getDatasetGroups({ datasets })).toStrictEqual({
    typicalTypeGroups: [
      {
        datasets: [{ folderPath: "道路モデル（東京都23区）", ...d2 }],
        groupId: "type:道路モデル",
        label: "道路モデル",
      },
    ],
    dataGroups: [
      {
        datasets: [
          { folderPath: "建築物モデル（千代田区）", ...d1 },
          { folderPath: "都市設備モデル（東京都23区）", ...d3 },
        ],
        groupId: "group:公園モデル",
        label: "公園モデル",
        useTree: true,
      },
    ],
    genericGroups: [],
  });
});

test("Dataset group with sample data", () => {
  const d1 = {
    id: "d_22203_numazu-shi_ex_port-numazukou-bldg",
    name: "建築物モデル（沼津港）",
    groups: ["港湾モデル", "沼津港"],
    type: {
      id: "dt_sample",
      code: "sample",
      name: "サンプルデータ",
      category: DatasetTypeCategory.Plateau,
      order: 48,
    },
    year: 2021,
    items: [],
  };

  const d2 = {
    id: "d_01gnbkkd7dsgnqgyppfcz37ghw",
    name: "移動の軌跡（沼津市）",
    groups: null,
    type: {
      id: "dt_usecase",
      code: "usecase",
      name: "ユースケース",
      category: DatasetTypeCategory.Plateau,
      order: 47,
    },
    year: 2021,
    items: [],
  };

  const d3 = {
    id: "d_22203_numazu-shi_ex_fport-hedagyoko-area",
    name: "区域モデル（戸田漁港）",
    groups: ["港湾モデル", "戸田漁港"],
    type: {
      id: "dt_sample",
      code: "sample",
      name: "サンプルデータ",
      category: DatasetTypeCategory.Plateau,
      order: 48,
    },
    year: 2021,
    items: [],
  };

  const d4 = {
    id: "d_22203_numazu-shi_ex_fport-hedagyoko-wwy",
    name: "交通（航路）モデル（戸田漁港）",
    groups: ["港湾モデル", "戸田漁港"],
    type: {
      id: "dt_sample",
      code: "sample",
      name: "サンプルデータ",
      category: DatasetTypeCategory.Plateau,
      order: 48,
    },
    year: 2021,
    items: [],
  };

  const d5 = {
    id: "d_22203_numazu-shi_ex_port-numazukou-sample",
    name: "Mock Sample Dataset",
    groups: null,
    type: {
      id: "dt_sample",
      code: "sample",
      name: "サンプルデータ",
      category: DatasetTypeCategory.Plateau,
      order: 48,
    },
    year: 2021,
    items: [],
  };

  const d6 = {
    id: "d_22203_numazu-shi_ex_fport-shizuragyoko-park",
    name: "Mock 公園モデル",
    groups: ["公園モデル"],
    type: {
      id: "dt_sample",
      code: "sample",
      name: "サンプルデータ",
      category: DatasetTypeCategory.Plateau,
      order: 48,
    },
    year: 2021,
    items: [],
  };

  const datasets = [d1, d2, d3, d4, d5, d6];

  expect(getDatasetGroups({ datasets })).toStrictEqual({
    typicalTypeGroups: [],
    dataGroups: [
      {
        datasets: [
          { folderPath: "沼津港/建築物モデル（沼津港）", ...d1 },
          { folderPath: "戸田漁港/区域モデル（戸田漁港）", ...d3 },
          { folderPath: "戸田漁港/交通（航路）モデル（戸田漁港）", ...d4 },
        ],
        groupId: "group:港湾モデル",
        label: "港湾モデル",
        useTree: true,
      },
      {
        datasets: [{ folderPath: "Mock 公園モデル", ...d6 }],
        groupId: "group:公園モデル",
        label: "公園モデル",
        useTree: true,
      },
    ],
    genericGroups: [
      {
        datasets: [{ folderPath: "移動の軌跡（沼津市）", ...d2 }],
        groupId: "generic:ユースケース",
        label: "ユースケース",
        useTree: true,
      },
      {
        datasets: [{ folderPath: "Mock Sample Dataset", ...d5 }],
        groupId: "generic:サンプルデータ",
        label: "サンプルデータ",
        useTree: true,
      },
    ],
  });
});
