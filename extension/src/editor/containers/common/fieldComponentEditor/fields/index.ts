import { SettingComponent } from "../../../../../shared/api/types";
import { ComponentBase } from "../../../../../shared/types/fieldComponents";

import { EditorTilesetApplyEmptySHCField } from "./3dtiles/EditorTilesetApplyEmptySHCField";
import { EditorTilesetBuildingModelColorField } from "./3dtiles/EditorTilesetBuildingModelColorField";
import { EditorTilesetBuildingModelFilterField } from "./3dtiles/EditorTilesetBuildingModelFilterField";
import { EditorTilesetClippingField } from "./3dtiles/EditorTilesetClippingField";
import { EditorDisableDefaultMaterialField } from "./3dtiles/EditorTilesetDisableDefaultMaterialField";
import { EditorTilesetDrawClippingField } from "./3dtiles/EditorTilesetDrawClippingField";
import { EditorTilesetFloodColorField } from "./3dtiles/EditorTilesetFloodColorField";
import { EditorTilesetFloodModelColorField } from "./3dtiles/EditorTilesetFloodModelColorField";
import { EditorTilesetFloodModelFilterField } from "./3dtiles/EditorTilesetFloodModelFilterField";
import { EditorTilesetWireframeField } from "./3dtiles/EditorTilesetWireframeField";
import { EditorCLassificationTypeField } from "./common/EditorClassificationTypeField";
import { EditorFillAndStrokeColorConditionField } from "./common/EditorFillAndStrokeColorConditionField";
import { EditorFillAndStrokeColorValueField } from "./common/EditorFillAndStrokeColorValueField";
import { EditorFillColorConditionField } from "./common/EditorFillColorConditionField";
import { EditorFillColorGradientField } from "./common/EditorFillColorGradientField";
import { EditorFillColorValueField } from "./common/EditorFillColorValueField";
import { EditorHeightReferenceField } from "./common/EditorHeightReferenceField";
import { EditorVisibilityConditionField } from "./common/EditorVisibilityConditionField";
import { EditorVisibilityFilterField } from "./common/EditorVisibilityFilterField";
import {
  FIELD_CATEGORY_GENERAL,
  FIELD_CATEGORY_POINT,
  FIELD_CATEGORY_POLYGON,
  FIELD_CATEGORY_POLYLINE,
  FIELD_CATEGORY_THREE_D_TILES,
  FIELD_GROUP_POINT_FILL_COLOR,
  FIELD_GROUP_POINT_USE_IMAGE,
  FIELD_GROUP_POINT_VISIBILITY,
  FIELD_GROUP_POLYGON_FILL_COLOR,
  FIELD_GROUP_POLYGON_VISIBILITY,
  FIELD_GROUP_POLYLINE_FILL_COLOR,
  FIELD_GROUP_POLYLINE_VISIBILITY,
  FIELD_GROUP_THREE_D_TILES_CLIPPING,
  FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
  FIELD_GROUP_THREE_D_TILES_FILTER,
  FILED_GROUP_GENERAL_TIMELINE,
  FieldGroupTypes,
  fieldGroupTitles,
} from "./constants";
import { EditorApplyTimeValueField } from "./general/EditorApplyTimeValueField";
import { EditorCustomLegendField } from "./general/EditorCustomLegendField";
import { EditorDatasetStoryField } from "./general/EditorDatasetStoryField";
import { EditorLayerDescriptionField } from "./general/EditorLayerDescriptionField";
import { EditorLegendDescriptionField } from "./general/EditorLegendDescriptionField";
import { EditorLinkButtonField } from "./general/EditorLinkButtonField";
import { EditorOpacityField } from "./general/EditorOpacityField";
import { EditorPrioritizePerformanceGeoJSONField } from "./general/EditorPrioritizePerformanceGeoJSONField";
import { EditorStyleCodeField } from "./general/EditorStyleCodeField";
import { EditorTimelineCustomizedField } from "./general/EditorTimelineCustomizedField";
import { EditorTimelineMonthField } from "./general/EditorTimelineMonthField";
import { EditorPointConvertFromCSVField } from "./point/EditorPointConvertFromCSVField";
import { EditorPointImageSizeField } from "./point/EditorPointImageSizeField";
import { EditorPointSizeField } from "./point/EditorPointSizeField";
import { EditorPointStrokeField } from "./point/EditorPointStrokeField";
import { EditorPointStyleField } from "./point/EditorPointStyleField";
import { EditorPointUse3DModelField } from "./point/EditorPointUse3DModelField";
import { EditorPointUseImageConditionField } from "./point/EditorPointUseImageConditionField";
import { EditorPointUseImageValueField } from "./point/EditorPointUseImageValueField";
import { EditorPointUseLabelField } from "./point/EditorPointUseLabelField";
import { EditorPolygonStrokeWeightField } from "./polygon/EditorPolygonStrokeWeightField";
import { EditorPolylineStrokeWeightField } from "./polyline/EditorPolygonStrokeWeightField";

export type BasicFieldProps<T extends ComponentBase["type"] = ComponentBase["type"]> = {
  component: SettingComponent<T>;
  onUpdate: (component: SettingComponent<T>) => void;
};

export type FieldType = ComponentBase["type"];

export const fields: {
  [key in ComponentBase["type"]]: {
    category: string;
    group?: FieldGroupTypes;
    name: string;
    Component: React.FC<BasicFieldProps<key>>;
  };
} = {
  // general
  OPACITY_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Transparency",
    Component: EditorOpacityField,
  },
  LAYER_DESCRIPTION_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Layer Description",
    Component: EditorLayerDescriptionField,
  },
  LEGEND_DESCRIPTION_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Legend Description",
    Component: EditorLegendDescriptionField,
  },
  STYLE_CODE_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Style Code",
    Component: EditorStyleCodeField,
  },
  APPLY_TIME_VALUE_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Apply Time Value",
    Component: EditorApplyTimeValueField,
  },
  TIMELINE_CUSTOMIZED_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    group: FILED_GROUP_GENERAL_TIMELINE,
    name: "Customized",
    Component: EditorTimelineCustomizedField,
  },
  TIMELINE_MONTH_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    group: FILED_GROUP_GENERAL_TIMELINE,
    name: "Month",
    Component: EditorTimelineMonthField,
  },
  PRIORITIZE_PERFORMANCE_GEOJSON_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Prioritize Performance (GeoJSON)",
    Component: EditorPrioritizePerformanceGeoJSONField,
  },
  LINK_BUTTON_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Link Button",
    Component: EditorLinkButtonField,
  },
  DATASET_STORY_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Dataset Story",
    Component: EditorDatasetStoryField,
  },
  CUSTOM_LEGEND_FIELD: {
    category: FIELD_CATEGORY_GENERAL,
    name: "Custom Legend",
    Component: EditorCustomLegendField,
  },
  // point
  POINT_VISIBILITY_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_VISIBILITY,
    name: "Condition",
    Component: EditorVisibilityConditionField as React.FC<
      BasicFieldProps<"POINT_VISIBILITY_CONDITION_FIELD">
    >,
  },
  POINT_VISIBILITY_FILTER_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_VISIBILITY,
    name: "Filter",
    Component: EditorVisibilityFilterField as React.FC<
      BasicFieldProps<"POINT_VISIBILITY_FILTER_FIELD">
    >,
  },
  POINT_FILL_COLOR_VALUE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_FILL_COLOR,
    name: "Value",
    Component: EditorFillColorValueField as React.FC<
      BasicFieldProps<"POINT_FILL_COLOR_VALUE_FIELD">
    >,
  },
  POINT_FILL_COLOR_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_FILL_COLOR,
    name: "Condition",
    Component: EditorFillColorConditionField as React.FC<
      BasicFieldProps<"POINT_FILL_COLOR_CONDITION_FIELD">
    >,
  },
  POINT_FILL_COLOR_GRADIENT_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_FILL_COLOR,
    name: "Gradient",
    Component: EditorFillColorGradientField as React.FC<
      BasicFieldProps<"POINT_FILL_COLOR_GRADIENT_FIELD">
    >,
  },
  POINT_USE_IMAGE_VALUE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_USE_IMAGE,
    name: "Value",
    Component: EditorPointUseImageValueField,
  },
  POINT_USE_IMAGE_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POINT,
    group: FIELD_GROUP_POINT_USE_IMAGE,
    name: "Condition",
    Component: EditorPointUseImageConditionField,
  },
  POINT_IMAGE_SIZE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Image Size",
    Component: EditorPointImageSizeField,
  },
  POINT_STYLE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Style",
    Component: EditorPointStyleField,
  },
  POINT_SIZE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Point Size",
    Component: EditorPointSizeField,
  },
  POINT_STROKE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Point Stroke",
    Component: EditorPointStrokeField,
  },
  POINT_USE_3D_MODEL: {
    category: FIELD_CATEGORY_POINT,
    name: "Use 3D Model",
    Component: EditorPointUse3DModelField,
  },
  POINT_USE_LABEL_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Use Label",
    Component: EditorPointUseLabelField,
  },
  POINT_CONVERT_FROM_CSV: {
    category: FIELD_CATEGORY_POINT,
    name: "Convert from CSV",
    Component: EditorPointConvertFromCSVField,
  },
  POINT_HEIGHT_REFERENCE_FIELD: {
    category: FIELD_CATEGORY_POINT,
    name: "Height Reference",
    Component: EditorHeightReferenceField as React.FC<
      BasicFieldProps<"POINT_HEIGHT_REFERENCE_FIELD">
    >,
  },
  // Polyline
  POLYLINE_STROKE_WEIGHT_FIELD: {
    category: FIELD_CATEGORY_POLYLINE,
    name: "Stroke Weight",
    Component: EditorPolylineStrokeWeightField,
  },
  POLYLINE_FILL_COLOR_VALUE_FIELD: {
    category: FIELD_CATEGORY_POLYLINE,
    group: FIELD_GROUP_POLYLINE_FILL_COLOR,
    name: "Value",
    Component: EditorFillColorValueField as React.FC<
      BasicFieldProps<"POLYLINE_FILL_COLOR_VALUE_FIELD">
    >,
  },
  POLYLINE_FILL_COLOR_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POLYLINE,
    group: FIELD_GROUP_POLYLINE_FILL_COLOR,
    name: "Condition",
    Component: EditorFillColorConditionField as React.FC<
      BasicFieldProps<"POLYLINE_FILL_COLOR_CONDITION_FIELD">
    >,
  },
  POLYLINE_VISIBILITY_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POLYLINE,
    group: FIELD_GROUP_POLYLINE_VISIBILITY,
    name: "Condition",
    Component: EditorVisibilityConditionField as React.FC<
      BasicFieldProps<"POLYLINE_VISIBILITY_CONDITION_FIELD">
    >,
  },
  POLYLINE_VISIBILITY_FILTER_FIELD: {
    category: FIELD_CATEGORY_POLYLINE,
    group: FIELD_GROUP_POLYLINE_VISIBILITY,
    name: "Filter",
    Component: EditorVisibilityFilterField as React.FC<
      BasicFieldProps<"POLYLINE_VISIBILITY_FILTER_FIELD">
    >,
  },
  POLYLINE_HEIGHT_REFERENCE_FIELD: {
    category: FIELD_CATEGORY_POLYLINE,
    name: "Height Reference",
    Component: EditorHeightReferenceField as React.FC<
      BasicFieldProps<"POLYLINE_HEIGHT_REFERENCE_FIELD">
    >,
  },
  POLYLINE_CLASSIFICATION_TYPE_FIELD: {
    category: FIELD_CATEGORY_POLYLINE,
    name: "Classification Type",
    Component: EditorCLassificationTypeField as React.FC<
      BasicFieldProps<"POLYLINE_CLASSIFICATION_TYPE_FIELD">
    >,
  },
  // Polygon
  POLYGON_FILL_COLOR_VALUE_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    group: FIELD_GROUP_POLYGON_FILL_COLOR,
    name: "Color Value",
    Component: EditorFillAndStrokeColorValueField as React.FC<
      BasicFieldProps<"POLYGON_FILL_COLOR_VALUE_FIELD">
    >,
  },
  POLYGON_FILL_COLOR_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    group: FIELD_GROUP_POLYGON_FILL_COLOR,
    name: "Color Condition",
    Component: EditorFillAndStrokeColorConditionField as React.FC<
      BasicFieldProps<"POLYGON_FILL_COLOR_CONDITION_FIELD">
    >,
  },
  POLYGON_STROKE_WEIGHT_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    name: "Stroke Weight",
    Component: EditorPolygonStrokeWeightField,
  },
  POLYGON_VISIBILITY_FILTER_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    group: FIELD_GROUP_POLYGON_VISIBILITY,
    name: "Filter",
    Component: EditorVisibilityFilterField as React.FC<
      BasicFieldProps<"POLYGON_VISIBILITY_FILTER_FIELD">
    >,
  },
  POLYGON_VISIBILITY_CONDITION_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    group: FIELD_GROUP_POLYGON_VISIBILITY,
    name: "Condition",
    Component: EditorVisibilityConditionField as React.FC<
      BasicFieldProps<"POLYGON_VISIBILITY_CONDITION_FIELD">
    >,
  },
  POLYGON_HEIGHT_REFERENCE_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    name: "Height Reference",
    Component: EditorHeightReferenceField as React.FC<
      BasicFieldProps<"POLYGON_HEIGHT_REFERENCE_FIELD">
    >,
  },
  POLYGON_CLASSIFICATION_TYPE_FIELD: {
    category: FIELD_CATEGORY_POLYGON,
    name: "Classification Type",
    Component: EditorCLassificationTypeField as React.FC<
      BasicFieldProps<"POLYGON_CLASSIFICATION_TYPE_FIELD">
    >,
  },
  // 3dtiles
  TILESET_BUILDING_MODEL_COLOR: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
    name: "Building model",
    Component: EditorTilesetBuildingModelColorField,
  },
  TILESET_FLOOD_MODEL_COLOR: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
    name: "Flood model",
    Component: EditorTilesetFloodModelColorField,
  },
  TILESET_FLOOD_COLOR_FIELD: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
    name: "Flood color",
    Component: EditorTilesetFloodColorField,
  },
  TILESET_FILL_COLOR_CONDITION_FIELD: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
    name: "Condition",
    Component: EditorFillColorConditionField as React.FC<
      BasicFieldProps<"TILESET_FILL_COLOR_CONDITION_FIELD">
    >,
  },
  TILESET_FILL_COLOR_GRADIENT_FIELD: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILL_COLOR,
    name: "Gradient",
    Component: EditorFillColorGradientField as React.FC<
      BasicFieldProps<"TILESET_FILL_COLOR_GRADIENT_FIELD">
    >,
  },
  TILESET_CLIPPING: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_CLIPPING,
    name: "Clipping",
    Component: EditorTilesetClippingField,
  },
  TILESET_DRAW_CLIPPING: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_CLIPPING,
    name: "Draw clipping",
    Component: EditorTilesetDrawClippingField,
  },
  TILESET_BUILDING_MODEL_FILTER: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILTER,
    name: "Building model",
    Component: EditorTilesetBuildingModelFilterField,
  },
  TILESET_FLOOD_MODEL_FILTER: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    group: FIELD_GROUP_THREE_D_TILES_FILTER,
    name: "Flood model",
    Component: EditorTilesetFloodModelFilterField,
  },
  TILESET_WIREFRAME: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    name: "Wireframe",
    Component: EditorTilesetWireframeField,
  },
  TILESET_DISABLE_DEFAULT_MATERIAL: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    name: "Disable Default Material",
    Component: EditorDisableDefaultMaterialField,
  },
  TILESET_APPLY_EMPTY_SHC: {
    category: FIELD_CATEGORY_THREE_D_TILES,
    name: "Apply Empty SHC",
    Component: EditorTilesetApplyEmptySHCField,
  },
};

export type FieldComponentTreeItem = {
  label: string;
  value: string;
  group?: FieldGroupTypes;
  isFolder?: boolean;
  children?: FieldComponentTreeItem[];
};

export type FieldComponentTree = FieldComponentTreeItem[];

export const getFiledComponentTree = () => {
  const tree: FieldComponentTreeItem[] = [];

  Object.entries(fields).forEach(([key, { category, group, name }]) => {
    if (!tree.find(item => item.value === category)) {
      tree.push({
        label: category,
        value: category,
        isFolder: true,
        children: [],
      });
    }
    const categoryItem = tree.find(item => item.value === category);
    if (group && !categoryItem?.children?.find(item => item.value === group)) {
      categoryItem?.children?.push({
        label: fieldGroupTitles[group],
        value: group,
        isFolder: true,
        children: [],
      });
    }
    if (group) {
      const groupItem = categoryItem?.children?.find(item => item.value === group);
      groupItem?.children?.push({
        label: name,
        value: key,
        group,
      });
    } else {
      categoryItem?.children?.push({
        label: name,
        value: key,
      });
    }
  });

  return tree;
};
