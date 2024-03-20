import {
  buttonClasses,
  iconButtonClasses,
  AppBar as MuiAppBar,
  styled,
  Toolbar,
  toolbarClasses,
  Button,
  type AppBarProps as MuiAppBarProps,
  Stack,
  Typography,
} from "@mui/material";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { forwardRef, useId, useMemo, useCallback, FC, MouseEvent } from "react";

import { DarkThemeOverride } from "../../../../prototypes/ui-components/DarkThemeOverride";
import { FloatingPanel } from "../../../../prototypes/ui-components/FloatingPanel";
import { DropDownIcon } from "../../../../prototypes/ui-components/icons";
import { OverlayPopper } from "../../../../prototypes/ui-components/OverlayPopper";
import { SelectItem, SelectItemProps } from "../../../../prototypes/ui-components/SelectItem";

const StyledEditorBar = styled(MuiAppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  maxWidth: "100%",
  width: "583px",
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  [`&.${toolbarClasses.root}`]: {
    paddingRight: theme.spacing(1),
    paddingLeft: 0,
    minHeight: theme.spacing(6),
  },
  [`& .${iconButtonClasses.root}`]: {
    minHeight: theme.spacing(5),
    minWidth: theme.spacing(6),
  },
}));

const DropDownWrapper = styled("div")`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled(Button)(({ theme }) => ({
  ...theme.typography.body2,
  position: "relative",
  height: theme.spacing(5),
  fontWeight: 500,
  transition: theme.transitions.create("background-color", {
    duration: theme.transitions.duration.short,
  }),
  color: theme.palette.text.primary,
  [`&.${buttonClasses.disabled}`]: {
    color: theme.palette.text.secondary,
  },
  paddingRight: 0,
}));

const DropDown = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.text.secondary,
  fontSize: 20,
}));

const StyledSelectItem = styled(SelectItem)(({ theme }) => ({
  "&:first-of-type": {
    marginTop: theme.spacing(1),
  },
  "&:last-of-type": {
    marginBottom: theme.spacing(1),
  },
  [theme.breakpoints.up("mobile")]: {
    minHeight: "auto",
  },
})) as typeof SelectItem;

interface EditorTypeSelectItem {
  value: string;
  title: string;
}

const Item: FC<SelectItemProps & EditorTypeSelectItem> = ({ title, ...props }) => (
  <StyledSelectItem {...props}>
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body1">{title}</Typography>
    </Stack>
  </StyledSelectItem>
);

export type EditorBarProps = MuiAppBarProps & {
  editorType: string;
  editorTypes: { title: string; value: string }[];
  onEditorTypeChange: (editorType: string) => void;
};

export const EditorBar = forwardRef<HTMLDivElement, EditorBarProps>(
  ({ editorTypes, editorType, onEditorTypeChange, ...props }, ref) => {
    const currentEditorTitle = useMemo(
      () => editorTypes.find(e => e.value === editorType)?.title,
      [editorType, editorTypes],
    );

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
      (event: MouseEvent) => {
        const value = event.currentTarget?.getAttribute("value");
        if (value != null) {
          onEditorTypeChange?.(value);
          close();
        }
      },
      [close, onEditorTypeChange],
    );

    return (
      <DarkThemeOverride>
        <StyledEditorBar ref={ref} position="static" elevation={0} {...props}>
          <StyledToolbar>
            <StyledButton variant="text" onClick={handleClick}>
              <DropDownWrapper>
                {currentEditorTitle}
                <DropDown>
                  <DropDownIcon fontSize="inherit" />
                </DropDown>
              </DropDownWrapper>
            </StyledButton>
            <OverlayPopper {...popoverProps} inset={1.5}>
              <FloatingPanel>
                {editorTypes.map(item => (
                  <Item
                    key={item.value}
                    {...item}
                    selected={item.value === editorType}
                    onClick={handleItemClick}
                  />
                ))}
              </FloatingPanel>
            </OverlayPopper>
          </StyledToolbar>
        </StyledEditorBar>
      </DarkThemeOverride>
    );
  },
);
