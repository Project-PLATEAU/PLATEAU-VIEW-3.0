import { FC } from "react";

import inspectorOverviewImg from "./assets/help-inspector-overview.webp";
import { ContentWrapper, Graphic, GraphicItem, PageTitle, SubTitle } from "./common";

export const InspectorPage: FC = () => {
  return (
    <ContentWrapper gap={1.5}>
      <PageTitle>インスペクター</PageTitle>

      <SubTitle>インスペクターでデータセットの設定を変更できます</SubTitle>

      <GraphicItem
        title={"レイヤーマネージャーでレイヤーを選択すると、インスペクターが表示されます"}
        verticalPadding={0}
        horizontalPadding={0}>
        <Graphic img={inspectorOverviewImg} width={570} handLeft={17} handTop={16} />
      </GraphicItem>
    </ContentWrapper>
  );
};
