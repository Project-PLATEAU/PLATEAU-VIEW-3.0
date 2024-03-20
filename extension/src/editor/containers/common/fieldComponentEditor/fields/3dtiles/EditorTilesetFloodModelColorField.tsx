import { BasicFieldProps } from "..";
import { PropertyInfo } from "../../../../ui-components";

export const EditorTilesetFloodModelColorField: React.FC<
  BasicFieldProps<"TILESET_FLOOD_MODEL_COLOR">
> = () => {
  return <PropertyInfo preset="no-settings" />;
};
