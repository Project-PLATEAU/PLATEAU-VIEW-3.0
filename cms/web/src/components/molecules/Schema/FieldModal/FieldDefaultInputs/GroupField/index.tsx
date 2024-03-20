import React from "react";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import { useT } from "@reearth-cms/i18n";

const GroupField: React.FC = () => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      <Input disabled />
    </Form.Item>
  );
};

export default GroupField;
