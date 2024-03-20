export type View = {
  id: string;
  name: string;
  modelId: string;
  projectId: string;
  sort?: ItemSort;
  filter?: Condition;
  columns?: Column[];
};

export type Column = {
  field: FieldSelector;
  visible: boolean;
  fixed?: "left" | "right";
};

export type ColumnSelectionInput = {
  field: FieldSelector;
  visible: boolean;
};

export type ItemSort = {
  field: FieldSelector;
  direction: SortDirection;
};

export type FieldSelector = {
  type: FieldType;
  id?: string;
};

export type FieldType =
  | "ID"
  | "CREATION_DATE"
  | "CREATION_USER"
  | "MODIFICATION_DATE"
  | "MODIFICATION_USER"
  | "STATUS"
  | "FIELD"
  | "META_FIELD";

export type SortDirection = "ASC" | "DESC";

export type ConditionInput = {
  and?: AndConditionInput;
  or?: OrConditionInput;
  basic?: BasicFieldConditionInput;
  nullable?: NumberFieldConditionInput;
  multiple?: MultipleFieldConditionInput;
  bool?: BoolFieldConditionInput;
  string?: StringFieldConditionInput;
  number?: NumberFieldConditionInput;
  time?: TimeFieldConditionInput;
};

export type AndConditionInput = {
  conditions: ConditionInput[];
};

export type OrConditionInput = {
  conditions: ConditionInput[];
};

export type BasicFieldConditionInput = {
  fieldId: FieldSelector;
  operator: BasicOperator;
  value: any;
};

export type NullableFieldConditionInput = {
  fieldId: FieldSelector;
  operator: NullableOperator;
};

export type MultipleFieldConditionInput = {
  fieldId: FieldSelector;
  operator: MultipleOperator;
  value: any[];
};

export type BoolFieldConditionInput = {
  fieldId: FieldSelector;
  operator: BoolOperator;
  value: boolean;
};

export type StringFieldConditionInput = {
  fieldId: FieldSelector;
  operator: StringOperator;
  value: boolean;
};

export type NumberFieldConditionInput = {
  fieldId: FieldSelector;
  operator: StringOperator;
  value: boolean;
};

export type TimeFieldConditionInput = {
  fieldId: FieldSelector;
  operator: TimeOperator;
  value: boolean;
};

export type Condition =
  | AndCondition
  | OrCondition
  | BasicFieldCondition
  | NullableFieldCondition
  | MultipleFieldCondition
  | BoolFieldCondition
  | StringFieldCondition
  | NumberFieldCondition
  | TimeFieldCondition;

export type AndCondition = {
  conditions: Condition[];
};

export type OrCondition = {
  conditions: Condition[];
};

export type BasicFieldCondition = {
  fieldId: FieldSelector;
  operator: BasicOperator;
  value: any;
};

export type NullableFieldCondition = {
  fieldId: FieldSelector;
  operator: NullableOperator;
};

export type MultipleFieldCondition = {
  fieldId: FieldSelector;
  operator: MultipleOperator;
  value: any[];
};

export type BoolFieldCondition = {
  fieldId: FieldSelector;
  operator: BoolOperator;
  value: boolean;
};

export type StringFieldCondition = {
  fieldId: FieldSelector;
  operator: StringOperator;
  value: boolean;
};

export type NumberFieldCondition = {
  fieldId: FieldSelector;
  operator: StringOperator;
  value: boolean;
};

export type TimeFieldCondition = {
  fieldId: FieldSelector;
  operator: TimeOperator;
  value: boolean;
};

export enum BasicOperator {
  Equals = "EQUALS",
  NotEquals = "NOT_EQUALS",
}

export enum BoolOperator {
  Equals = "EQUALS",
  NotEquals = "NOT_EQUALS",
}

export enum NullableOperator {
  Empty = "EMPTY",
  NotEmpty = "NOT_EMPTY",
}

export enum MultipleOperator {
  IncludesAll = "INCLUDES_ALL",
  IncludesAny = "INCLUDES_ANY",
  NotIncludesAll = "NOT_INCLUDES_ALL",
  NotIncludesAny = "NOT_INCLUDES_ANY",
}

export enum StringOperator {
  Contains = "CONTAINS",
  EndsWith = "ENDS_WITH",
  NotContains = "NOT_CONTAINS",
  NotEndsWith = "NOT_ENDS_WITH",
  NotStartsWith = "NOT_STARTS_WITH",
  StartsWith = "STARTS_WITH",
}

export enum NumberOperator {
  GreaterThan = "GREATER_THAN",
  GreaterThanOrEqualTo = "GREATER_THAN_OR_EQUAL_TO",
  LessThan = "LESS_THAN",
  LessThanOrEqualTo = "LESS_THAN_OR_EQUAL_TO",
}

export enum TimeOperator {
  After = "AFTER",
  AfterOrOn = "AFTER_OR_ON",
  Before = "BEFORE",
  BeforeOrOn = "BEFORE_OR_ON",
  OfThisMonth = "OF_THIS_MONTH",
  OfThisWeek = "OF_THIS_WEEK",
  OfThisYear = "OF_THIS_YEAR",
}
