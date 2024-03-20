import { styled } from "@mui/material";
import EasyMDE from "easymde";
import { FC, useEffect, useRef } from "react";

import easyMDEStyle from "../lib/easyMDEStyles.css?inline";

type ViewMarkdownEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export const ViewMarkdownEditor: FC<ViewMarkdownEditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const easyMDE = useRef<EasyMDE | null>(null);

  const initialValueRef = useRef(value);
  initialValueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (textareaRef.current) {
      easyMDE.current = new EasyMDE({
        element: textareaRef.current,
        maxHeight: "200px",
        status: false,
        hideIcons: ["fullscreen", "side-by-side", "guide"],
        initialValue: initialValueRef.current,
      });

      easyMDE.current.codemirror.on("change", () => {
        onChangeRef.current?.(easyMDE.current?.value() ?? "");
      });
    }

    return () => {
      if (easyMDE.current) {
        easyMDE.current.toTextArea();
        easyMDE.current = null;
      }
    };
  }, [initialValueRef]);

  return (
    <Wrapper>
      <textarea ref={textareaRef} />
    </Wrapper>
  );
};

const Wrapper = styled("div")`
  position: relative;
  box-sizing: border-box;

  ${easyMDEStyle}

  .EasyMDEContainer {
    .editor-toolbar {
      padding: 0;
      border-color: ${({ theme }) => theme.palette.divider};
      border-radius: ${({ theme }) =>
        `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`};
    }
    .editor-toolbar button {
      border: none;
    }
    .editor-toolbar button.active,
    .editor-toolbar button:hover {
      background: ${({ theme }) => theme.palette.action.hover};
    }
    .CodeMirror {
      border-color: ${({ theme }) => theme.palette.divider};
      border-radius: ${({ theme }) =>
        `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`};
      padding: ${({ theme }) => theme.spacing(1)};
      font-size: ${({ theme }) => theme.typography.body2.fontSize};
    }
    .CodeMirror .cm-spell-error:not(.cm-url):not(.cm-comment):not(.cm-tag):not(.cm-word) {
      background: none;
    }
    .CodeMirror-scroll {
      box-sizing: border-box;
    }
    .CodeMirror-lines {
      padding: 0;
    }
    .editor-preview {
      padding: ${({ theme }) => theme.spacing(1)};

      img,
      video {
        max-width: 100%;
      }
    }

    /* font-styles */
    .cm-header-1,
    .editor-preview h1 {
      font-size: ${({ theme }) => theme.typography.h1.fontSize};
      line-height: ${({ theme }) => theme.typography.h1.lineHeight};
      margin: 0;
    }
    .cm-header-2,
    .editor-preview h2 {
      font-size: ${({ theme }) => theme.typography.h2.fontSize};
      line-height: ${({ theme }) => theme.typography.h2.lineHeight};
      margin: 0;
    }
    .cm-header-3,
    .editor-preview h3 {
      font-size: ${({ theme }) => theme.typography.h3.fontSize};
      line-height: ${({ theme }) => theme.typography.h3.lineHeight};
      margin: 0;
    }
    .cm-header-4,
    .editor-preview h4 {
      font-size: ${({ theme }) => theme.typography.h4.fontSize};
      line-height: ${({ theme }) => theme.typography.h4.lineHeight};
      margin: 0;
    }
    .cm-header-5,
    .editor-preview h5 {
      font-size: ${({ theme }) => theme.typography.h5.fontSize};
      line-height: ${({ theme }) => theme.typography.h5.lineHeight};
      margin: 0;
    }
    .cm-header-6,
    .editor-preview h6 {
      font-size: ${({ theme }) => theme.typography.h6.fontSize};
      line-height: ${({ theme }) => theme.typography.h6.lineHeight};
      margin: 0;
    }
  }
`;
