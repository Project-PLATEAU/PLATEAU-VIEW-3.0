import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useId, type FC } from "react";

import { AppIconButton, OverlayPopper, VisibilityOnIcon } from "../../ui-components";

import { FovPanel } from "./FovPanel";

export const FovButton: FC = () => {
  const id = useId();
  const popupState = usePopupState({
    variant: "popover",
    popupId: id,
  });
  const popoverProps = bindPopover(popupState);

  return (
    <>
      <AppIconButton
        title="視野角設定"
        selected={popoverProps.open}
        disableTooltip={popoverProps.open}
        {...bindTrigger(popupState)}>
        <VisibilityOnIcon />
      </AppIconButton>
      <OverlayPopper {...popoverProps} inset={1.5}>
        <FovPanel />
      </OverlayPopper>
    </>
  );
};
