import Form from "@reearth-cms/components/atoms/Form";
import Select from "@reearth-cms/components/atoms/Select";
import MultiValueSelect from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueSelect";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";

import FieldTitle from "../../FieldTitle";

interface DefaultFieldProps {
  field: Field;
  itemGroupId?: string;
}

const SelectField: React.FC<DefaultFieldProps> = ({ field, itemGroupId }) => {
  const { Option } = Select;
  const t = useT();

  return (
    <Form.Item
      extra={field.description}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}
      rules={[
        {
          required: field.required,
          message: t("Please select an option!"),
        },
      ]}>
      {field.multiple ? (
        <MultiValueSelect selectedValues={field.typeProperty?.values} />
      ) : (
        <Select allowClear>
          {field.typeProperty?.values?.map((value: string) => (
            <Option key={value} value={value}>
              {value}
            </Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
};

export default SelectField;
