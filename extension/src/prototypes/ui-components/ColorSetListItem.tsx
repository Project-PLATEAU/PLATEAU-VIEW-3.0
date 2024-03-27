import { IconButton, ListItem, Popover, Stack, styled, Typography } from "@mui/material";
import { useAtom, type PrimitiveAtom } from "jotai";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useCallback, useId, useRef, useState, type FC, useMemo, useEffect } from "react";
import { ChromePicker, type ColorChangeHandler } from "react-color";

import { type QualitativeColor } from "../datasets";

import { ColorIcon } from "./ColorIcon";

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  // Increase specificity
  "&&": {
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(-1),
    marginLeft: theme.spacing(-1),
  },
}));

const CenterColorButton = styled("div")(({ color }: { color: string }) => ({
  position: "absolute",
  width: 10,
  height: 10,
  top: "50%",
  left: 3,
  transform: "translateY(-5px)",
  cursor: "pointer",
  backgroundColor: color,
}));

const IconButtonWrapper = styled("div")(() => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export interface ColorSetListItemProps {
  colorAtom: PrimitiveAtom<QualitativeColor>;
  continuous?: boolean;
  onChange?: () => void;
}

export const ColorSetListItem: FC<ColorSetListItemProps> = ({
  colorAtom,
  continuous = false,
  onChange,
}) => {
  const id = useId();
  const popupState = usePopupState({
    variant: "popover",
    popupId: id,
  });
  const popoverProps = bindPopover(popupState);

  const strokeid = useId();
  const strokePopupState = usePopupState({
    variant: "popover",
    popupId: strokeid,
  });
  const strokePopoverProps = bindPopover(strokePopupState);

  const [color, setColor] = useAtom(colorAtom);
  const [indeterminateColor, setIndeterminateColor] = useState(color.color);
  const [indeterminateStrokeColor, setIndeterminateStrokeColor] = useState(
    color.strokeColor === "" ? color.color : color.strokeColor ?? "",
  );

  useEffect(() => {
    if (color) {
      setIndeterminateColor(color.color);
      setIndeterminateStrokeColor(color.strokeColor === "" ? color.color : color.strokeColor ?? "");
    }
  }, [color]);

  const hasStroke = useMemo(() => "strokeColor" in color, [color]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleChange: ColorChangeHandler = useCallback(
    result => {
      setIndeterminateColor(result.hex);
      if (continuous) {
        setColor(color => ({
          ...color,
          color: result.hex,
        }));
        onChangeRef.current?.();
      }
    },
    [continuous, setColor],
  );

  const handleChangeComplete: ColorChangeHandler = useCallback(
    result => {
      setColor(color => ({
        ...color,
        color: result.hex,
      }));
      onChangeRef.current?.();
    },
    [setColor],
  );

  const handleStrokeChange: ColorChangeHandler = useCallback(
    result => {
      setIndeterminateStrokeColor(result.hex);
      if (continuous) {
        setColor(color => ({
          ...color,
          strokeColor: result.hex,
        }));
        onChangeRef.current?.();
      }
    },
    [continuous, setColor],
  );

  const handleStrokeChangeComplete: ColorChangeHandler = useCallback(
    result => {
      setColor(color => ({
        ...color,
        strokeColor: result.hex,
      }));
      onChangeRef.current?.();
    },
    [setColor],
  );

  return (
    <>
      <ListItem disableGutters>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButtonWrapper>
            {hasStroke ? (
              <>
                <StyledIconButton {...bindTrigger(strokePopupState)}>
                  <ColorIcon color="transparent" strokeColor={indeterminateStrokeColor} />
                </StyledIconButton>
                <CenterColorButton {...bindTrigger(popupState)} color={indeterminateColor} />
              </>
            ) : (
              <StyledIconButton {...bindTrigger(popupState)}>
                <ColorIcon color={indeterminateColor} />
              </StyledIconButton>
            )}
          </IconButtonWrapper>
          <Typography variant="body2">{color.name}</Typography>
        </Stack>
      </ListItem>
      <Popover
        {...popoverProps}
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        transformOrigin={{
          horizontal: "center",
          vertical: "top",
        }}>
        <ChromePicker
          color={indeterminateColor}
          disableAlpha
          onChange={handleChange}
          onChangeComplete={handleChangeComplete}
        />
      </Popover>

      <Popover
        {...strokePopoverProps}
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        transformOrigin={{
          horizontal: "center",
          vertical: "top",
        }}>
        <ChromePicker
          color={indeterminateStrokeColor}
          disableAlpha
          onChange={handleStrokeChange}
          onChangeComplete={handleStrokeChangeComplete}
        />
      </Popover>
    </>
  );
};
