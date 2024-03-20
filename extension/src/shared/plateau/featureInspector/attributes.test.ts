import { expect, test } from "vitest";

import { getRootFields } from "./attributes";

test("getRootFields bldg", () => {
  expect(
    getRootFields({
      "bldg:measuredHeight": 11.3,
      "uro:BuildingDetailAttribute_uro:surveyYear": 2021,
      _lod: 1,
      _x: 138.14665217202196,
      _y: 36.00597282717696,
      _xmin: 138.1465778211494,
      _xmax: 138.14672652289448,
      _ymin: 36.005906203235355,
      _ymax: 36.00603945111857,
      _zmin: 813.316,
      _zmax: 822.282,
      meshcode: "54380101",
      feature_type: "bldg:Building",
      city_code: "20214",
      city_name: "長野県茅野市",
      gml_id: "bldg_b7f3a2bd-f50b-4a6a-9741-76336f2af940",
      attributes: {},
      "bldg:usage": "住宅",
      "bldg:storeysAboveGround": 2,
      "bldg:storeysBelowGround": 0,
      "uro:BuildingIDAttribute_uro:buildingID": "20214-bldg-46906",
      "uro:BuildingIDAttribute_uro:prefecture": "長野県",
      "uro:BuildingIDAttribute_uro:city": "長野県茅野市",
      "uro:BuildingDetailAttribute_uro:buildingStructureType": "木造・土蔵造",
      "uro:BuildingDetailAttribute_uro:landUseType":
        "住宅用地（住宅、共同住宅、店舗等併用住宅、店舗等併用共同住宅、作業所併用住宅）",
      "uro:BuildingDataQualityAttribute_uro:lod1HeightType": "点群から取得_中央値",
      建築年区分: "1993年以降",
      土砂災害リスク_急傾斜地の崩落_区域区分: "土砂災害警戒区域（指定済）",
      土砂災害リスク_急傾斜地の崩落_区域区分コード: 1,
      土砂災害リスク_土石流_区域区分: "土砂災害警戒区域（指定済）",
      土砂災害リスク_土石流_区域区分コード: 1,
    }),
  ).toEqual({
    ID: "bldg_b7f3a2bd-f50b-4a6a-9741-76336f2af940",
    LOD1の立ち上げに使用する建築物の高さ: "点群から取得_中央値",
    LOD: 1,
    メッシュコード: "54380101",
    土地利用区分: "住宅用地（住宅、共同住宅、店舗等併用住宅、店舗等併用共同住宅、作業所併用住宅）",
    土砂災害リスク土石流区域区分: "土砂災害警戒区域（指定済）",
    土砂災害リスク土石流区域区分コード: 1,
    土砂災害リスク急傾斜地の崩落区域区分: "土砂災害警戒区域（指定済）",
    土砂災害リスク急傾斜地の崩落区域区分コード: 1,
    地上階数: 2,
    地下階数: 0,
    地物タイプ: "bldg:Building",
    市区町村: "長野県茅野市",
    市区町村コード: "20214",
    整備対象都市: "長野県茅野市",
    建物ID: "20214-bldg-46906",
    建築年区分: "1993年以降",
    構造種別: "木造・土蔵造",
    用途: "住宅",
    計測高さ: 11.3,
    調査年: 2021,
    都道府県: "長野県",
  });
});

test("getRootFields veg", () => {
  expect(
    getRootFields({
      feature_type: "veg:PlantCover",
      "tran:function": "test",
    }),
  ).toEqual({
    地物タイプ: "veg:PlantCover",
    "分類 ※植被": "test",
  });
});
