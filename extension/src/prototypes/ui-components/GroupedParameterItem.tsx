import { Divider, Popover, styled, useTheme } from "@mui/material";
import { anchorRef, bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useId, type ReactNode, MouseEventHandler, forwardRef, useImperativeHandle } from "react";

import { SettingsIcon } from "./icons";
import { InspectorHeader } from "./InspectorHeader";
import { type ParameterItemProps } from "./ParameterItem";
import { ParameterItemButton } from "./ParameterItemButton";

const Content = styled("div")(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginLeft: theme.spacing(1),
}));

export interface GroupedParameterItemProps
  extends Pick<ParameterItemProps, "label" | "labelFontSize" | "description"> {
  content?: ReactNode;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export type GroupedParameterItemRef = {
  closePopover: () => void;
};

export const GroupedParameterItem = forwardRef<GroupedParameterItemRef, GroupedParameterItemProps>(
  ({ label, labelFontSize, description, content, onClick, children }, ref) => {
    const id = useId();
    const popupState = usePopupState({
      variant: "popover",
      popupId: id,
    });
    const { onClick: onClickForPopup, ...popupTriggers } = bindTrigger(popupState);

    const handleClick: MouseEventHandler<HTMLDivElement> = e => {
      onClick?.(e);
      onClickForPopup(e);
    };

    useImperativeHandle(ref, () => ({ closePopover: popupState.close }), [popupState]);

    const theme = useTheme();
    return (
      <>
        <ParameterItemButton
          ref={anchorRef(popupState)}
          label={label}
          labelFontSize={labelFontSize}
          description={description}
          icon={<SettingsIcon />}
          onClick={handleClick}
          {...popupTriggers}
        />
        <Content>{content}</Content>
        <Popover
          {...bindPopover(popupState)}
          anchorOrigin={{
            horizontal: parseFloat(theme.spacing(-1)),
            vertical: "top",
          }}
          transformOrigin={{
            horizontal: "right",
            vertical: "top",
          }}>
          <InspectorHeader title={label} onClose={popupState.close} />
          <Divider />
          {children}
        </Popover>
      </>
    );
  },
);
