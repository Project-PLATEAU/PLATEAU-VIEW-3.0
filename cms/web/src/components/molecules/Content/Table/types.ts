import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";
import { FieldType, TypeProperty } from "@reearth-cms/components/molecules/Schema/types";
import {
  BasicOperator,
  BoolOperator,
  NullableOperator,
  NumberOperator,
  TimeOperator,
  StringOperator,
  MultipleOperator,
} from "@reearth-cms/components/molecules/View/types";

export type ColorType = "#BFBFBF" | "#52C41A" | "#FA8C16";
export type StateType = "DRAFT" | "PUBLIC" | "REVIEW";
export type DefaultFilterValueType = {
  operatorType: string;
  operator: Operator;
  value?: string;
};

export type FilterType = FieldType | "Person";

export type DropdownFilterType = {
  dataIndex: string | string[];
  title: string;
  type: FilterType;
  typeProperty: { values?: string[]; tags?: { color: string; id: string; name: string }[] };
  members: { user: { name: string } }[];
  id: string;
  multiple: boolean;
  required: boolean;
};

export type Operator =
  | BasicOperator
  | BoolOperator
  | NullableOperator
  | NumberOperator
  | TimeOperator
  | StringOperator
  | MultipleOperator;

export type ExtendedColumns = ProColumns<ContentTableField> & {
  type?: FieldType | "Person";
  fieldType?: string;
  sortOrder?: "descend" | "ascend" | null;
  typeProperty?: TypeProperty;
  required?: boolean;
  multiple?: boolean;
};
