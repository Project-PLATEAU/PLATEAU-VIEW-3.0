import MonacoEditor from "@monaco-editor/react";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { styled, svgIconClasses } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BasicFieldProps } from "..";
import {
  EditorDialog,
  PropertyBox,
  PropertyInlineWrapper,
  PropertyInputField,
  PropertySwitchField,
  PropertyWrapper,
} from "../../../../ui-components";

const options = {
  bracketPairColorization: {
    enabled: true,
  },
  automaticLayout: true,
  minimap: {
    enabled: false,
  },
  selectOnLineNumbers: true,
  fontSize: 12,
};

export type StyleCodeFieldPreset = {
  code?: string;
  enableTransparencySlider?: boolean;
  defaultOpacity?: number;
};

export const EditorStyleCodeField: React.FC<BasicFieldProps<"STYLE_CODE_FIELD">> = ({
  component,
  onUpdate,
}) => {
  const code = useMemo(() => component.preset?.code ?? "", [component.preset?.code]);
  const [codeValid, setCodeValid] = useState<boolean | undefined>();

  useEffect(() => {
    try {
      JSON.parse(code);
      setCodeValid(true);
    } catch (error) {
      setCodeValid(false);
    }
  }, [code]);

  const handleCodeChange = useCallback(
    (code: string | undefined) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          code,
        },
      });
    },
    [component, onUpdate],
  );

  const handleEnableTransparencySliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({
        ...component,
        preset: {
          ...component.preset,
          enableTransparencySlider: !!e.target.checked,
        },
      });
    },
    [component, onUpdate],
  );

  const [localOpacity, setLocalOpacity] = useState(component.preset?.defaultOpacity ?? "1");

  const handleLocalOpacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalOpacity(e.target.value);
  }, []);

  useEffect(() => {
    const numberValue = Number(localOpacity);
    if (
      isNaN(numberValue) ||
      numberValue > 1 ||
      numberValue < 0 ||
      numberValue === component.preset?.defaultOpacity
    )
      return;

    onUpdate?.({
      ...component,
      preset: {
        ...component.preset,
        defaultOpacity: numberValue,
      },
    });
  }, [localOpacity, component, onUpdate]);

  const [fullsizeEditorOpen, setFullsizeEditorOpen] = useState(false);
  const openFullsizeEditor = useCallback(() => {
    setEditorCode(code);
    setFullsizeEditorOpen(true);
  }, [code]);
  const closeFullsizeEditor = useCallback(() => {
    setFullsizeEditorOpen(false);
  }, []);

  const [editorCode, setEditorCode] = useState<string | undefined>(code);
  useEffect(() => {
    setEditorCode(code);
  }, [code]);
  const handleEditorCodeChange = useCallback(
    (code: string | undefined) => {
      setEditorCode(code);
    },
    [setEditorCode],
  );
  const submitEditorCode = useCallback(() => {
    handleCodeChange(editorCode);
    closeFullsizeEditor();
  }, [handleCodeChange, editorCode, closeFullsizeEditor]);

  return (
    <PropertyWrapper>
      <PropertyBox>
        <CodeEditorWrapper>
          <StyledMonacoEditor
            language="json"
            value={code}
            options={options}
            onChange={handleCodeChange}
          />
        </CodeEditorWrapper>
        <PropertyInlineWrapper label="">
          <Tools>
            <Tool valid={codeValid ? 1 : 0}>
              {codeValid ? <CheckOutlinedIcon /> : <ErrorOutlineOutlinedIcon />}JSON
            </Tool>
            <Tool valid={1} clickable={1} onClick={openFullsizeEditor}>
              <OpenInFullIcon />
            </Tool>
          </Tools>
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Transparency Bar">
          <PropertySwitchField
            checked={!!component.preset?.enableTransparencySlider}
            onChange={handleEnableTransparencySliderChange}
          />
        </PropertyInlineWrapper>
        <PropertyInlineWrapper label="Default Opacity">
          <PropertyInputField
            value={localOpacity}
            placeholder="0 ~ 1"
            onChange={handleLocalOpacityChange}
          />
        </PropertyInlineWrapper>
      </PropertyBox>
      <EditorDialog
        title="Style code editor"
        open={fullsizeEditorOpen}
        fullWidth
        onClose={closeFullsizeEditor}
        onSubmit={submitEditorCode}>
        <MonacoEditor
          language="json"
          height={"80vh"}
          value={editorCode}
          options={options}
          onChange={handleEditorCodeChange}
        />
      </EditorDialog>
    </PropertyWrapper>
  );
};

const CodeEditorWrapper = styled("div")({
  position: "relative",
  height: 200,
  width: "100%",
});

const Tools = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
  alignItems: "center",
  justifyContent: "flex-end",
}));

const Tool = styled("div")<{ valid: number; clickable?: number }>(
  ({ valid, clickable, theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(0.5),
    color: "#fff",
    fontSize: "11px",
    padding: theme.spacing(0.2, 0.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: valid ? theme.palette.success.light : theme.palette.error.light,
    opacity: 0.5,
    cursor: clickable ? "pointer" : "default",

    [`& .${svgIconClasses.root}`]: {
      fontSize: 16,
    },
  }),
);

const StyledMonacoEditor = styled(MonacoEditor)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
}));
