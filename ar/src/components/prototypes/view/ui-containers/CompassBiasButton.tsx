import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useId, type FC } from "react";

import { AppIconButton, OverlayPopper, RotateAroundIcon } from "../../ui-components";

import { CompassBiasPanel } from "./CompassBiasPanel";

export const CompassBiasButton: FC = () => {
  const id = useId();
  const popupState = usePopupState({
    variant: "popover",
    popupId: id,
  });
  const popoverProps = bindPopover(popupState);

  return (
    <>
      <AppIconButton
        title="方位調整"
        selected={popoverProps.open}
        disableTooltip={popoverProps.open}
        {...bindTrigger(popupState)}>
        <RotateAroundIcon />
      </AppIconButton>
      <OverlayPopper {...popoverProps} inset={1.5}>
        <CompassBiasPanel />
      </OverlayPopper>
    </>
  );
};
