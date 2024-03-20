export type MetaDataSchema = {
  id?: string;
  fields?: Field[];
};

export type Schema = {
  id: string;
  fields: Field[];
};

export type Field = {
  id: string;
  type: FieldType;
  title: string;
  key: string;
  description: string;
  required: boolean;
  unique: boolean;
  multiple: boolean;
  isTitle: boolean;
  metadata?: boolean;
  typeProperty?: TypeProperty;
};

export type FieldType =
  | "Text"
  | "TextArea"
  // | "RichText"
  | "MarkdownText"
  | "Asset"
  | "Date"
  | "Bool"
  | "Select"
  | "Tag"
  | "Integer"
  // | "Float"
  | "Reference"
  | "Checkbox"
  | "URL"
  | "Group";

type Tag = { id: string; name: string; color: string };

export type TypeProperty = {
  defaultValue?: string | boolean | string[] | boolean[];
  maxLength?: number;
  assetDefaultValue?: string;
  selectDefaultValue?: string | string[];
  integerDefaultValue?: number;
  min?: number;
  max?: number;
  correspondingField?: any;
  modelId?: string;
  groupId?: string;
  tags?: Tag[];
  values?: string[];
  schema?: { titleFieldId: string | null };
};

export type FieldTypePropertyInput = {
  text?: { defaultValue?: string; maxLength?: number };
  textArea?: { defaultValue?: string; maxLength?: number };
  markdownText?: { defaultValue?: string; maxLength?: number };
  asset?: { defaultValue?: string };
  date?: { defaultValue: string };
  bool?: { defaultValue?: boolean };
  select?: { defaultValue: string; values: string[] };
  integer?: { defaultValue: number | ""; min: number | null; max: number | null };
  url?: { defaultValue: string };
  reference?: {
    modelId: string;
    schemaId: string;
    correspondingField: {
      key: string;
      title: string;
      description: string;
      required: boolean;
    } | null;
  };
  group?: {
    groupId: string;
  };
  tag?: {
    defaultValue?: string;
    tags: { color: string; id?: string; name: string }[];
  };
  checkbox?: { defaultValue?: boolean };
};

export type FieldModalTabs = "settings" | "validation" | "defaultValue";

export type Group = {
  id: string;
  schemaId: string;
  projectId: string;
  name: string;
  description: string;
  key: string;
  schema: Schema;
};

export type ModelFormValues = {
  id?: string;
  name: string;
  description: string;
  key: string;
};

export type FormValues = {
  fieldId?: string;
  groupId?: string;
  title: string;
  description: string;
  key: string;
  metadata: boolean;
  multiple: boolean;
  unique: boolean;
  isTitle: boolean;
  required: boolean;
  type?: FieldType;
  typeProperty: FieldTypePropertyInput;
};

export type FormTypes = FormValues & {
  defaultValue?: any;
  maxLength?: number;
  values: string[];
  min?: number;
  max?: number;
  tags: { color: string; id: string; name: string }[];
  group: string;
};
