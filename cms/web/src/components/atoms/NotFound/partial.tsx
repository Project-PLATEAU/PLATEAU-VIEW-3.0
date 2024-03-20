import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import { useT } from "@reearth-cms/i18n";

const NotFound: React.FC = () => {
  const t = useT();

  return (
    <Wrapper>
      <Circle>404</Circle>
      <Content>
        <StyledTitle>{t("Oops!")}</StyledTitle>
        <StyledText>{t("ITEM NOT FOUND ON SERVER")}</StyledText>
        <Button href="/" type="primary">
          {t("Go back Home")}
        </Button>
      </Content>
    </Wrapper>
  );
};

export default NotFound;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #fff;
`;

const Circle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 96px;
  color: #bfbfbf;
  font-weight: 700;
  background-color: #d9d9d9;
  width: 240px;
  height: 240px;
  border-radius: 50%;
`;

const Content = styled.div`
  padding-top: 48px;
  text-align: center;
`;

const StyledTitle = styled.p`
  color: #1890ff;
  font-weight: 500;
  font-size: 38px;
  margin-bottom: 24px;
`;

const StyledText = styled.p`
  font-weight: 500;
  font-size: 16px;
  color: #00000073;
  margin-bottom: 24px;
`;
