import { BasicFieldProps } from "..";
import { PropertyInfo } from "../../../../ui-components";

export const EditorTilesetDrawClippingField: React.FC<
  BasicFieldProps<"TILESET_DRAW_CLIPPING">
> = () => {
  return <PropertyInfo preset="no-settings" />;
};
