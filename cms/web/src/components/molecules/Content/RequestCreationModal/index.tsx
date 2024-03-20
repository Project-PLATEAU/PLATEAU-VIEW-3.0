import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Row from "@reearth-cms/components/atoms/Row";
import Select, { SelectProps } from "@reearth-cms/components/atoms/Select";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import ReferenceItem from "@reearth-cms/components/molecules/Content/ReferenceItem";
import WarningText from "@reearth-cms/components/molecules/Content/WarningText";
import { RequestState } from "@reearth-cms/components/molecules/Request/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";

import { FormItem } from "../types";

export type FormValues = {
  title: string;
  description: string;
  state: RequestState;
  reviewersId: string[];
  items: {
    itemId: string;
  }[];
};

export type Props = {
  open?: boolean;
  requestCreationLoading: boolean;
  itemId: string;
  unpublishedItems: FormItem[];
  workspaceUserMembers: UserMember[];
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (data: FormValues) => Promise<void>;
};

const initialValues: FormValues = {
  title: "",
  description: "",
  state: "WAITING",
  reviewersId: [],
  items: [
    {
      itemId: "",
    },
  ],
};

const RequestCreationModal: React.FC<Props> = ({
  open,
  requestCreationLoading,
  itemId,
  unpublishedItems,
  workspaceUserMembers,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});

  const reviewers: SelectProps["options"] = [];
  for (const member of workspaceUserMembers) {
    reviewers.push({
      label: member.user.name,
      value: member.userId,
    });
  }

  const handleCheckboxChange = useCallback(
    (itemId: string, checked: boolean) => {
      setSelectedItems(prevState => ({
        ...prevState,
        [itemId]: checked,
      }));
    },
    [setSelectedItems],
  );

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      values.items = [
        { itemId },
        ...Object.keys(selectedItems)
          .filter(key => selectedItems[key] === true)
          .map(key => ({ itemId: key })),
      ];
      values.state = "WAITING";
      await onSubmit?.(values);
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
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      confirmLoading={requestCreationLoading}
      title={t("New Request")}>
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="title"
          label={t("Title")}
          rules={[{ required: true, message: t("Please input the title of your request!") }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={t("Description")}>
          <TextArea rows={4} showCount maxLength={100} />
        </Form.Item>
        <Form.Item
          name="reviewersId"
          label="Reviewer"
          rules={[
            {
              required: true,
              message: t("Please select a reviewer!"),
            },
          ]}>
          <Select
            filterOption={(input, option) =>
              (option?.label?.toString().toLowerCase() ?? "").includes(input.toLowerCase())
            }
            placeholder={t("Reviewer")}
            mode="multiple"
            options={reviewers}
            allowClear
          />
        </Form.Item>
        {unpublishedItems?.length !== 0 && (
          <WarningText
            text={t(
              "We found some referenced items that not published yet. Please select to add the items to the same request.",
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

export default RequestCreationModal;
