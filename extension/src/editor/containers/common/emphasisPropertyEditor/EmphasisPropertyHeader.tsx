import { styled } from "@mui/material";

import {
  IconWrapper,
  PropertyItemWrapper,
  VisibleWrapper,
  NameWrapper,
  PathWrapper,
  ProcessWrapper,
} from "./EmphasisPropertyItem";

export const EmphasisPropertyHeader: React.FC = () => {
  return (
    <StyledPropertyItemWrapper>
      <IconWrapper />
      <VisibleWrapper />
      <PathWrapper>JSON Path</PathWrapper>
      <NameWrapper>Display Name</NameWrapper>
      <ProcessWrapper>Process</ProcessWrapper>
      <IconWrapper />
    </StyledPropertyItemWrapper>
  );
};

const StyledPropertyItemWrapper = styled(PropertyItemWrapper)(() => ({
  fontSize: "11px",
}));
