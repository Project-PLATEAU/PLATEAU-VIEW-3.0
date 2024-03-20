import { useAtomValue } from "jotai";
import { memo } from "react";

import { readyAtom } from "../prototypes/view/states/app";
import { WidgetContext } from "../shared/context/WidgetContext";
import { inEditor } from "../shared/reearth/utils";

import { Editor } from "./containers";

export const Widget = memo(function WidgetPresenter() {
  const enabled = inEditor();
  const ready = useAtomValue(readyAtom);

  return enabled ? <WidgetContext>{ready && <Editor />}</WidgetContext> : null;
});
