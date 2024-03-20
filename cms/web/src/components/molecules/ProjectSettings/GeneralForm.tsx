import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { useT } from "@reearth-cms/i18n";

import { Project } from "../Workspace/types";

export type Props = {
  project?: Project;
  onProjectUpdate: (name?: string | undefined, description?: string | undefined) => Promise<void>;
};

const ProjectGeneralForm: React.FC<Props> = ({ project, onProjectUpdate }) => {
  const [form] = Form.useForm();
  const t = useT();

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        onProjectUpdate(values.name, values.description);
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, onProjectUpdate]);

  return (
    <StyledForm form={form} layout="vertical" autoComplete="off" initialValues={project}>
      <Form.Item name="name" label={t("Name")}>
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label={t("Description")}
        extra={t("Write something here to describe this record.")}>
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item>
        <Button onClick={handleSubmit} type="primary" htmlType="submit">
          {t("Save changes")}
        </Button>
      </Form.Item>
    </StyledForm>
  );
};

const StyledForm = styled(Form)`
  max-width: 400px;
`;

export default ProjectGeneralForm;
