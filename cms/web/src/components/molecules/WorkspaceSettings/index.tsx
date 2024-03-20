import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import DangerZone from "@reearth-cms/components/molecules/WorkspaceSettings/DangerZone";
import WorkspaceGeneralForm from "@reearth-cms/components/molecules/WorkspaceSettings/GeneralForm";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  workspaceName?: string;
  onWorkspaceUpdate: (name?: string | undefined) => Promise<void>;
  onWorkspaceDelete: () => Promise<void>;
};

const WorkspaceSettings: React.FC<Props> = ({
  workspaceName,
  onWorkspaceUpdate,
  onWorkspaceDelete,
}) => {
  const t = useT();

  return (
    <InnerContent title={t("Workspace Settings")}>
      <ContentSection title={t("General")}>
        <WorkspaceGeneralForm workspaceName={workspaceName} onWorkspaceUpdate={onWorkspaceUpdate} />
      </ContentSection>
      <DangerZone onWorkspaceDelete={onWorkspaceDelete} />
    </InnerContent>
  );
};

export default WorkspaceSettings;
