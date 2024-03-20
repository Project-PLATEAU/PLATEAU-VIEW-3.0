import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ATTRIBUTES = [
  `gml:id,{"featureType":"custom","description":"ID"}`,
  `gml_id,{"featureType":"custom","description":"ID"}`,
  `gml_name,{"featureType":"custom","description":"名前"}`,
  `name,{"featureType":"custom","description":"名前"}`,
  `type,{"featureType":"custom","description":"タイプ"}`,
  `value,{"featureType":"custom","description":"値"}`,
  `feature_type,{"featureType":"custom","description":"地物タイプ"}`,
  `meshcode,{"featureType":"custom","description":"メッシュコード"}`,
  `city,{"featureType":"custom","description":"市区町村"}`,
  `city_code,{"featureType":"custom","description":"市区町村コード"}`,
  `city_name,{"featureType":"custom","description":"整備対象都市"}`,
  `lod1HeightType,{"featureType":"custom","description":"LOD1の立ち上げに使用する建築物の高さ"}`,
  `buildingID,{"featureType":"custom","description":"建物ID"}`,
  `prefecture,{"featureType":"custom","description":"都道府県"}`,
  `prefecture_code,{"featureType":"custom","description":"都道府県コード"}`,
  `prefecture_name,{"featureType":"custom","description":"都道府県名"}`,
  `uro:WaterBodyRiverFloodingRiskAttribute,{"featureType":"custom","description":"損傷状況"}`,
  `uro:rank,{"featureType":"custom","description":"浸水ランク"}`,
  `uro:rankOrg,{"featureType":"custom","description":"浸水ランク（独自）"}`,
  `rank,{"featureType":"custom","description":"浸水ランク"}`,
  `rankOrg,{"featureType":"custom","description":"浸水ランク（独自）"}`,
  `uro:rank_code,{"featureType":"custom","description":"浸水ランクコード"}`,
  `uro:rankOrg_code,{"featureType":"custom","description":"浸水ランク（独自）コード"}`,
  `rank_code,{"featureType":"custom","description":"浸水ランクコード"}`,
  `rankOrg_code,{"featureType":"custom","description":"浸水ランク（独自）コード"}`,
  `uro:adminType,{"featureType":"custom","description":"指定機関"}`,
  `uro:adminType_code,{"featureType":"custom","description":"指定機関コード"}`,
  `uro:description,{"featureType":"custom","description":"設定等名称"}`,
  `uro:description_code,{"featureType":"custom","description":"設定等名称コード"}`,
  `uro:scale,{"featureType":"custom","description":"規模"}`,
  `uro:scale_code,{"featureType":"custom","description":"規模コード"}`,
  `uro:depthuom,{"featureType":"custom","description":"浸水深単位"}`,
  `uro:durationuom,{"featureType":"custom","description":"継続時間単位"}`,
  `ancestors,{"featureType":"custom","description":"原型"}`,
  `uro:BuildingIDAttribute,{"featureType":"custom","description":"建物識別情報"}`,
  `uro:BuildingDetailAttribute,{"featureType":"custom","description":"建物利用現況"}`,
  `uro:LargeCustomerFacilityAttribute,{"featureType":"custom","description":"大規模小売店舗等の立地状況"}`,
  `uro:BuildingRiverFloodingRiskAttribute,{"featureType":"custom","description":"洪水浸水リスク"}`,
  `uro:BuildingTsunamiRiskAttribute,{"featureType":"custom","description":"津波浸水リスク"}`,
  `uro:BuildingHighTideRiskAttribute,{"featureType":"custom","description":"高潮浸水リスク"}`,
  `uro:BuildingInlandFloodingRiskAttribute,{"featureType":"custom","description":"内水浸水リスク"}`,
  `uro:BuildingLandSlideRiskAttribute,{"featureType":"custom","description":"土砂災害リスク"}`,
  `uro:BuildingDataQualityAttribute,{"featureType":"custom","description":"データ品質属性"}`,
  `uro:KeyValuePair,{"featureType":"custom","description":"拡張属性"}`,
  `uro:IfcProject,{"featureType":"custom","description":"プロジェクト情報"}`,
  `uro:IfcBuilding,{"featureType":"custom","description":"建築物情報"}`,
  `uro:IfcSite,{"featureType":"custom","description":"敷地情報"}`,
  `uro:IfcCoordinateReferenceSystem,{"featureType":"custom","description":"座標参照系情報"}`,
  `uro:IfcProjectedCRS,{"featureType":"custom","description":"投影座標系情報"}`,
  `uro:IfcMapConversion,{"featureType":"custom","description":"座標変換情報"}`,
  `uro:IfcPsetBuildingCommon,{"featureType":"custom","description":"建築物共通属性"}`,
  `uro:IfcPsetSiteCommon,{"featureType":"custom","description":"敷地共通属性"}`,
  `uro:IndoorFacilityAttribute,{"featureType":"custom","description":"屋内施設属性"}`,
  `uro:IndoorZoneAttribute,{"featureType":"custom","description":"屋内区画属性"}`,
  `uro:IndoorUserDefinedAttribute,{"featureType":"custom","description":"屋内利用者定義属性"}`,
  `uro:FacilityIdAttribute,{"featureType":"custom","description":"施設識別属性"}`,
  `uro:RiverFacilityIdAttribute,{"featureType":"custom","description":"施設識別属性（河川管理施設）"}`,
  `HarborFacility,{"featureType":"custom","description":"水域施設"}`,
  `PortProtectiveFacility,{"featureType":"custom","description":"外郭施設"}`,
  `MooringFacility,{"featureType":"custom","description":"係留施設"}`,
  `PortTransportationFacility,{"featureType":"custom","description":"臨港交通施設"}`,
  `NavigationAssistanceFacility,{"featureType":"custom","description":"航行補助施設"}`,
  `CargoHandlingFacility,{"featureType":"custom","description":"荷捌き施設"}`,
  `PortPassengerFacility,{"featureType":"custom","description":"旅客施設"}`,
  `PortStorageFacility,{"featureType":"custom","description":"保管施設"}`,
  `ShipServiceFacility,{"featureType":"custom","description":"船舶役務用施設"}`,
  `ortWasteTreatmentFacility,{"featureType":"custom","description":"廃棄物処理施設"}`,
  `PortEnvironmentalImprovementFacility,{"featureType":"custom","description":"環境整備施設"}`,
  `PortPollutionControlFacility,{"featureType":"custom","description":"公害防止施設"}`,
  `PortWelfareFacility,{"featureType":"custom","description":"厚生施設"}`,
  `PortManagementFacility,{"featureType":"custom","description":"港湾管理施設"}`,
  `CyberportMarinaAndPBS,{"featureType":"custom","description":"マリーナ・PBS"}`,
  `FishingPortFacility,{"featureType":"custom","description":"漁港施設情報"}`,
  `FishingPortCapacity,{"featureType":"custom","description":"漁港施設能力情報"}`,
  `MaintenanceHistoryAttribute,{"featureType":"custom","description":"点検工事記録"}`,
  `DmGeometricAttribute,{"featureType":"custom","description":"図式情報"}`,
  `DmAnnotation,{"featureType":"custom","description":"注記情報"}`,
  `RealEstateIDAttribute,{"featureType":"custom","description":"不動産ID"}`,
  `uro:buildingIDAttribute,{"featureType":"custom","description":"建物識別情報"}`,
  `uro:IfcPsetSpaceCommon,{"featureType":"custom","description":"空間共通属性"}`,
  `uro:IfcSpace,{"featureType":"custom","description":"空間情報"}`,
  `uro:IfcSpaceBaseQuantity,{"featureType":"custom","description":"定量基本情報"}`,
  `uro:IfcClassificationReference,{"featureType":"custom","description":"空間分類情報"}`,
  `uro:IndoorSpaceAttribute,{"featureType":"custom","description":"屋内空間属性"}`,
  `uro:IfcBuildingElement,{"featureType":"custom","description":"BIMモデルからの変換情報"}`,
  `uro:IfcRoof,{"featureType":"custom","description":"BIMモデルからの変換情報"}`,
  `uro:IfcWall,{"featureType":"custom","description":"壁情報"}`,
  `uro:IfcWallStandardCase,{"featureType":"custom","description":"標準壁情報"}`,
  `uro:IfcCurtainWall,{"featureType":"custom","description":"カーテンウォール情報"}`,
  `uro:IfcOpeningElement,{"featureType":"custom","description":"開口部情報"}`,
  `uro:IfcWindow,{"featureType":"custom","description":"窓情報"}`,
  `uro:IfcPsetOpeningElementCommon,{"featureType":"custom","description":"開口部共通属性"}`,
  `uro:IfcPsetWindowCommon,{"featureType":"custom","description":"窓共通属性"}`,
  `uro:IfcDoor,{"featureType":"custom","description":"扉情報"}`,
  `uro:IfcPsetDoorCommon,{"featureType":"custom","description":"扉共通属性"}`,
  `uro:IndoorFurnishingAttribute,{"featureType":"custom","description":"屋内家具属性"}`,
  `uro:IndoorTactileTileAttribute,{"featureType":"custom","description":"屋内点字ブロック属性"}`,
  `uro:IfcFurnishingElement,{"featureType":"custom","description":"BIMモデルからの変換情報"}`,
  `uro:IndoorPublicTagAttribute,{"featureType":"custom","description":"パブリックタグ属性"}`,
  `uro:IfcBuildingStorey,{"featureType":"custom","description":"階数情報"}`,
  `IfcZone,{"featureType":"custom","description":"任意区画情報"}`,
  `uro:IndoorStoreyAttribute,{"featureType":"custom","description":"階数情報"}`,
  `uro:RoadStructureAttribute,{"featureType":"custom","description":"道路構造"}`,
  `uro:TrafficVolumeAttribute,{"featureType":"custom","description":"交通量"}`,
  `uro:TrafficAreaStructureAttribute,{"featureType":"custom","description":"道路構造"}`,
  `uro:TransportationDataQualityAttribute,{"featureType":"custom","description":"データ品質属性"}`,
  `uro:RailwayRouteAttribute,{"featureType":"custom","description":"道路構造"}`,
  `uro:RailwayTrackAttribute,{"featureType":"custom","description":"道路構造"}`,
  `uro:SquareUrbanPlanAttribute,{"featureType":"custom","description":"広場の詳細属性"}`,
  `uro:StationSquareAttribute,{"featureType":"custom","description":"広場の詳細属性"}`,
  `uro:TerminalAttribute,{"featureType":"custom","description":"自動車ターミナルの詳細属性"}`,
  `urf:Boundary,{"featureType":"custom","description":"境界"}`,
  `app:TexCoordList,{"featureType":"custom","description":"対象ジオメトリ"}`,
  `uro:ConstructionBaseAttribute,{"featureType":"custom","description":"構造物基本属性"}`,
  `uro:BridgeStructureAttribute,{"featureType":"custom","description":"構造属性"}`,
  `uro:BridgeFunctionalAttribute,{"featureType":"custom","description":"橋梁機能属性"}`,
  `uro:ConstructionRiskAssessmentAttribute,{"featureType":"custom","description":"損傷マップ属性"}`,
  `uro:RiverFloodingRiskAttribute,{"featureType":"custom","description":"損傷状況"}`,
  `uro:TsunamiRiskAttribute,{"featureType":"custom","description":"津波浸水リスク"}`,
  `uro:HighTideRiskAttribute,{"featureType":"custom","description":"高潮浸水リスク"}`,
  `uro:InlandFloodingRiskAttribute,{"featureType":"custom","description":"内水浸水リスク"}`,
  `uro:LandSlideRiskAttribute,{"featureType":"custom","description":"土砂災害リスク"}`,
  `uro:ConstructionDataQualityAttribute,{"featureType":"custom","description":"データ品質属性"}`,
  `uro:TunnelStructureAttribute,{"featureType":"custom","description":"構造属性"}`,
  `uro:TunnelFunctionalAttribute,{"featureType":"custom","description":"トンネル機能属性"}`,
  `uro:ConstructionRiskAssessmentAttribute,{"featureType":"custom","description":"損傷マップ属性"}`,
  `uro:ConstructionStructureAttribute,{"featureType":"custom","description":"構造属性"}`,
  `uro:EmbankmentAttribute,{"featureType":"custom","description":"堤防属性"}`,
  `uro:DamAttribute,{"featureType":"custom","description":"ダム属性"}`,
  `uro:WaterBodyDetailAttribute,{"featureType":"custom","description":"水部詳細属性"}`,
  `urfBoundary,{"featureType":"custom","description":"境界"}`,
];

const __dirname = dirname(fileURLToPath(import.meta.url));

const parseDepricatedTag = (v: string) => v.match(/^\((.+)\)$/)?.[1] || v;

const splitTag = (v: string) => v.split(".");

const main = async (filename: string, newFileName: string) => {
  const filePath = path.resolve(__dirname, filename);
  const file = await fs.readFile(filePath, { encoding: "utf-8" });
  const lines = file.split(/\r\n|\n/);
  const result: string[] = [...DEFAULT_ATTRIBUTES];
  let i = -1;
  for (const line of lines) {
    i++;
    if (i === 0 || !line) {
      continue;
    }

    const columns = line.split(",");

    const featureType = columns[1];
    const tag1 = splitTag(columns[2]).map(parseDepricatedTag);
    const tag2 = splitTag(columns[3]).map(parseDepricatedTag);
    const tag3 = splitTag(columns[4]).map(parseDepricatedTag);
    const tag4 = splitTag(columns[5]).map(parseDepricatedTag);
    const description = columns[6];
    const dataType = (() => {
      switch (columns[7]) {
        case "xs:date":
          return "date";
        case "xs:gYear":
          return "gYear";
      }
    })();

    const joinedTags = tag1
      .flatMap(tag1 =>
        tag2.flatMap(tag2 =>
          tag3.flatMap(tag3 =>
            tag4.flatMap(tag4 => [featureType, tag1, tag2, tag3, tag4].filter(Boolean).join("_")),
          ),
        ),
      )
      .filter(Boolean);

    joinedTags.forEach(key => {
      result.push([key, JSON.stringify({ description, dataType })].join(","));
    });
  }

  await fs.writeFile(path.resolve(__dirname, newFileName), result.join("\n"));
};

// const temp = async (filename: string, newFileName: string) => {
//   const filePath = path.resolve(__dirname, filename);
//   const file = await fs.readFile(filePath, { encoding: "utf-8" });
//   const lines = file.split(/\r\n|\n/);
//   const nestedTag1: string[] = [];
//   const result: string[] = [];
//   let i = -1;
//   for (const line of lines) {
//     i++;
//     if (i === 0 || !line) {
//       continue;
//     }

//     const columns = line.split(",");

//     const tag1 = columns[2];
//     const description = columns[6];

//     const key = tag1.split(".")[1];
//     if (tag1.includes(".") && !nestedTag1.includes(key)) {
//       result.push([key, description].join(","));
//       nestedTag1.push(key);
//     }
//   }

//   await fs.writeFile(path.resolve(__dirname, newFileName), result.join("\n"));
// };

await main("../attributes_raw_v3.csv", "../attributes.txt");
// await temp("../attributes_v3_raw.csv", "../attributes_temp.txt");
