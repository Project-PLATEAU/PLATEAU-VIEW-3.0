import SettingsMolecule from "@reearth-cms/components/molecules/Settings";

import useHooks from "./hooks";

const WorkspaceSettings: React.FC = () => {
  const { workspaceSettings, hasPrivilege, handleWorkspaceSettingsUpdate } = useHooks();

  return (
    <SettingsMolecule
      workspaceSettings={workspaceSettings}
      hasPrivilege={hasPrivilege}
      onWorkspaceSettingsUpdate={handleWorkspaceSettingsUpdate}
    />
  );
};

export default WorkspaceSettings;
