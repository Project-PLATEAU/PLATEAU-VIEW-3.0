import { memo } from "react";

import { AppOverlay } from "../prototypes/view/ui-containers/AppOverlay";
import { WidgetContext } from "../shared/context/WidgetContext";
import { PLATEAUVIEW_INSPECTOR_DOM_ID } from "../shared/ui-components/common/ViewClickAwayListener";

export const Widget = memo(function WidgetPresenter() {
  return (
    <div id={PLATEAUVIEW_INSPECTOR_DOM_ID}>
      <WidgetContext>
        <AppOverlay type="aside" width={320} height={0} />
      </WidgetContext>
    </div>
  );
});
