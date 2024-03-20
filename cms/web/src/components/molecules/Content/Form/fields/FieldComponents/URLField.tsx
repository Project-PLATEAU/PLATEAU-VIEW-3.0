import { useTranslation } from "react-i18next";

import Form from "@reearth-cms/components/atoms/Form";
import Input from "@reearth-cms/components/atoms/Input";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { validateURL } from "@reearth-cms/utils/regex";

import FieldTitle from "../../FieldTitle";

interface URLFieldProps {
  field: Field;
  itemGroupId?: string;
  onMetaUpdate?: () => Promise<void>;
}

const URLField: React.FC<URLFieldProps> = ({ field, itemGroupId, onMetaUpdate }) => {
  const { t } = useTranslation();

  return (
    <Form.Item
      extra={field.description}
      name={itemGroupId ? [field.id, itemGroupId] : field.id}
      label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />}
      rules={[
        {
          required: field.required,
          message: t("Please input field!"),
        },
        {
          message: "URL is not valid",
          validator: async (_, value) => {
            if (value) {
              if (
                Array.isArray(value) &&
                value.some((valueItem: string) => !validateURL(valueItem) && valueItem.length > 0)
              )
                return Promise.reject();
              else if (!Array.isArray(value) && !validateURL(value) && value?.length > 0)
                return Promise.reject();
            }
            return Promise.resolve();
          },
        },
      ]}>
      {field.multiple ? (
        <MultiValueField
          showCount={true}
          maxLength={field.typeProperty?.maxLength ?? 500}
          FieldInput={Input}
          onBlur={onMetaUpdate}
        />
      ) : (
        <Input
          showCount={true}
          maxLength={field.typeProperty?.maxLength ?? 500}
          onBlur={onMetaUpdate}
        />
      )}
    </Form.Item>
  );
};

export default URLField;
