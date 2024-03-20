import { Box, Tab, Tabs, styled } from "@mui/material";
import { useAtom } from "jotai";
import { FC, ReactNode, SyntheticEvent, useCallback, useEffect, useState } from "react";

import { showHelpModalAtom } from "../../../prototypes/view/states/app";
import SharedModal from "../Modal";

import { ControllersPage } from "./ControllersPage";
import { InspectorPage } from "./InspectorPage";
import { LayersPage } from "./LayersPage";
import { UserInterfacePage } from "./UserInterfacePage";

export const HelpModel: FC = () => {
  const [showHelpModel, setShowHelpModal] = useAtom(showHelpModalAtom);

  const onClose = useCallback(() => {
    setShowHelpModal(false);
  }, [setShowHelpModal]);

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (!showHelpModel) {
      setActiveTab(0);
    }
  }, [showHelpModel]);

  return (
    <SharedModal title="ヘルプ" isVisible={showHelpModel} width={720} onClose={onClose}>
      <Box sx={{ flexGrow: 1, display: "flex", height: 432, borderTop: 1, borderColor: "divider" }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={activeTab}
          onChange={handleTabChange}
          selectionFollowsFocus
          sx={{
            borderRight: 1,
            borderColor: "divider",
            width: 118,
            paddingTop: 1.5,
            flexShrink: 0,
          }}>
          <StyledTab label="UIを理解する" />
          <StyledTab label="マップ操作" />
          <StyledTab label="レイヤー" />
          <StyledTab label="インスペクター" />
        </Tabs>
        <TabPanel value={activeTab} index={0}>
          <UserInterfacePage />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <ControllersPage />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <LayersPage />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <InspectorPage />
        </TabPanel>
      </Box>
    </SharedModal>
  );
};

const StyledTab = styled(Tab)(({ theme }) => ({
  padding: 0,
  minHeight: 40,
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.primary,
}));

type TabPanelProps = {
  children?: ReactNode;
  index: number;
  value: number;
};

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <StyledTabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}>
      {value === index && children}
    </StyledTabPanel>
  );
};

const StyledTabPanel = styled("div")(() => ({
  flex: 1,
  boxSizing: "border-box",
  ["*"]: {
    boxSizing: "border-box",
  },
  ["img"]: {
    maxWidth: "100%",
  },
  overflow: "auto",
}));
