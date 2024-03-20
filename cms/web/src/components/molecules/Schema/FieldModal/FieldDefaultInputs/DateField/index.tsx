import styled from "@emotion/styled";
import React from "react";

import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { useT } from "@reearth-cms/i18n";

type Props = {
  multiple?: boolean;
};

const DateField: React.FC<Props> = ({ multiple }) => {
  const t = useT();

  return (
    <Form.Item name="defaultValue" label={t("Set default value")}>
      {multiple ? (
        <MultiValueField type="date" FieldInput={StyledDatePicker} />
      ) : (
        <StyledDatePicker />
      )}
    </Form.Item>
  );
};

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
`;

export default DateField;
