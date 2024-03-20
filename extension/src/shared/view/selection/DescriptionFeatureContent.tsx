import { styled, useTheme } from "@mui/material";
import { useAtomValue } from "jotai";
import React, { useCallback, useContext, useLayoutEffect, useRef } from "react";

import { AppOverlayLayoutContext } from "../../../prototypes/ui-components";

export type Props = {
  html?: string;
  additionalHeight?: number;
};

export const DescriptionFeatureContent: React.FC<Props> = ({ html, additionalHeight = 0 }) => {
  const theme = useTheme();

  // iframe
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const initializeIframe = useCallback(() => {
    const frame = frameRef.current;
    const frameDocument = frame?.contentDocument;
    const frameWindow = frame?.contentWindow;
    if (!frameWindow || !frameDocument) {
      return;
    }

    if (!frameDocument.body.innerHTML.length) {
      // `document.write()` is not recommended API by HTML spec,
      // but we need to use this API to make it work correctly on Safari.
      // If Safari supports `onLoad` event with `srcDoc`, we can remove this line.
      frameDocument.write(html || "");
    }

    // Initialize styles
    frameWindow.document.documentElement.style.margin = "0";

    // Check if a style element has already been appended to the head
    let style: HTMLElement | null = frameWindow.document.querySelector(
      'style[data-id="plateau-iframe-style"]',
    );
    if (!style) {
      // Create a new style element if it doesn't exist
      style = frameWindow.document.createElement("style");
      style.dataset.id = "plateau-iframe-style";
      frameWindow.document.head.append(style);
    }
    // Update the content of the existing or new style element
    style.textContent = `
    html { font-size: 16px }
    body, body * { margin: 0; color:${
      theme.typography.body2.color ?? getComputedStyle(frame).color
    }; 
    font-family: ${theme.typography.body2.fontFamily ?? getComputedStyle(frame).fontFamily};
    font-size: ${theme.typography.body2.fontSize}; } 
    table { width: 100%; border-collapse: collapse;
    }
    tr{
      border-bottom: 1px solid #e0e0e0;
    }
    th { color: #00000073;}
    td, th { 
    line-height: 1.5rem;
    text-align: left;
    padding: 6px 16px;
    border-spacing: 0;
    width: 50%;
    }
    tr:last-child{
      border-bottom: none;
    }
    a { color:${theme.typography.body2.color ?? getComputedStyle(frame).color};}`;

    const resize = () => {
      const height = frameWindow.document.documentElement.scrollHeight;
      frame.style.height = `${height}px`;
    };

    // Resize
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(frameWindow.document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }, [frameRef, html, theme]);

  useLayoutEffect(() => initializeIframe(), [initializeIframe]);

  const { gridHeightAtom } = useContext(AppOverlayLayoutContext);
  const gridHeight = useAtomValue(gridHeightAtom);

  return (
    <Wrapper style={{ maxHeight: gridHeight - additionalHeight }}>
      <IFrame
        key={html}
        ref={frameRef}
        frameBorder="0"
        scrolling="no"
        allowFullScreen
        sandbox="allow-same-origin allow-popups allow-forms"
      />
    </Wrapper>
  );
};

const Wrapper = styled("div")`
  overflow: auto;
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
  padding: 5px;
`;

const IFrame = styled("iframe")`
  display: block;
  border: none;
  height: 15px;
  width: 100%;
  min-width: 100%;
`;
