import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";

export type FormValues = {
  items: string[];
};

export type Props = {
  text: string;
};

const WarningText: React.FC<Props> = ({ text }) => {
  return (
    <RequestWarning>
      <Icon icon="exclamationCircle" />
      <p>{text}</p>
    </RequestWarning>
  );
};

const RequestWarning = styled.div`
  .anticon {
    float: left;
    margin-right: 8px;
    font-size: 16px;
    color: #faad14;
  }
  p {
    display: block;
    overflow: hidden;
    color: #000000d9;
    font-weight: 500;
    font-size: 14px;
    line-height: 1.4;
    margin-top: 2px;
  }
`;

export default WarningText;
