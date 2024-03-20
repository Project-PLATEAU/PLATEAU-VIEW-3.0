import styled from "@emotion/styled";

import Tag from "@reearth-cms/components/atoms/Tag";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  title: string;
  isUnique: boolean;
  isTitle: boolean;
};

const FieldTitle: React.FC<Props> = ({ title, isUnique, isTitle }) => {
  const t = useT();

  return (
    <Title>
      <div>
        {title}
        {isUnique ? <FieldUnique>({t("unique")})</FieldUnique> : ""}
      </div>
      {isTitle ? <ItemTitleTag>{t("Title")}</ItemTitleTag> : ""}
    </Title>
  );
};

export default FieldTitle;

const Title = styled.p`
  color: #000000d9;
  font-weight: 400;
  margin: 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const FieldUnique = styled.span`
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 400;
`;

const ItemTitleTag = styled(Tag)`
  color: rgba(0, 0, 0, 0.45);
  background-color: #fafafa;
  margin: 0;
`;
