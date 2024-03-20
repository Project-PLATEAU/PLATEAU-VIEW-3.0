import { Divider } from "@mui/material";
import { FC } from "react";

import { type LayerModel as PrototypeLayerModel } from "../../../prototypes/layers";
import { InspectorItem } from "../../../prototypes/ui-components";
import { BuildingLayerColorSection } from "../../../prototypes/view/selection/BuildingLayerColorSection";
import {
  TILESET_BUILDING_MODEL_COLOR,
  TILESET_BUILDING_MODEL_FILTER,
  TILESET_CLIPPING,
  TILESET_FILL_COLOR_CONDITION_FIELD,
  TILESET_FILL_COLOR_GRADIENT_FIELD,
  TILESET_FLOOD_MODEL_COLOR,
  TILESET_FLOOD_MODEL_FILTER,
} from "../../types/fieldComponents/3dtiles";
import {
  LAYER_DESCRIPTION_FIELD,
  APPLY_TIME_VALUE_FIELD,
  LINK_BUTTON_FIELD,
  OPACITY_FIELD,
  TIMELINE_CUSTOMIZED_FIELD,
  TIMELINE_MONTH_FIELD,
  DATASET_STORY_FIELD,
} from "../../types/fieldComponents/general";
import {
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
  POINT_USE_IMAGE_CONDITION_FIELD,
  POINT_VISIBILITY_FILTER_FIELD,
} from "../../types/fieldComponents/point";
import {
  POLYGON_FILL_COLOR_CONDITION_FIELD,
  POLYGON_VISIBILITY_FILTER_FIELD,
} from "../../types/fieldComponents/polygon";
import {
  POLYLINE_FILL_COLOR_CONDITION_FIELD,
  POLYLINE_VISIBILITY_FILTER_FIELD,
} from "../../types/fieldComponents/polyline";
import { LayerModel } from "../../view-layers";
import { ComponentAtom } from "../../view-layers/component";
import { useIsMultipleSelectableField } from "../hooks/useIsMultipleSelectableField";
import { BuildingFilterSection } from "../selection/BuildingFilterSection";

import { LayerTilesetClippingField } from "./3dtiles/LayerTilesetClippingField";
// import { LayerTilesetFillColorConditionField } from "./3dtiles/LayerTilesetFillColorConditionField";
// import { LayerTilesetFillGradientColorField } from "./3dtiles/LayerTilesetFillGradientColorField";
// import { LayerApplyTimeValueField } from "./general/LayerApplyTimeValueField";
// import { LayerDatasetStoryField } from "./general/LayerDatasetStoryField";
// import { LayerLayerDescriptionField } from "./general/LayerLayerDescriptionField";
// import { LayerLinkButtonField } from "./general/LayerLinkButtonField";
import { LayerOpacityField } from "./general/LayerOpacityField";
// import { LayerTimelineCustomizedField } from "./general/LayerTimelineCustomizedField";
// import { LayerTimelineMonthField } from "./general/LayerTimelineMonthField";
// import { LayerPointFillColorConditionField } from "./point/LayerPointFillColorConditionField";
// import { LayerPointFillGradientColorField } from "./point/LayerPointFillGradientColorField";
// import { LayerPointUseImageConditionField } from "./point/LayerPointUseImageConditionField";
// import { LayerPointVisibilityFilterField } from "./point/LayerPointVisibilityFilterField";
// import { LayerPolygonFillColorConditionField } from "./polygon/LayerPolygonFillColorConditionField";
// import { LayerPolygonVisibilityFilterField } from "./polygon/LayerPolygonVisibilityFilterField";
// import { LayerPolylineFillColorConditionField } from "./polyline/LayerPolylineFillColorConditionField";
// import { LayerPolylineVisibilityFilterField } from "./polyline/LayerPolylineVisibilityFilterField";

type Props = {
  layers: readonly LayerModel[];
  type: ComponentAtom["type"];
  atoms: ComponentAtom["atom"][];
};

export const Fields: FC<Props> = ({ layers, type, atoms }) => {
  const isMutipleSelectable = useIsMultipleSelectableField({ layers, type });
  if (!isMutipleSelectable) {
    return null;
  }

  let component;
  switch (type) {
    // General
    case OPACITY_FIELD: {
      component = <LayerOpacityField atoms={atoms as ComponentAtom<"OPACITY_FIELD">["atom"][]} />;
      break;
    }
    // case LAYER_DESCRIPTION_FIELD: {
    //   component = (
    //     <LayerLayerDescriptionField
    //       atoms={atoms as ComponentAtom<"LAYER_DESCRIPTION_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // case APPLY_TIME_VALUE_FIELD: {
    //   component = (
    //     <LayerApplyTimeValueField
    //       atoms={atoms as ComponentAtom<"APPLY_TIME_VALUE_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // case TIMELINE_CUSTOMIZED_FIELD: {
    //   component = (
    //     <LayerTimelineCustomizedField
    //       atoms={atoms as ComponentAtom<"TIMELINE_CUSTOMIZED_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // case TIMELINE_MONTH_FIELD: {
    //   component = (
    //     <LayerTimelineMonthField atoms={atoms as ComponentAtom<"TIMELINE_MONTH_FIELD">["atom"][]} />
    //   );
    //   break;
    // }
    // case LINK_BUTTON_FIELD: {
    //   component = (
    //     <LayerLinkButtonField atoms={atoms as ComponentAtom<"LINK_BUTTON_FIELD">["atom"][]} />
    //   );
    //   break;
    // }
    // case DATASET_STORY_FIELD: {
    //   component = (
    //     <LayerDatasetStoryField atoms={atoms as ComponentAtom<"DATASET_STORY_FIELD">["atom"][]} />
    //   );
    //   break;
    // }
    // // Point
    // case POINT_FILL_COLOR_CONDITION_FIELD: {
    //   component = (
    //     <LayerPointFillColorConditionField
    //       layers={layers}
    //       atoms={atoms as ComponentAtom<"POINT_FILL_COLOR_CONDITION_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // case POINT_FILL_COLOR_GRADIENT_FIELD: {
    //   component = (
    //     <LayerPointFillGradientColorField
    //       layers={layers}
    //       atoms={atoms as ComponentAtom<"POINT_FILL_COLOR_GRADIENT_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // case POINT_VISIBILITY_FILTER_FIELD: {
    //   component = (
    //     <LayerPointVisibilityFilterField
    //       layers={layers}
    //       atoms={atoms as ComponentAtom<"POINT_VISIBILITY_FILTER_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // case POINT_USE_IMAGE_CONDITION_FIELD: {
    //   component = (
    //     <LayerPointUseImageConditionField
    //       layers={layers}
    //       atoms={atoms as ComponentAtom<"POINT_USE_IMAGE_CONDITION_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // // Polyline
    // case POLYLINE_FILL_COLOR_CONDITION_FIELD: {
    //   component = (
    //     <LayerPolylineFillColorConditionField
    //       layers={layers}
    //       atoms={atoms as ComponentAtom<"POLYLINE_FILL_COLOR_CONDITION_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // case POLYLINE_VISIBILITY_FILTER_FIELD: {
    //   component = (
    //     <LayerPolylineVisibilityFilterField
    //       layers={layers}
    //       atoms={atoms as ComponentAtom<"POLYLINE_VISIBILITY_FILTER_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // // Polygon
    // case POLYGON_FILL_COLOR_CONDITION_FIELD: {
    //   component = (
    //     <LayerPolygonFillColorConditionField
    //       layers={layers}
    //       atoms={atoms as ComponentAtom<"POLYGON_FILL_COLOR_CONDITION_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // case POLYGON_VISIBILITY_FILTER_FIELD: {
    //   component = (
    //     <LayerPolygonVisibilityFilterField
    //       layers={layers}
    //       atoms={atoms as ComponentAtom<"POLYGON_VISIBILITY_FILTER_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // Tileset
    case TILESET_BUILDING_MODEL_COLOR:
    case TILESET_FLOOD_MODEL_COLOR: {
      component = <BuildingLayerColorSection layers={layers as PrototypeLayerModel[]} />;
      break;
    }
    // case TILESET_FILL_COLOR_CONDITION_FIELD: {
    //   component = (
    //     <LayerTilesetFillColorConditionField
    //       layers={layers}
    //       atoms={atoms as ComponentAtom<"TILESET_FILL_COLOR_CONDITION_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    // case TILESET_FILL_COLOR_GRADIENT_FIELD: {
    //   component = (
    //     <LayerTilesetFillGradientColorField
    //       layers={layers}
    //       atoms={atoms as ComponentAtom<"TILESET_FILL_COLOR_GRADIENT_FIELD">["atom"][]}
    //     />
    //   );
    //   break;
    // }
    case TILESET_CLIPPING: {
      component = (
        <LayerTilesetClippingField
          layers={layers}
          atoms={atoms as ComponentAtom<"TILESET_CLIPPING">["atom"][]}
        />
      );
      break;
    }
    case TILESET_BUILDING_MODEL_FILTER: {
      component = (
        <BuildingFilterSection
          type="number"
          label="フィルター（建物モデル）"
          layers={layers}
          atoms={
            atoms as ComponentAtom<
              "TILESET_BUILDING_MODEL_FILTER" | "TILESET_FLOOD_MODEL_FILTER"
            >["atom"][]
          }
        />
      );
      break;
    }
    case TILESET_FLOOD_MODEL_FILTER: {
      component = (
        <BuildingFilterSection
          type="qualitative"
          label="フィルター（浸水想定区域）"
          layers={layers}
          atoms={
            atoms as ComponentAtom<
              "TILESET_BUILDING_MODEL_FILTER" | "TILESET_FLOOD_MODEL_FILTER"
            >["atom"][]
          }
        />
      );
      break;
    }
  }

  if (!component) return null;

  return (
    <>
      <Divider />
      <InspectorItem>{component}</InspectorItem>
    </>
  );
};
