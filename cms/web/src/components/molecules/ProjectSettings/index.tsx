import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import DangerZone from "@reearth-cms/components/molecules/ProjectSettings/DangerZone";
import ProjectGeneralForm from "@reearth-cms/components/molecules/ProjectSettings/GeneralForm";
import ProjectRequestOptions from "@reearth-cms/components/molecules/ProjectSettings/RequestOptions";
import { useT } from "@reearth-cms/i18n";

import { Project, Role } from "../Workspace/types";

export type Props = {
  project?: Project;
  onProjectUpdate: (name?: string | undefined, description?: string | undefined) => Promise<void>;
  onProjectRequestRolesUpdate: (role?: Role[] | null) => Promise<void>;
  onProjectDelete: () => Promise<void>;
};

const ProjectSettings: React.FC<Props> = ({
  project,
  onProjectDelete,
  onProjectUpdate,
  onProjectRequestRolesUpdate,
}) => {
  const t = useT();

  return (
    <InnerContent title={`${t("Project Settings")} / ${project?.name}`}>
      <ContentSection title={t("General")}>
        <ProjectGeneralForm project={project} onProjectUpdate={onProjectUpdate} />
      </ContentSection>
      <ContentSection title={t("Request")}>
        <ProjectRequestOptions
          project={project}
          onProjectRequestRolesUpdate={onProjectRequestRolesUpdate}
        />
      </ContentSection>
      <DangerZone onProjectDelete={onProjectDelete} />
    </InnerContent>
  );
};

export default ProjectSettings;
