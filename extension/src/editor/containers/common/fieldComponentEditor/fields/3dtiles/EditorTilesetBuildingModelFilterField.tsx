import { BasicFieldProps } from "..";
import { PropertyInfo } from "../../../../ui-components";

export const EditorTilesetBuildingModelFilterField: React.FC<
  BasicFieldProps<"TILESET_BUILDING_MODEL_FILTER">
> = () => {
  return <PropertyInfo preset="no-settings" />;
};
