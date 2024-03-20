import React from "react";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import MultiValueBooleanField from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueBooleanField";
import { useT } from "@reearth-cms/i18n";

type Props = {
  multiple?: boolean;
};

const CheckboxField: React.FC<Props> = ({ multiple }) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" valuePropName="checked" label={t("Set default value")}>
      {multiple ? <MultiValueBooleanField FieldInput={Checkbox} /> : <Checkbox />}
    </Form.Item>
  );
};

export default CheckboxField;
