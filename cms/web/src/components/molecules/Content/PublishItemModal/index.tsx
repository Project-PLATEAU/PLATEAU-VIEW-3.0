import styled from "@emotion/styled";
import { useCallback, useEffect, useState } from "react";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import Modal from "@reearth-cms/components/atoms/Modal";
import Row from "@reearth-cms/components/atoms/Row";
import ReferenceItem from "@reearth-cms/components/molecules/Content/ReferenceItem";
import WarningText from "@reearth-cms/components/molecules/Content/WarningText";
import { useT } from "@reearth-cms/i18n";

import { FormItem } from "../types";

export type FormValues = {
  items: string[];
};

export type Props = {
  open?: boolean;
  itemId: string;
  unpublishedItems: FormItem[];
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (data: string[]) => Promise<void>;
};

const initialValues: FormValues = {
  items: [],
};

const PublishItemModal: React.FC<Props> = ({
  open,
  itemId,
  unpublishedItems,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});

  const handleCheckboxChange = useCallback(
    (itemId: string, checked: boolean) => {
      setSelectedItems(prevState => ({
        ...prevState,
        [itemId]: checked,
      }));
    },
    [setSelectedItems],
  );

  useEffect(() => {
    return () => {
      setSelectedItems({});
    };
  }, [setSelectedItems, onClose]);

  const handleSubmit = useCallback(async () => {
    try {
      await onSubmit?.([
        itemId,
        ...Object.keys(selectedItems)
          .filter(key => selectedItems[key] === true)
          .map(key => key),
      ]);
      onClose?.(true);
      form.resetFields();
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  }, [itemId, form, onClose, onSubmit, selectedItems]);

  const handleClose = useCallback(() => {
    onClose?.(true);
  }, [onClose]);
  return (
    <Modal open={open} onCancel={handleClose} onOk={handleSubmit} title={t("Publish")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        {unpublishedItems?.length !== 0 && (
          <WarningText
            text={t(
              "We found some referenced items that not been published yet. Please select to publish the items.",
            )}
          />
        )}
        {unpublishedItems?.map((item, index) => (
          <StyledRow key={index}>
            <StyledCheckbox
              value={selectedItems[item.id]}
              onChange={e => handleCheckboxChange(item.id, e.target.checked)}>
              <ReferenceItem value={item.id} status={item.status} title={item.title} />
            </StyledCheckbox>
          </StyledRow>
        ))}
      </Form>
    </Modal>
  );
};

const StyledRow = styled(Row)`
  + .ant-row {
    margin-top: 10px;
  }
`;

const StyledCheckbox = styled(Checkbox)`
  display: flex;
  width: 100%;
  .ant-checkbox + span {
    flex: 1;
  }
`;

export default PublishItemModal;
