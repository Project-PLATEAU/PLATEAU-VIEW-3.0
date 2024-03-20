import styled from "@emotion/styled";

import DropdownAtom, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Space from "@reearth-cms/components/atoms/Space";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";

export type Props = {
  className?: string;
  items: MenuProps["items"];
  name?: string;
  personal?: boolean;
};

const Dropdown: React.FC<Props> = ({ className, items, name, personal }) => {
  return (
    <StyledDropdown
      className={className}
      menu={{ items }}
      trigger={["click"]}
      dropdownRender={menu => <StyledDropdownMenu>{menu}</StyledDropdownMenu>}>
      <a onClick={e => e.preventDefault()}>
        <Space>
          <UserAvatar username={name ?? ""} shape={personal ? "circle" : "square"} size={"small"} />
          <Text>{name}</Text>
          <StyledIcon icon="caretDown" />
        </Space>
      </a>
    </StyledDropdown>
  );
};

export default Dropdown;

const StyledDropdown = styled(DropdownAtom)`
  padding-left: 10px;
  color: #fff;
  background-color: #1d1d1d;
`;
const StyledDropdownMenu = styled.div`
  .ant-dropdown-menu {
    background-color: #141414 !important;
    width: 190px;
  }
  .ant-dropdown-menu-item-divider {
    background-color: #303030;
  }
  .ant-dropdown-menu-item-group-title,
  .ant-dropdown-menu-item,
  .ant-dropdown-menu-submenu-title {
    color: #fff;
  }
  .ant-dropdown-menu-item-group-title {
    font-weight: 400;
    font-size: 12px;
    line-height: 22px;
    user-select: none;
    color: #dbdbdb;
  }
  .ant-dropdown-menu-item-active {
    background-color: #1d1d1d;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const StyledIcon = styled(Icon)`
  color: #8c8c8c;
`;

const Text = styled.p`
  max-width: 300px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
