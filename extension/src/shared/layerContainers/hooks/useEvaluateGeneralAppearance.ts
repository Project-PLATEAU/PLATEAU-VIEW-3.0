import { merge } from "lodash-es";
import { useMemo } from "react";

import { useOptionalAtomValue } from "../../hooks";
import { GeneralAppearances } from "../../reearth/layers";
import {
  TILESET_CLIPPING,
  TILESET_FILL_COLOR_CONDITION_FIELD,
  TILESET_FILL_COLOR_GRADIENT_FIELD,
  TILESET_WIREFRAME,
  TILESET_DISABLE_DEFAULT_MATERIAL,
  TILESET_DRAW_CLIPPING,
  TILESET_APPLY_EMPTY_SHC,
} from "../../types/fieldComponents/3dtiles";
import { OPACITY_FIELD, STYLE_CODE_FIELD } from "../../types/fieldComponents/general";
import {
  POINT_FILL_COLOR_VALUE_FIELD,
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
  POINT_SIZE_FIELD,
  POINT_STYLE_FIELD,
  POINT_VISIBILITY_FILTER_FIELD,
  POINT_USE_IMAGE_VALUE_FIELD,
  POINT_USE_IMAGE_CONDITION_FIELD,
  POINT_IMAGE_SIZE_FIELD,
  POINT_USE_3D_MODEL,
  POINT_VISIBILITY_CONDITION_FIELD,
  POINT_USE_LABEL_FIELD,
  POINT_HEIGHT_REFERENCE_FIELD,
  POINT_STROKE_FIELD,
} from "../../types/fieldComponents/point";
import {
  POLYGON_CLASSIFICATION_TYPE_FIELD,
  POLYGON_FILL_COLOR_CONDITION_FIELD,
  POLYGON_FILL_COLOR_VALUE_FIELD,
  POLYGON_HEIGHT_REFERENCE_FIELD,
  POLYGON_STROKE_WEIGHT_FIELD,
  POLYGON_VISIBILITY_CONDITION_FIELD,
  POLYGON_VISIBILITY_FILTER_FIELD,
} from "../../types/fieldComponents/polygon";
import {
  POLYLINE_CLASSIFICATION_TYPE_FIELD,
  POLYLINE_FILL_COLOR_CONDITION_FIELD,
  POLYLINE_FILL_COLOR_VALUE_FIELD,
  POLYLINE_HEIGHT_REFERENCE_FIELD,
  POLYLINE_STROKE_WEIGHT_FIELD,
  POLYLINE_VISIBILITY_CONDITION_FIELD,
  POLYLINE_VISIBILITY_FILTER_FIELD,
} from "../../types/fieldComponents/polyline";
import { ComponentAtom } from "../../view-layers/component";
import { useFindComponent } from "../../view-layers/hooks";
import {
  DEFAULT_COLOR,
  makeConditionalExpression,
  makeConditionalImageColorExpression,
  makeConditionalImageExpression,
  makeGradientExpression,
  makeLabelTextExpression,
  makeSimpleColorValue,
  makeSimpleColorWithOpacity,
  makeSimpleValueForStrokeColor,
  makeStrokeColorConditionalExpression,
  makeVisibilityConditionExpression,
  makeVisibilityFilterExpression,
} from "../utils/value";

import { useClippingBox } from "./useClippingBox";
import { useDrawClipping } from "./useDrawClipping";

export const useEvaluateGeneralAppearance = ({
  componentAtoms,
}: {
  componentAtoms: ComponentAtom[] | undefined;
}) => {
  // Point
  const pointStyle = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_STYLE_FIELD),
  );
  const pointColor = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_FILL_COLOR_VALUE_FIELD),
  );
  const pointSize = useOptionalAtomValue(useFindComponent(componentAtoms ?? [], POINT_SIZE_FIELD));
  const pointStroke = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_STROKE_FIELD),
  );
  const pointFillColorCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_FILL_COLOR_CONDITION_FIELD),
  );
  const pointFillGradientColor = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_FILL_COLOR_GRADIENT_FIELD),
  );
  const pointVisibilityCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_VISIBILITY_CONDITION_FIELD),
  );
  const pointVisibilityFilter = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_VISIBILITY_FILTER_FIELD),
  );
  const pointImageValue = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_USE_IMAGE_VALUE_FIELD),
  );
  const pointImageCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_USE_IMAGE_CONDITION_FIELD),
  );
  const pointImageSize = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_IMAGE_SIZE_FIELD),
  );
  const pointModel = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_USE_3D_MODEL),
  );
  const pointLabel = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_USE_LABEL_FIELD),
  );
  const pointHeightReference = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POINT_HEIGHT_REFERENCE_FIELD),
  );

  // Polyline
  const polylineColor = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_FILL_COLOR_VALUE_FIELD),
  );
  const polylineStrokeWeight = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_STROKE_WEIGHT_FIELD),
  );
  const polylineFillColorCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_FILL_COLOR_CONDITION_FIELD),
  );
  const polylineVisibilityCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_VISIBILITY_CONDITION_FIELD),
  );
  const polylineVisibilityFilter = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_VISIBILITY_FILTER_FIELD),
  );
  const polylineHeightReference = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_HEIGHT_REFERENCE_FIELD),
  );
  const polylineClassificationType = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYLINE_CLASSIFICATION_TYPE_FIELD),
  );

  // Polygon
  const polygonFillAndStrokeColor = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_FILL_COLOR_VALUE_FIELD),
  );
  const polygonFillAndStrokeColorCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_FILL_COLOR_CONDITION_FIELD),
  );
  const polygonStrokeWeight = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_STROKE_WEIGHT_FIELD),
  );
  const polygonVisibilityCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_VISIBILITY_CONDITION_FIELD),
  );
  const polygonVisibilityFilter = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_VISIBILITY_FILTER_FIELD),
  );
  const polygonHeightReference = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_HEIGHT_REFERENCE_FIELD),
  );
  const polygonClassificationType = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], POLYGON_CLASSIFICATION_TYPE_FIELD),
  );

  // Tileset
  const tilesetFillColorCondition = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], TILESET_FILL_COLOR_CONDITION_FIELD),
  );
  const tilesetFillGradientColor = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], TILESET_FILL_COLOR_GRADIENT_FIELD),
  );
  const [clippingBox, boxAppearance] = useClippingBox(
    useOptionalAtomValue(useFindComponent(componentAtoms ?? [], TILESET_CLIPPING)),
  );
  const drawClipping = useDrawClipping(
    useOptionalAtomValue(useFindComponent(componentAtoms ?? [], TILESET_DRAW_CLIPPING)),
  );

  const tilesetWireframe = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], TILESET_WIREFRAME),
  );

  const tilesetDisableDefaultMaterial = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], TILESET_DISABLE_DEFAULT_MATERIAL),
  );
  const tilesetApplyEmptySHC = useOptionalAtomValue(
    useFindComponent(componentAtoms ?? [], TILESET_APPLY_EMPTY_SHC),
  );

  // General
  const opacity = useOptionalAtomValue(useFindComponent(componentAtoms ?? [], OPACITY_FIELD));

  const styleCode = useOptionalAtomValue(useFindComponent(componentAtoms ?? [], STYLE_CODE_FIELD));

  const appearanceObjectFromStyleCode = useMemo(
    () =>
      getAppearanceObject(
        styleCode?.preset?.code,
        styleCode?.value?.opacity ?? styleCode?.preset?.defaultOpacity,
      ) ?? {},
    [styleCode],
  );

  const generalAppearances: GeneralAppearances = useMemo(
    () =>
      merge({}, appearanceObjectFromStyleCode, {
        marker: {
          style: pointStyle?.preset?.style,
          pointColor:
            makeSimpleColorValue(pointColor, opacity?.value ?? opacity?.preset?.defaultValue) ??
            makeConditionalExpression(
              pointFillColorCondition,
              opacity?.value ?? opacity?.preset?.defaultValue,
            ) ??
            makeGradientExpression(
              pointFillGradientColor,
              opacity?.value ?? opacity?.preset?.defaultValue,
            ) ??
            makeSimpleColorWithOpacity(opacity, DEFAULT_COLOR),
          pointSize: pointSize?.preset?.defaultValue,
          pointOutlineColor:
            makeSimpleColorWithOpacity(opacity, pointStroke?.preset?.color) ??
            pointStroke?.preset?.color,
          pointOutlineWidth: pointStroke?.preset?.width,
          image:
            pointImageValue?.preset?.imageURL ??
            makeConditionalImageExpression(pointImageCondition),
          imageColor:
            makeSimpleColorWithOpacity(opacity, pointImageValue?.preset?.imageColor) ??
            pointImageValue?.preset?.imageColor ??
            makeConditionalImageColorExpression(
              pointImageCondition,
              opacity?.value ?? opacity?.preset?.defaultValue,
            ),
          imageSize: pointImageSize?.preset?.defaultValue,
          imageSizeInMeters: pointImageSize?.preset?.enableSizeInMeters,
          show:
            makeVisibilityFilterExpression(pointVisibilityFilter) ??
            makeVisibilityConditionExpression(pointVisibilityCondition),
          label: pointLabel?.preset?.textExpression ? true : undefined,
          labelText: makeLabelTextExpression(pointLabel),
          labelTypography: {
            fontSize: pointLabel?.preset?.fontSize,
            color:
              makeSimpleColorWithOpacity(opacity, pointLabel?.preset?.fontColor) ??
              pointLabel?.preset?.fontColor,
          },
          labelBackground: pointLabel?.preset?.background,
          labelBackgroundColor:
            makeSimpleColorWithOpacity(opacity, pointLabel?.preset?.backgroundColor) ??
            pointLabel?.preset?.backgroundColor,
          height: pointLabel?.preset?.height,
          extrude: pointLabel?.preset?.extruded,
          heightReference: pointHeightReference?.preset?.defaultValue,
        },
        polyline: {
          strokeColor:
            makeSimpleColorValue(polylineColor, opacity?.value ?? opacity?.preset?.defaultValue) ??
            makeConditionalExpression(
              polylineFillColorCondition,
              opacity?.value ?? opacity?.preset?.defaultValue,
            ) ??
            makeSimpleColorWithOpacity(opacity, DEFAULT_COLOR),
          strokeWidth: polylineStrokeWeight?.preset?.defaultValue,
          show:
            makeVisibilityFilterExpression(polylineVisibilityFilter) ??
            makeVisibilityConditionExpression(polylineVisibilityCondition),
          clampToGround: polylineHeightReference?.preset?.defaultValue
            ? polylineHeightReference?.preset?.defaultValue === "clamp"
              ? true
              : false
            : undefined,
          classificationType: polylineClassificationType?.preset?.defaultValue,
        },
        polygon: {
          fillColor:
            makeSimpleColorValue(
              polygonFillAndStrokeColor,
              opacity?.value ?? opacity?.preset?.defaultValue,
            ) ??
            makeConditionalExpression(
              polygonFillAndStrokeColorCondition,
              opacity?.value ?? opacity?.preset?.defaultValue,
            ) ??
            makeSimpleColorWithOpacity(opacity, DEFAULT_COLOR),
          strokeColor:
            makeSimpleValueForStrokeColor(
              polygonFillAndStrokeColor,
              opacity?.value ?? opacity?.preset?.defaultValue,
            ) ??
            makeStrokeColorConditionalExpression(
              polygonFillAndStrokeColorCondition,
              opacity?.value ?? opacity?.preset?.defaultValue,
            ) ??
            makeSimpleColorWithOpacity(opacity, DEFAULT_COLOR),
          strokeWidth: polygonStrokeWeight?.preset?.defaultValue,
          stroke: !!polygonFillAndStrokeColor?.preset?.strokeValue || !!polygonStrokeWeight,
          show:
            makeVisibilityFilterExpression(polygonVisibilityFilter) ??
            makeVisibilityConditionExpression(polygonVisibilityCondition),
          heightReference: polygonHeightReference?.preset?.defaultValue,
          classificationType: polygonClassificationType?.preset?.defaultValue,
        },
        model: pointModel?.preset
          ? {
              url: pointModel.preset.url,
              scale: pointModel.preset.size,
            }
          : undefined,
        "3dtiles": {
          pbr: tilesetDisableDefaultMaterial ? false : undefined,
          color:
            makeConditionalExpression(
              tilesetFillColorCondition,
              opacity?.value ?? opacity?.preset?.defaultValue,
            ) ??
            makeGradientExpression(
              tilesetFillGradientColor,
              opacity?.value ?? opacity?.preset?.defaultValue,
            ) ??
            makeSimpleColorWithOpacity(opacity, DEFAULT_COLOR),
          experimental_clipping: { ...clippingBox, ...drawClipping },
          disableSelection: clippingBox?.disabledSelection,
          showWireframe: tilesetWireframe?.value?.wireframe,
          ...(tilesetApplyEmptySHC ? { sphericalHarmonicCoefficients: [] } : {}),
        },
        box: boxAppearance,
      }),
    [
      appearanceObjectFromStyleCode,
      pointStyle?.preset?.style,
      pointColor,
      pointFillColorCondition,
      pointFillGradientColor,
      pointSize?.preset?.defaultValue,
      pointStroke?.preset?.color,
      pointStroke?.preset?.width,
      pointImageValue?.preset?.imageURL,
      pointImageValue?.preset?.imageColor,
      pointImageCondition,
      pointImageSize?.preset?.defaultValue,
      pointImageSize?.preset?.enableSizeInMeters,
      pointVisibilityFilter,
      pointVisibilityCondition,
      pointLabel,
      pointHeightReference?.preset?.defaultValue,
      polylineColor,
      polylineFillColorCondition,
      polylineStrokeWeight?.preset?.defaultValue,
      polylineVisibilityFilter,
      polylineVisibilityCondition,
      polylineHeightReference?.preset?.defaultValue,
      polylineClassificationType?.preset?.defaultValue,
      polygonFillAndStrokeColor,
      polygonFillAndStrokeColorCondition,
      polygonStrokeWeight,
      polygonVisibilityFilter,
      polygonVisibilityCondition,
      polygonHeightReference?.preset?.defaultValue,
      polygonClassificationType?.preset?.defaultValue,
      pointModel?.preset,
      tilesetFillColorCondition,
      tilesetFillGradientColor,
      clippingBox,
      drawClipping,
      tilesetWireframe?.value?.wireframe,
      tilesetDisableDefaultMaterial,
      tilesetApplyEmptySHC,
      boxAppearance,
      opacity,
    ],
  );

  return generalAppearances;
};

const getAppearanceObject = (code: string | undefined, opacity: number | undefined) => {
  if (!code) return undefined;
  try {
    if (opacity !== undefined) {
      code = code
        // color('#FF0', 1)
        // color('#ff0000', 1)
        // color('#ff0000', 0.1)
        // color('#ff0000')
        .replace(
          /color\('(#(\w{6}|\w{3}))'(,\s*\d+(?:\.\d+)?)?\)/g,
          (_, p1) => `color('${p1}', ${opacity})`,
        )
        // color('white')
        .replace(
          /color\('(white|black|silver|gray|maroon|red|purple|fuchsia|green|lime|olive|blue|yellow|navy|teal|aqua|)'(,\s*\d+(?:\.\d+)?)?\)/g,
          (_, p1) => `color('${p1}', ${opacity})`,
        )
        // rgba(209, 94, 212, 1)
        .replace(
          /rgba\((\d+,\s*\d+,\s*\d+),\s*\d+(?:\.\d+)?\)/g,
          (_, p1) => `rgba(${p1}, ${opacity})`,
        )
        // rgb(209, 94, 212)
        .replace(/rgb\((\d+,\s*\d+,\s*\d+)\)/g, (_, p1) => `rgba(${p1}, ${opacity})`)
        // hsla(1.0, 0.5, 0.5, 1)
        .replace(
          /hsla\((\d+(?:\.\d+)?,\s*\d+(?:\.\d+)?,\s*\d+(?:\.\d+)?),\s*\d+(?:\.\d+)?\)/g,
          (_, p1) => `hsla(${p1}, ${opacity})`,
        )
        // hsl(1.0, 0.5, 0.5)
        .replace(
          /hsl\((\d+(?:\.\d+)?,\s*\d+(?:\.\d+)?,\s*\d+(?:\.\d+)?)\)/g,
          (_, p1) => `hsla(${p1}, ${opacity})`,
        );
    }
    return JSON.parse(code) as GeneralAppearances;
  } catch (error) {
    return undefined;
  }
};
