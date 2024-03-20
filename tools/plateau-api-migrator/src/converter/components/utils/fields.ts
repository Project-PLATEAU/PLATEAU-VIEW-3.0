import { Cond, Legend, FieldComponent as View2FieldComponent } from "../../../types/view2";

export const checkIsSingleValue = <T>(condition: Cond<T>) =>
  (condition.operand === "true" || condition.operand === true) &&
  condition.operator === "===" &&
  (condition.value === "true" || condition.value === true);

export const findLegendTitleByColor = (
  view2Components: View2FieldComponent[],
  color: string,
): string | undefined => {
  const colorWithoutAlpha = color.length === 9 ? color.slice(0, -2) : color;
  const legendComponent = view2Components.find((c): c is Legend => c.type === "legend");
  if (!legendComponent) return;
  const item = legendComponent.items?.find(v => v.color === colorWithoutAlpha || v.color === color);
  return item?.title;
};

export const makeColorField = (view2Components: View2FieldComponent[], color: string) => {
  const legendTitle = findLegendTitleByColor(view2Components, color);
  return {
    defaultValue: color,
    asLegend: !!legendTitle,
    legendName: legendTitle,
  };
};

export const getPropertyName = (operand: string) =>
  operand.startsWith("${") && operand.endsWith("}")
    ? operand.slice(2, operand.length - 1)
    : operand;

// Ref: https://github.com/eukarya-inc/reearth-plateauview/blob/9e4b96a3f36f2f57732e1367de9a568be23127e6/plugin/web/extensions/sidebar/core/components/content/common/FieldComponent/Fields/general/CurrentTime.tsx#L13
export const formatDateTime = (d: string, t: string) => {
  const date = d
    ?.split(/-|\//)
    ?.map(s => s.padStart(2, "0"))
    ?.join("-");
  const Time = t
    ?.split(/:/)
    ?.map(s => s.padStart(2, "0"))
    ?.join(":");
  const dateStr = [date, Time].filter(s => !!s).join("T");

  try {
    return new Date(dateStr).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

export const removeQuote = (v: string) => {
  return (v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))
    ? v.slice(1, -1)
    : v;
};
