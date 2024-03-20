import styled from "@emotion/styled";
import { useMemo } from "react";

import Card from "@reearth-cms/components/atoms/Card";
import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  model: Model;
  onSchemaNavigate?: (modelId: string) => void;
  onContentNavigate?: (modelId: string) => void;
  onModelDeletionModalOpen: (model: Model) => Promise<void>;
  onModelUpdateModalOpen: (model: Model) => Promise<void>;
};

const ModelCard: React.FC<Props> = ({
  model,
  onSchemaNavigate,
  onContentNavigate,
  onModelDeletionModalOpen,
  onModelUpdateModalOpen,
}) => {
  const { Meta } = Card;
  const t = useT();

  const MenuItems = useMemo(
    () => [
      {
        key: "edit",
        label: t("Edit"),
        onClick: () => onModelUpdateModalOpen(model),
      },
      {
        key: "delete",
        label: t("Delete"),
        onClick: () => onModelDeletionModalOpen(model),
      },
    ],
    [t, model, onModelUpdateModalOpen, onModelDeletionModalOpen],
  );

  return (
    <StyledCard
      actions={[
        <Icon icon="unorderedList" key="schema" onClick={() => onSchemaNavigate?.(model.id)} />,
        <Icon icon="table" key="content" onClick={() => onContentNavigate?.(model.id)} />,
        <Dropdown key="options" menu={{ items: MenuItems }} trigger={["click"]}>
          <a onClick={e => e.preventDefault()}>
            <Icon icon="ellipsis" />
          </a>
        </Dropdown>,
      ]}>
      <Meta title={model.name} description={model.description} />
    </StyledCard>
  );
};

export default ModelCard;

const StyledCard = styled(Card)`
  .ant-card-body {
    height: 102px;
  }
  .ant-card-meta-description {
    height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-all;
  }
`;
