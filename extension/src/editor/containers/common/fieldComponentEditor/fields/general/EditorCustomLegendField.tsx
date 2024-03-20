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
  PropertyButton,
  PropertyInfo,
  PropertyInlineWrapper,
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

export type CustomLegendFieldPreset = {
  code?: string;
};

export const EditorCustomLegendField: React.FC<BasicFieldProps<"CUSTOM_LEGEND_FIELD">> = ({
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

  const handleApplyTemplate = useCallback(() => {
    handleCodeChange(TEMPLATE_CODE);
  }, [handleCodeChange]);

  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyButton onClick={handleApplyTemplate}>Fill with Template</PropertyButton>
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
        <PropertyInfo>
          Plasese Don&apos;t use this together with other color components.
        </PropertyInfo>
      </PropertyBox>
      <EditorDialog
        title="Custom Legend Editor"
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

type CustomLegendType = "square" | "circle" | "line" | "icon";

type CustomLegendItem = {
  type?: CustomLegendType;
  title?: string;
  color?: string;
  strokeColor?: string;
  url?: string;
};

export type CustomLegends = {
  type?: CustomLegendType;
  name?: string;
  legends?: CustomLegendItem[];
};

const TEMPLATE_CODE = `{
    "type": "square",
    "name": "Legend of types",
    "legends": [
        {
            "title": "square-1",
            "color": "#00FF99"
        },
        {
            "title": "square-2",
            "color": "#FF9900",
            "strokeColor": "#FF0000"
        },
        {
            "title": "circle-1",
            "color": "#0099FF",
            "type": "circle"
        },
        {
            "title": "circle-2",
            "color": "#99FF00",
            "strokeColor": "#9900FF",
            "type": "circle"
        },
        {
            "title": "line-1",
            "strokeColor": "#FF0099",
            "type": "line"
        },
        {
            "title": "line-2",
            "strokeColor": "#00FFFF",
            "type": "line"
        },
        {
            "title": "icon-1",
            "url": "https://assets.cms.plateau.reearth.io/assets/ac/1bee01-4080-4ee4-9cdb-58e755e26648/legend_circle.png",
            "color": "#FFFF00",
            "type": "icon"
        },
        {
            "title": "icon-2",
            "url": "https://assets.cms.plateau.reearth.io/assets/ac/1bee01-4080-4ee4-9cdb-58e755e26648/legend_circle.png",
            "color": "#FF00FF",
            "type": "icon"
        }
    ]
}`;
