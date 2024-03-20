export type WidgetProps<DefaultProperty, OptionalProperty> = {
  inEditor: boolean;
  widget: {
    property: {
      default: DefaultProperty;
      optional?: OptionalProperty;
    };
  };
};
