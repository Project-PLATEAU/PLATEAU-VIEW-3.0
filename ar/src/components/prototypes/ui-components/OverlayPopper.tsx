import { ClickAwayListener, Popper, styled, useTheme, type PopperProps } from "@mui/material";
import { omit } from "lodash";
import { useCallback, useState, type FC, type ReactNode } from "react";

import { Z_INDEX_WAS } from "../../shared/reearth/constants/style";
import { isNotFalse } from "../type-helpers";

const Arrow = styled("div")(({ theme }) => {
  const hypotenuse = `${1 / Math.SQRT2}em`;
  return {
    overflow: "hidden",
    position: "absolute",
    width: "1em",
    height: hypotenuse,
    boxSizing: "border-box",
    color: theme.palette.background.paper,
    "&::before": {
      content: '""',
      margin: "auto",
      display: "block",
      width: "100%",
      height: "100%",
      backgroundColor: "currentColor",
      transform: "rotate(45deg)",
    },
    '[data-popper-placement="top"] &': {
      bottom: 0,
      left: "50%",
      marginBottom: `-${hypotenuse}`,
      "&::before": {
        transformOrigin: "100% 0",
      },
    },
    '[data-popper-placement="right"] &': {
      top: "50%",
      left: 0,
      marginLeft: `-${hypotenuse}`,
      height: "1em",
      width: hypotenuse,
      "&::before": {
        transformOrigin: "100% 100%",
      },
    },
    '[data-popper-placement="bottom"] &': {
      top: 0,
      left: "50%",
      marginTop: `-${hypotenuse}`,
      "&::before": {
        transformOrigin: "0 100%",
      },
    },
    '[data-popper-placement="left"] &': {
      top: "50%",
      right: 0,
      marginRight: `-${hypotenuse}`,
      height: "1em",
      width: hypotenuse,
      "&::before": {
        transformOrigin: "0 0",
      },
    },
    "[data-popper-reference-hidden] &": {
      visibility: "hidden",
    },
  };
});

export interface OverlayPopperProps extends PopperProps {
  arrow?: boolean;
  pinned?: boolean;
  inset?: number;
  onClose?: () => void;
  children?: ReactNode;
}

export const OverlayPopper: FC<OverlayPopperProps> = ({
  arrow = true,
  pinned = false,
  inset = 1,
  onClose,
  children,
  ...props
}) => {
  const handleClickAway = useCallback(() => {
    if (!pinned) {
      // ReEarth Editor uses react-dnd, but it occupies the events of document.
      // So we need to invoke this after the process of react-dnd.
      // The process is delayed depends on the `delay` option.
      // https://github.com/react-dnd/react-dnd/blob/7c88c37489a53b5ac98699c46a506a8e085f1c03/packages/docsite/markdown/docs/05%20Backends/Touch.md?plain=1#L49
      setTimeout(() => {
        onClose?.();
      }, 0);
    }
  }, [onClose, pinned]);

  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

  const theme = useTheme();
  return (
    <Popper
      style={{ zIndex: Z_INDEX_WAS }}
      // WORKAROUND: Accept popover props.
      {...(omit(props, ["anchorPosition", "anchorReference"]) as PopperProps)}
      modifiers={[
        {
          name: "offset",
          enabled: true,
          options: {
            offset: [0, parseFloat(theme.spacing(inset))],
          },
        },
        arrow && {
          name: "arrow",
          enabled: true,
          options: {
            padding: theme.shape.borderRadius + parseFloat(theme.spacing(inset)),
            element: arrowRef,
          },
        },
      ].filter(isNotFalse)}>
      <ClickAwayListener
        mouseEvent="onMouseUp"
        touchEvent="onTouchEnd"
        onClickAway={handleClickAway}>
        <div>
          {children}
          {arrow && <Arrow ref={setArrowRef} />}
        </div>
      </ClickAwayListener>
    </Popper>
  );
};
