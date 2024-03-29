import { styled } from "@mui/material";
import { FC } from "react";
import Markdown from "react-markdown";

type ViewMarkdownViewerProps = {
  content: string | undefined;
};

export const ViewMarkdownViewer: FC<ViewMarkdownViewerProps> = ({ content }) => {
  return (
    <StyledMarkdown skipHtml components={{ a: LinkRenderer }}>
      {content}
    </StyledMarkdown>
  );
};

const StyledMarkdown = styled(Markdown)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  [`img, video`]: {
    maxWidth: "100%",
  },
  [`h1`]: {
    fontSize: theme.typography.h1.fontSize,
    lineHeight: theme.typography.h1.lineHeight,
    margin: 0,
  },
  [`h2`]: {
    fontSize: theme.typography.h2.fontSize,
    lineHeight: theme.typography.h2.lineHeight,
    margin: 0,
  },
  [`h3`]: {
    fontSize: theme.typography.h3.fontSize,
    lineHeight: theme.typography.h3.lineHeight,
    margin: 0,
  },
  [`h4`]: {
    fontSize: theme.typography.h4.fontSize,
    lineHeight: theme.typography.h4.lineHeight,
    margin: 0,
  },
  [`h5`]: {
    fontSize: theme.typography.h5.fontSize,
    lineHeight: theme.typography.h5.lineHeight,
    margin: 0,
  },
  [`h6`]: {
    fontSize: theme.typography.h6.fontSize,
    lineHeight: theme.typography.h6.lineHeight,
    margin: 0,
  },
}));

function LinkRenderer(props: any) {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}
