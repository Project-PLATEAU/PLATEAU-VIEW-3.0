import styled from "@emotion/styled";
import { ReactNode } from "react";

export type Props = {
  children: ReactNode;
};

const ModelListBody: React.FC<Props> = ({ children }) => {
  return <Container>{children}</Container>;
};

export default ModelListBody;

const Container = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100% - 70px);
`;
