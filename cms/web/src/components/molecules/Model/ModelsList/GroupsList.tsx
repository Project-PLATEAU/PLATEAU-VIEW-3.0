import styled from "@emotion/styled";
import { useCallback, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  selectedKey?: string;
  groups?: Group[];
  collapsed?: boolean;
  onModalOpen: () => void;
  onGroupSelect?: (groupId: string) => void;
};

const GroupsList: React.FC<Props> = ({
  selectedKey,
  groups,
  collapsed,
  onModalOpen,
  onGroupSelect,
}) => {
  const t = useT();

  const selectedKeys = useMemo(() => {
    return selectedKey ? [selectedKey] : [];
  }, [selectedKey]);

  const handleClick = useCallback(
    (e: MenuInfo) => {
      onGroupSelect?.(e.key);
    },
    [onGroupSelect],
  );

  return (
    <SchemaStyledMenu>
      {collapsed ? (
        <StyledIcon icon="caretRight" />
      ) : (
        <Header>
          <SchemaAction>
            <SchemaStyledMenuTitle>{t("Groups")}</SchemaStyledMenuTitle>
            <SchemaAddButton onClick={onModalOpen} icon={<Icon icon="plus" />} type="text">
              {!collapsed && t("Add")}
            </SchemaAddButton>
          </SchemaAction>
        </Header>
      )}
      <MenuWrapper>
        <StyledMenu
          selectedKeys={selectedKeys}
          mode={collapsed ? "vertical" : "inline"}
          collapsed={collapsed}
          items={groups?.map(group => ({
            label: collapsed ? <Icon icon="dot" /> : group.name,
            key: group.id,
          }))}
          onClick={handleClick}
        />
      </MenuWrapper>
    </SchemaStyledMenu>
  );
};

const Header = styled.div`
  padding: 22px 20px 4px 20px;
`;

const SchemaAction = styled.div<{ collapsed?: boolean }>`
  display: flex;
  justify-content: ${({ collapsed }) => (collapsed ? "space-around" : "space-between")};
  align-items: center;
`;

const SchemaAddButton = styled(Button)`
  color: #1890ff;
  padding: 4px;
  &:hover,
  &:active,
  &:focus {
    color: #1890ff;
  }
`;

const SchemaStyledMenuTitle = styled.h1`
  margin: 0;
  font-weight: 400;
  font-size: 14px;
  color: #00000073;
`;

const SchemaStyledMenu = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-right: 1px solid #f0f0f0;
`;

const MenuWrapper = styled.div`
  overflow: auto;
`;

const StyledIcon = styled(Icon)`
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 20px;
`;

const StyledMenu = styled(Menu)<{ collapsed?: boolean }>`
  color: ${({ collapsed }) => (collapsed ? "#C4C4C4" : undefined)};

  .ant-menu-item {
    display: flex;
    justify-content: center;
  }
`;

export default GroupsList;
