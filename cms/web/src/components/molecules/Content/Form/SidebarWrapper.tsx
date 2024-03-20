import styled from "@emotion/styled";

import Badge from "@reearth-cms/components/atoms/Badge";
import Tag from "@reearth-cms/components/atoms/Tag";
import { ColorType, StateType } from "@reearth-cms/components/molecules/Content/Table/types";
import { Item, ItemStatus } from "@reearth-cms/components/molecules/Content/types";
import SidebarCard from "@reearth-cms/components/molecules/Request/Details/SidebarCard";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

export type Props = {
  item?: Item;
};

const ContentSidebarWrapper: React.FC<Props> = ({ item }) => {
  const t = useT();

  const getStatusBadge = (status: ItemStatus) => {
    const stateColors = { DRAFT: "#BFBFBF", PUBLIC: "#52C41A", REVIEW: "#FA8C16" };
    const itemStatus: StateType[] = status.split("_") as StateType[];
    return (
      <>
        {itemStatus.map((state, index) => {
          if (index === itemStatus.length - 1) {
            return (
              <StyledBadge key={index} color={stateColors[state] as ColorType} text={t(state)} />
            );
          } else {
            return <StyledBadge key={index} color={stateColors[state] as ColorType} />;
          }
        })}
      </>
    );
  };

  return (
    <>
      {item && (
        <>
          <SidebarCard title={t("Item Information")}>
            <DataRow>
              <DataTitle>ID</DataTitle>
              <StyledTag>{item.id}</StyledTag>
            </DataRow>
            <DataRow>
              <DataTitle>{t("Created At")}</DataTitle>
              <DataText>{dateTimeFormat(item.createdAt)}</DataText>
            </DataRow>
            <DataRow>
              <DataTitle>{t("Created By")}</DataTitle>
              <DataText>{item.createdBy}</DataText>
            </DataRow>
            <DataRow>
              <DataTitle>{t("Updated At")}</DataTitle>
              <DataText>{dateTimeFormat(item.updatedAt)}</DataText>
            </DataRow>
            <DataRow>
              <DataTitle>{t("Updated By")}</DataTitle>
              <DataText>{item.updatedBy}</DataText>
            </DataRow>
          </SidebarCard>
          <SidebarCard title={t("Publish State")}>
            <DataRow>
              <DataTitle>{getStatusBadge(item.status)}</DataTitle>
            </DataRow>
          </SidebarCard>
        </>
      )}
    </>
  );
};

const DataRow = styled.div`
  display: flex;
  margin: 0 -4px;
  align-items: center;
  justify-content: space-between;
`;

const DataTitle = styled.div`
  font-size: 14px;
  line-height: 22px;
  padding: 4px;
`;

const DataText = styled.div`
  color: #00000073;
  font-size: 12px;
  line-height: 22px;
  padding: 4px;
`;

const StyledTag = styled(Tag)`
  margin: 0;
  color: #00000073;
  background-color: #f0f0f0;
`;

const StyledBadge = styled(Badge)`
  + * {
    margin-left: 4px;
  }
`;

export default ContentSidebarWrapper;
