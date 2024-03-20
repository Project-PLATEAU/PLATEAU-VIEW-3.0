import { BasicFieldProps } from "..";
import { PropertyInfo } from "../../../../ui-components";

export const EditorDisableDefaultMaterialField: React.FC<
  BasicFieldProps<"TILESET_DISABLE_DEFAULT_MATERIAL">
> = () => {
  return <PropertyInfo preset="no-settings" />;
};
