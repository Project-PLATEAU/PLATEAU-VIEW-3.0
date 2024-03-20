import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  onProjectDelete: () => Promise<void>;
};

const DangerZone: React.FC<Props> = ({ onProjectDelete }) => {
  const t = useT();
  const { confirm } = Modal;

  const handleProjectDeleteConfirmation = useCallback(() => {
    confirm({
      title: t("Are you sure you want to delete this project?"),
      icon: <Icon icon="exclamationCircle" />,
      onOk() {
        onProjectDelete();
      },
    });
  }, [confirm, onProjectDelete, t]);

  return (
    <ContentSection title={t("Danger Zone")} danger>
      <Title>{t("Delete Project")}</Title>
      <Text>
        {t(
          "Permanently removes your project and all of its contents from Re:Earth CMS. This action is not reversible, so please continue with caution.",
        )}
      </Text>
      <Button onClick={handleProjectDeleteConfirmation} type="primary" danger>
        {t("Delete Project")}
      </Button>
    </ContentSection>
  );
};

export default DangerZone;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.85);
`;

const Text = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  margin: 24px 0;
`;
