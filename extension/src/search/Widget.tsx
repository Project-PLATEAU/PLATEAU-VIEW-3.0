import { useAtomValue } from "jotai";
import { memo } from "react";

import { mainWidthAtom, readyAtom } from "../prototypes/view/states/app";
import { AppOverlay } from "../prototypes/view/ui-containers/AppOverlay";
import { WidgetContext } from "../shared/context/WidgetContext";
import { PLATEAUVIEW_SEARCH_DOM_ID } from "../shared/ui-components/common/ViewClickAwayListener";

export const Widget = memo(function WidgetPresenter() {
  const ready = useAtomValue(readyAtom);
  const mainWidth = useAtomValue(mainWidthAtom);

  return (
    <div id={PLATEAUVIEW_SEARCH_DOM_ID}>
      <WidgetContext>
        {ready && <AppOverlay type="main" width={mainWidth} height={81} />}
      </WidgetContext>
    </div>
  );
});
