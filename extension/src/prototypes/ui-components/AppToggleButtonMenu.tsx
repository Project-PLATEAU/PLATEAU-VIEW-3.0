import {
  alpha,
  IconButton,
  listItemIconClasses,
  MenuItem,
  type MenuItemProps,
  Stack,
  styled,
  svgIconClasses,
  Typography,
} from "@mui/material";
import { anchorRef, bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useCallback, useId, type FC, type MouseEvent, type ReactNode } from "react";

import { AppToggleButton, type AppToggleButtonProps } from "./AppToggleButton";
import { FloatingPanel } from "./FloatingPanel";
import { DropDownIcon } from "./icons";
import { OverlayPopper } from "./OverlayPopper";

const StyledButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(-1.5),
  marginLeft: -2,
  padding: 0,
  color: alpha(theme.palette.text.primary, 0.5),
  "&&": {
    minWidth: 0,
  },
  "&:hover": {
    color: theme.palette.text.primary,
    backgroundColor: "transparent",
  },
}));

const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: prop => prop !== "indent",
})<{
  indent: number;
}>(({ theme, indent }) => ({
  paddingLeft: theme.spacing(1 + indent * 2),
  paddingRight: theme.spacing(3),
  [`& .${listItemIconClasses.root}`]: {
    marginRight: theme.spacing(0.5),
    [`& .${svgIconClasses.root}`]: {
      fontSize: 16,
    },
  },
  "&:first-of-type": {
    marginTop: theme.spacing(1),
  },
  "&:last-of-type": {
    marginBottom: theme.spacing(1),
  },
  minHeight: "auto",
}));

export interface AppToggleButtonMenuItem {
  title: string;
  icon: ReactNode;
  onClick?: () => void;
}

const Item: FC<
  MenuItemProps &
    AppToggleButtonMenuItem & {
      indent: number;
    }
> = ({ title, icon, ...props }) => (
  <StyledMenuItem {...props}>
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography variant="body1">{title}</Typography>
    </Stack>
  </StyledMenuItem>
);

export interface AppToggleButtonMenuProps extends AppToggleButtonProps {
  items: AppToggleButtonMenuItem[];
}

export const AppToggleButtonMenu: FC<AppToggleButtonMenuProps> = ({
  items,
  children,
  ...props
}) => {
  const id = useId();
  const popupState = usePopupState({
    variant: "popover",
    popupId: id,
  });
  const buttonProps = bindTrigger(popupState);
  const popoverProps = bindPopover(popupState);

  const { onClick } = buttonProps;
  const handleClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onClick(event);
    },
    [onClick],
  );

  const { close } = popupState;
  const handleItemClick = useCallback(
    (index: number) => {
      items[index].onClick?.();
      close();
    },
    [items, close],
  );

  return (
    <>
      <AppToggleButton
        {...props}
        component="div"
        title={!popoverProps.open ? props.title : undefined}
        ref={anchorRef(popupState)}>
        {children}
        <StyledButton {...bindTrigger(popupState)} onClick={handleClick}>
          <DropDownIcon />
        </StyledButton>
      </AppToggleButton>
      <OverlayPopper {...popoverProps} inset={1.5}>
        <FloatingPanel>
          {items.map((item, index) => (
            <Item
              key={index}
              {...item}
              indent={1}
              onClick={() => {
                handleItemClick(index);
              }}
            />
          ))}
        </FloatingPanel>
      </OverlayPopper>
    </>
  );
};
