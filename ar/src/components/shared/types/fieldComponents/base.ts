export type FieldBase<T> = {
  id?: string;
  value?: {
    storeable?: {
      omitPropertyNames: string[]; // Specified properties are omited to save to local storage
    };
  };
  preset?: {
    defaultValue?: string | number;
  };
} & T;
