import { ItemType } from "antd/lib/menu/hooks/useItems";
import { useCallback, useEffect, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Menu, { MenuInfo } from "@reearth-cms/components/atoms/Menu";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  inlineCollapsed: boolean;
  defaultSelectedKey?: string;
  onNavigate?: (info: MenuInfo) => void;
};

const ProjectMenu: React.FC<Props> = ({ inlineCollapsed, defaultSelectedKey, onNavigate }) => {
  const t = useT();

  const topItems: ItemType[] = [
    { label: t("Home"), key: "home", icon: <Icon icon="home" /> },
    { label: t("Overview"), key: "overview", icon: <Icon icon="dashboard" /> },
    { label: t("Schema"), key: "schema", icon: <Icon icon="unorderedList" /> },
    { label: t("Content"), key: "content", icon: <Icon icon="table" /> },
    { label: t("Asset"), key: "asset", icon: <Icon icon="file" /> },
    { label: t("Request"), key: "request", icon: <Icon icon="pullRequest" /> },
  ];
  const [selected, changeSelected] = useState([defaultSelectedKey ?? "overview"]);

  useEffect(() => {
    if (defaultSelectedKey && defaultSelectedKey !== selected[0]) {
      changeSelected([defaultSelectedKey]);
    }
  }, [selected, defaultSelectedKey]);

  const items: ItemType[] = [
    {
      label: t("Accessibility"),
      key: "accessibility",
      icon: <Icon icon="send" />,
    },
    {
      label: t("Settings"),
      key: "settings",
      icon: <Icon icon="settings" />,
    },
  ];

  const onClick = useCallback(
    (info: MenuInfo) => {
      changeSelected([info.key]);
      onNavigate?.(info);
    },
    [onNavigate],
  );

  return (
    <>
      <Menu
        onClick={onClick}
        selectedKeys={selected}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={topItems}
      />
      <Menu
        onClick={onClick}
        selectedKeys={selected}
        inlineCollapsed={inlineCollapsed}
        mode="inline"
        items={items}
      />
    </>
  );
};

export default ProjectMenu;
