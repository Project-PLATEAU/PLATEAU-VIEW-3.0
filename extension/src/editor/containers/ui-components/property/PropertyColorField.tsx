import { styled } from "@mui/material";
import { useCallback, useRef, useState } from "react";
import { ChromePicker } from "react-color";

import { EditorClickAwayListener } from "../../common/EditorClickAwayListener";
import { EditorPopper } from "../editor";

import { PropertyInputField } from "./PropertyInputField";

type PropertyColorFieldProps = {
  value?: string;
  disableAlpha?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
};

export const PropertyColorField: React.FC<PropertyColorFieldProps> = ({
  value = "",
  disableAlpha = true,
  placeholder = "#FFFFFF",
  onChange,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleChange = (color: any) => {
    const alphaHex = color.rgb.a !== 1 ? Math.round(color.rgb.a * 255).toString(16) : "";
    onChange(`${color.hex}${alphaHex}`);
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const togglePickerOpen = useCallback(() => {
    setPickerOpen(prevOpen => !prevOpen);
  }, []);
  const closePicker = useCallback(() => {
    setPickerOpen(false);
  }, []);

  return (
    <EditorClickAwayListener onClickAway={closePicker}>
      <Wrapper>
        <ColorButton color={value ?? ""} ref={anchorRef} onClick={togglePickerOpen} />
        <PropertyInputField placeholder={placeholder} value={value} onChange={handleInputChange} />
        <EditorPopper open={pickerOpen} anchorEl={anchorRef.current}>
          <ChromePicker
            color={value}
            disableAlpha={disableAlpha}
            onChange={handleChange}
            onChangeComplete={handleChange}
          />
        </EditorPopper>
      </Wrapper>
    </EditorClickAwayListener>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
}));

const ColorButton = styled("div")<{ color: string }>(({ theme, color }) => ({
  width: "25.88px",
  height: "25.88px",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  cursor: "pointer",
  backgroundColor: color,
  flexShrink: 0,
}));
