import { styled } from "@mui/material";
import { type FC } from "react";

import { FloatingPanel } from "../../ui-components";
import { MainPanel } from "./MainPanel";

const Root = styled(FloatingPanel)(({ theme }) => ({
  width: 300,
  maxHeight: 300,
  // padding: theme.spacing(1),
}));

const Title = styled("div")(({ theme }) => ({
  ...theme.typography.h5,
  margin: theme.spacing(1),
}));

export const DatasetPanel: FC = () => {
  return (
    // TODO: ここのmaxHeightが設定されていないっぽいのと、都道府県のディスクロージャーを開いた瞬間に無限ループでAPIを叩いちゃうっぽくてUIブロッキングされる&リロードしてもサーバのセッションが閉じてないっぽくてウィンドウを閉じるまで再接続できなくなる
    // TODO: 追加中のレイヤー一覧からレイヤーを選択した際にレイヤーの詳細とコントロールを行うSelectionPanelをARViewでも表示したいと思われるので、MainPanelを単独で使用するのではなくAppOverlayを使った方がよさそうだが、そうするとポップアップから出すというのが微妙になりそうなのでどうするか考える
    <Root>
      <MainPanel />
    </Root>
  );
};
