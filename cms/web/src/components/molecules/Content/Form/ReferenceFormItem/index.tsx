import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import LinkItemModal from "@reearth-cms/components/molecules/Content/LinkItemModal";
import ReferenceItem from "@reearth-cms/components/molecules/Content/ReferenceItem";
import { useT } from "@reearth-cms/i18n";

import { FormItem } from "../../types";

type Props = {
  linkedItemsModalList?: FormItem[];
  className?: string;
  value?: string;
  disabled?: boolean;
  correspondingFieldId: string;
  modelId?: string;
  titleFieldId?: string | null;
  formItemsData?: FormItem[];
  linkItemModalTitle?: string;
  linkItemModalTotalCount?: number;
  linkItemModalPage?: number;
  linkItemModalPageSize?: number;
  onReferenceModelUpdate?: (modelId: string, referenceFieldId: string) => void;
  onSearchTerm?: (term?: string) => void;
  onLinkItemTableReload?: () => void;
  onLinkItemTableChange?: (page: number, pageSize: number) => void;
  onChange?: (value?: string) => void;
};

const ReferenceFormItem: React.FC<Props> = ({
  linkedItemsModalList,
  value,
  disabled,
  correspondingFieldId,
  onChange,
  modelId,
  titleFieldId,
  formItemsData,
  linkItemModalTitle,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  onReferenceModelUpdate,
  onSearchTerm,
  onLinkItemTableReload,
  onLinkItemTableChange,
}) => {
  const { workspaceId, projectId } = useParams();

  const t = useT();
  const [visible, setVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<FormItem | undefined>();

  const handleClick = useCallback(() => {
    if (!onReferenceModelUpdate || !modelId) return;
    onReferenceModelUpdate(modelId, titleFieldId ?? "");
    setVisible(true);
  }, [onReferenceModelUpdate, modelId, titleFieldId]);

  const handleLinkItemModalCancel = useCallback(() => {
    if (disabled) return;
    setVisible(false);
  }, [disabled, setVisible]);

  useEffect(() => {
    const item = [...(formItemsData ?? []), ...(linkedItemsModalList ?? [])]?.find(
      item => item.id === value,
    );
    setCurrentItem(item);
  }, [linkedItemsModalList, formItemsData, value]);

  return (
    <>
      {value && (
        <ReferenceItemWrapper>
          <ReferenceItem
            value={value}
            title={currentItem?.title ?? ""}
            status={currentItem?.status}
            workspaceId={workspaceId}
            projectId={projectId}
            modelId={modelId}
          />
          <Button
            disabled={disabled}
            type="link"
            icon={<Icon icon={"unlinkSolid"} size={16} />}
            onClick={() => {
              onChange?.();
            }}
          />
        </ReferenceItemWrapper>
      )}
      <StyledButton onClick={handleClick} type="primary" disabled={disabled}>
        <Icon icon="arrowUpRight" size={14} /> {t("Refer to item")}
      </StyledButton>
      {!!onSearchTerm && !!onLinkItemTableReload && !!onLinkItemTableChange && (
        <LinkItemModal
          linkItemModalTitle={linkItemModalTitle}
          linkItemModalTotalCount={linkItemModalTotalCount}
          linkItemModalPage={linkItemModalPage}
          correspondingFieldId={correspondingFieldId}
          linkItemModalPageSize={linkItemModalPageSize}
          onSearchTerm={onSearchTerm}
          onLinkItemTableReload={onLinkItemTableReload}
          onLinkItemTableChange={onLinkItemTableChange}
          linkedItemsModalList={linkedItemsModalList}
          visible={visible}
          onLinkItemModalCancel={handleLinkItemModalCancel}
          linkedItem={value}
          onChange={onChange}
        />
      )}
    </>
  );
};

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  margin-top: 8px;
  > span {
    padding: 4px;
  }
`;

const ReferenceItemWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export default ReferenceFormItem;
