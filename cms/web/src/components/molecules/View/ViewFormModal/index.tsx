import { useCallback, useEffect, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form, { FieldError } from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import { View } from "@reearth-cms/components/molecules/View/types";
import { modalStateType } from "@reearth-cms/components/organisms/Project/Content/ViewsMenu/hooks";
import { useT } from "@reearth-cms/i18n";

export interface FormValues {
  viewId?: string;
  name: string;
}

export interface Props {
  view?: View;
  open?: boolean;
  modalState: modalStateType;
  submitting?: boolean;
  onClose: () => void;
  onCreate?: (values: FormValues) => Promise<void> | void;
  OnUpdate?: (values: FormValues) => Promise<void> | void;
}

const ViewFormModal: React.FC<Props> = ({
  view,
  open,
  modalState,
  submitting,
  onClose,
  onCreate,
  OnUpdate,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [buttonDisabled, setButtonDisabled] = useState(true);

  useEffect(() => {
    if (open) {
      if (view && modalState === "rename") {
        form.setFieldsValue(view);
      } else {
        form.resetFields();
      }
    }
  }, [form, view, open, modalState]);

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();
    if (modalState === "create") {
      await onCreate?.(values);
    } else {
      await OnUpdate?.({ viewId: view?.id, ...values });
    }
    onClose();
    form.resetFields();
  }, [form, modalState, onClose, onCreate, OnUpdate, view?.id]);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  const handleValuesChange = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        setButtonDisabled(false);
      })
      .catch(fieldError => {
        setButtonDisabled(
          fieldError.errorFields.some((item: FieldError) => item.errors.length > 0),
        );
      });
  }, [form]);

  return (
    <Modal
      open={open}
      onOk={handleSubmit}
      onCancel={handleClose}
      okButtonProps={{ disabled: buttonDisabled }}
      title={modalState === "create" ? t("New View") : t("Update View")}
      footer={[
        <Button key="back" onClick={handleClose} disabled={submitting}>
          {t("Cancel")}
        </Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleSubmit}>
          {submitting ? t("Submitting") : t("OK")}
        </Button>,
      ]}>
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Form.Item
          name="name"
          label={t("View Name")}
          extra={t("This is the title of the view")}
          rules={[{ required: true, message: t("Please input the view name!") }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ViewFormModal;
