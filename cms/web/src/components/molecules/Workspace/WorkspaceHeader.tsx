import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Content from "@reearth-cms/components/atoms/Content";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  onProjectSearch: (value: string) => void;
  onProjectModalOpen: () => void;
  onWorkspaceModalOpen?: () => void;
};

const WorkspaceHeader: React.FC<Props> = ({
  onProjectSearch,
  onProjectModalOpen,
  onWorkspaceModalOpen,
}) => {
  const t = useT();

  return (
    <ActionHeader>
      <StyledSearch
        onSearch={onProjectSearch}
        placeholder={t("search projects")}
        allowClear
        type="text"
      />
      <ButtonWrapper>
        <Button onClick={onWorkspaceModalOpen}>{t("Create a Workspace")}</Button>
        <Button onClick={onProjectModalOpen} type="primary" icon={<Icon icon="plus" />}>
          {t("New Project")}
        </Button>
      </ButtonWrapper>
    </ActionHeader>
  );
};

const ActionHeader = styled(Content)`
  display: flex;
  justify-content: space-between;
  margin: auto;
  padding-bottom: 16px;
`;

const ButtonWrapper = styled.div`
  Button + Button {
    margin-left: 8px;
  }
`;

const StyledSearch = styled(Input.Search)`
  width: 264px;
`;

export default WorkspaceHeader;
