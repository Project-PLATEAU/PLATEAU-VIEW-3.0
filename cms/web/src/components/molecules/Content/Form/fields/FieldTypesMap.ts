import { TagField, DateField, BoolField, CheckboxField, URLField } from "./FieldComponents";
import IntegerField from "./FieldComponents/IntegerField";
import MarkdownField from "./FieldComponents/MarkdownField";
import SelectField from "./FieldComponents/SelectField";
import TextareaField from "./FieldComponents/TextareaField";

export const FIELD_TYPE_COMPONENT_MAP = {
  Tag: TagField,
  Date: DateField,
  Bool: BoolField,
  Checkbox: CheckboxField,
  URL: URLField,
  TextArea: TextareaField,
  MarkdownText: MarkdownField,
  Integer: IntegerField,
  Select: SelectField,
};
