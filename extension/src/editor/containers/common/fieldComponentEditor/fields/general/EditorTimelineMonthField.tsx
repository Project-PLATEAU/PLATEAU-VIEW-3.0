import { BasicFieldProps } from "..";
import { PropertyBox, PropertyInfo, PropertyWrapper } from "../../../../ui-components";

export const EditorTimelineMonthField: React.FC<BasicFieldProps<"TIMELINE_MONTH_FIELD">> = () => {
  return (
    <PropertyWrapper>
      <PropertyBox>
        <PropertyInfo preset="no-settings" />
      </PropertyBox>
    </PropertyWrapper>
  );
};
