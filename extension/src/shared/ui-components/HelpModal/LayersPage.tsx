import { FC } from "react";

import cityListImg from "./assets/help-layers-city-list.webp";
import clickListItemToAddImg from "./assets/help-layers-click-list-item-to-add.webp";
import clickCurrentDatasetToAddImg from "./assets/help-layers-current-area-dataset-click-to-add.webp";
import currentAreaDatasetsImg from "./assets/help-layers-current-area-datasets.webp";
import currentAreaTypesImg from "./assets/help-layers-current-area-types.webp";
import currentAreaImg from "./assets/help-layers-current-area.webp";
import layerHideAndRemoveImg from "./assets/help-layers-layer-hide-and-remove.webp";
import layerListImg from "./assets/help-layers-layer-list.webp";
import searchListImg from "./assets/help-layers-search-list.webp";
import searchImg from "./assets/help-layers-search.webp";
import typeListImg from "./assets/help-layers-type-list.webp";
import UnfoldLayerListImg from "./assets/help-layers-unfold-layer-list.webp";
import {
  ContentWrapper,
  Graphic,
  GraphicItem,
  PageTitle,
  SecondaryTitle,
  SubTitle,
} from "./common";

export const LayersPage: FC = () => {
  return (
    <ContentWrapper gap={1.5}>
      <PageTitle>データセットの追加</PageTitle>

      <SecondaryTitle>データセットの追加には2つの方法があります</SecondaryTitle>

      <SubTitle>①カタログを通して任意のデータセットを追加する</SubTitle>

      <GraphicItem title={"検索ボックスをクリックしてカタログへ"} verticalPadding={2}>
        <Graphic img={searchImg} width={224} handLeft={52} handTop={7} />
      </GraphicItem>

      <GraphicItem title={"検索、都道府県、カテゴリーでデータセットの一覧を表示する"} gap={1}>
        <Graphic img={searchListImg} width={167} />
        <Graphic img={cityListImg} width={167} />
        <Graphic img={typeListImg} width={167} />
      </GraphicItem>

      <GraphicItem title={"データセットをクリックしてビューアに追加する"}>
        <Graphic img={clickListItemToAddImg} width={167} handLeft={55} handTop={67} />
      </GraphicItem>

      <SubTitle>②ショートカットを使って現在の地域のデータセットを追加する</SubTitle>

      <GraphicItem title={"現在の地図の中心にある地域を表示する"} verticalPadding={2}>
        <Graphic img={currentAreaImg} width={255} />
      </GraphicItem>

      <GraphicItem
        title={"矢印のある項目をクリックするとリストが開きます"}
        direction={"column"}
        gap={0.5}>
        <Graphic img={currentAreaImg} width={182} handLeft={51} handTop={9} zIndex={2} />
        <Graphic img={currentAreaTypesImg} width={545} handLeft={62} handTop={2} />
        <Graphic img={currentAreaDatasetsImg} width={246} />
      </GraphicItem>

      <GraphicItem title={"データセットをクリックしてビューアに追加する"}>
        <Graphic img={clickCurrentDatasetToAddImg} width={246} handLeft={39} handTop={14} />
      </GraphicItem>

      <PageTitle>データセットの管理</PageTitle>

      <GraphicItem title={"クリックしてレイヤーマネージャーを開く"} gap={2}>
        <Graphic img={UnfoldLayerListImg} width={232} handLeft={61} handTop={18} />
      </GraphicItem>

      <GraphicItem title={"レイヤーマネージャー"}>
        <Graphic img={layerListImg} width={232} />
      </GraphicItem>

      <GraphicItem title={"削除と隠す"}>
        <Graphic img={layerHideAndRemoveImg} width={232} handLeft={83} handTop={65} />
      </GraphicItem>
    </ContentWrapper>
  );
};
