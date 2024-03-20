import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

const ViewerNotSupported: React.FC = () => {
  const t = useT();
  return (
    <ViewerNotSupportedContainer>
      <ViewerNotSupportedWrapper>
        <StyledIcon icon="exclamationCircle" />
        <ViewerNotSupportedText>{t("Not supported")}</ViewerNotSupportedText>
      </ViewerNotSupportedWrapper>
    </ViewerNotSupportedContainer>
  );
};

const ViewerNotSupportedContainer = styled.div`
  height: 240px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
`;

const ViewerNotSupportedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  alignitems: center;
`;

const ViewerNotSupportedText = styled.span`
  font-family: Roboto;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
`;

const StyledIcon = styled(Icon)`
  margin-bottom: 10px;
`;

export default ViewerNotSupported;
