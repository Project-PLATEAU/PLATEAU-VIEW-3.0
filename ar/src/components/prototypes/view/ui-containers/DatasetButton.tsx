import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useId, type FC } from "react";

import { AppIconButton, OverlayPopper, LayerIcon } from "../../ui-components";

import { DatasetPanel } from "./DatasetPanel";

export const DatasetButton: FC = () => {
  const id = useId();
  const popupState = usePopupState({
    variant: "popover",
    popupId: id,
  });
  const popoverProps = bindPopover(popupState);

  return (
    <>
      <AppIconButton
        title="データセット選択"
        selected={popoverProps.open}
        disableTooltip={popoverProps.open}
        {...bindTrigger(popupState)}>
        <LayerIcon />
      </AppIconButton>
      <OverlayPopper {...popoverProps} inset={1.5}>
        <DatasetPanel />
      </OverlayPopper>
    </>
  );
};
