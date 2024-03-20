import styled from "@emotion/styled";
import { useCallback } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import { Integration } from "@reearth-cms/components/molecules/MyIntegrations/types";

type Props = {
  integration: Integration;
  onIntegrationNavigate: (integration: Integration) => void;
};

const MyIntegrationCard: React.FC<Props> = ({ integration, onIntegrationNavigate }) => {
  const onCardClick = useCallback(() => {
    onIntegrationNavigate(integration);
  }, [integration, onIntegrationNavigate]);

  return (
    <CardWrapper>
      <Card onClick={onCardClick}>
        <Icon icon="api" size={40} color="#00000040" />
        <CardTitle>{integration.name}</CardTitle>
        <CardSubTitle>{integration.description}</CardSubTitle>
      </Card>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  padding: 12px;
`;

const Card = styled.div`
  height: 180px;
  width: 240px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  border: 1px solid #d9d9d9;
  box-shadow: 0px 2px 8px #00000026;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const CardTitle = styled.h5`
  width: 100%;
  margin-top: 22px;
  margin-bottom: 4px;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #000000d9;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const CardSubTitle = styled.h6`
  margin: 0;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: #00000073;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

export default MyIntegrationCard;
