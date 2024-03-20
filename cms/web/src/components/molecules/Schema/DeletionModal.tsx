import styled from "@emotion/styled";
import { useMemo } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Group } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  open: boolean;
  data?: Model | Group;
  onClose: () => void;
  onDelete: (modelId?: string) => Promise<void> | void;
  isModel: boolean;
};

const DeletionModal: React.FC<Props> = ({ open, data, onClose, onDelete, isModel }) => {
  const t = useT();
  const title = useMemo(() => (isModel ? t("Delete Model") : t("Delete Group")), [isModel, t]);
  const confirmation = useMemo(
    () =>
      isModel
        ? t("Are you sure you want to delete the model")
        : t("Are you sure you want to delete the group"),
    [isModel, t],
  );
  const description = useMemo(
    () =>
      isModel
        ? t("This action will permanently delete the selected model and cannot be reversed.")
        : t("This action will permanently delete the selected group and cannot be reversed."),
    [isModel, t],
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          {t("Cancel")}
        </Button>,
        <Button key="submit" type="primary" onClick={() => onDelete(data?.id)} danger>
          {title}
        </Button>,
      ]}>
      <p>
        {confirmation}
        <Name> {data?.name} </Name>?
      </p>
      <Alert message={t("Warning")} description={description} type="warning" showIcon />
    </Modal>
  );
};

export default DeletionModal;

const Name = styled.span`
  font-weight: 600;
`;
