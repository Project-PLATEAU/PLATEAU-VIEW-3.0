import { styled } from "@mui/system";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { type FC, useCallback, useRef, SetStateAction, useMemo } from "react";

import {
  GroupedParameterItem,
  GroupedParameterItemRef,
  InspectorItem,
  ParameterList,
  SelectParameterItem,
  SketchPolygonIcon,
  SketchRectangleIcon,
  SliderParameterItem,
  SwitchParameterItem,
  TrashIcon,
} from "../../../../prototypes/ui-components";
import { toolAtom, toolMachineAtom } from "../../../../prototypes/view/states/tool";
import { useReEarthEvent } from "../../../reearth/hooks";
import { useSketch } from "../../../reearth/hooks/useSketch";
import { SketchFeature } from "../../../reearth/types";
import { TilesetDrawClippingField } from "../../../types/fieldComponents/3dtiles";
import { ViewButton } from "../../../ui-components/common";
import { LayerModel } from "../../../view-layers";
import { WritableAtomForComponent } from "../../../view-layers/component";

const DEFAULT_TOP = 100;
const DEFAULT_BOTTOM = 10;
const DEFAULT_MAX_TOP = 700;
const DEFAULT_MAX_BOTTOM = 200;

const directionOptions: ["inside" | "outside", string][] = [
  ["inside", "ボックス内"],
  ["outside", "ボックス外"],
];

export interface LayerTilesetDrawClippingFieldProps {
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<TilesetDrawClippingField>[];
}

export const LayerTilesetDrawClippingField: FC<LayerTilesetDrawClippingFieldProps> = ({
  atoms,
}) => {
  const [component, setComponent] = useAtom(atoms[0]);
  const { enabled, visible, direction, top, bottom } = component.value;

  const topAtom = atom(
    () => top ?? DEFAULT_TOP,
    (_, __, action: SetStateAction<number>) => {
      if (typeof action !== "function") {
        setComponent({
          ...component,
          value: { ...component.value, top: action },
        });
      }
    },
  );

  const maxTopRef = useRef(DEFAULT_MAX_TOP);
  const maxTop = useMemo(() => {
    if (top && top > maxTopRef.current) {
      maxTopRef.current = top;
    }
    return maxTopRef.current;
  }, [top]);

  const bottomAtom = atom(
    () => bottom ?? DEFAULT_BOTTOM,
    (_, __, action: SetStateAction<number>) => {
      if (typeof action !== "function") {
        setComponent({
          ...component,
          value: { ...component.value, bottom: action },
        });
      }
    },
  );

  const visibleAtom = atom(
    () => !!visible,
    (_, __, action: SetStateAction<boolean>) => {
      if (typeof action !== "function") {
        setComponent({
          ...component,
          value: { ...component.value, visible: action },
        });
      }
    },
  );

  const enabledAtom = atom(
    () => !!enabled,
    (_, __, action: SetStateAction<boolean>) => {
      if (typeof action !== "function") {
        setComponent({
          ...component,
          value: { ...component.value, enabled: action },
        });
      }
    },
  );

  const directionAtom = atom(
    () => direction ?? "inside",
    (_, __, action: SetStateAction<"inside" | "outside">) => {
      if (typeof action !== "function") {
        setComponent({
          ...component,
          value: { ...component.value, direction: action },
        });
      }
    },
  );

  const toolType = useAtomValue(toolAtom);
  const send = useSetAtom(toolMachineAtom);

  const isDrawing = useRef(false);
  const { handleSetType, handleSetColor, handleDisableShadow, handleEnableRelativeHeight } =
    useSketch();

  const handleDraw = useCallback(
    (type: "extrudedRectangle" | "extrudedPolygon") => {
      // There's no proper mode for this UX, currently just use hand
      if (toolType?.type !== "hand") {
        send({ type: "HAND" });
      }
      GroupedParameterItemRef.current?.closePopover();
      isDrawing.current = true;

      // Need to delay the option set since settings could be changed with type change.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          handleDisableShadow(true);
          handleEnableRelativeHeight(true);
          handleSetColor("#00BEBE11");
          handleSetType(type);
        });
      });
    },
    [
      toolType,
      send,
      handleSetType,
      handleSetColor,
      handleDisableShadow,
      handleEnableRelativeHeight,
    ],
  );

  const handleDrawRectangle = useCallback(() => {
    handleDraw("extrudedRectangle");
  }, [handleDraw]);

  const handleDrawPolygon = useCallback(() => {
    handleDraw("extrudedPolygon");
  }, [handleDraw]);

  const handleRemove = useCallback(() => {
    setComponent({
      ...component,
      value: {
        ...component.value,
        drawGeometryCoordinates: [],
      },
    });
    maxTopRef.current = DEFAULT_MAX_TOP;
  }, [component, setComponent]);

  const handleSketchFeatureCreated = useCallback(
    (e: { feature?: SketchFeature }) => {
      if (isDrawing.current) {
        isDrawing.current = false;
        if (!e.feature?.geometry.coordinates || e.feature?.geometry.type !== "Polygon") return;
        setComponent({
          ...component,
          value: {
            ...component.value,
            enabled: true,
            visible: true,
            drawGeometryCoordinates: e.feature.geometry.coordinates[0].map(p => [p[0], p[1]]),
            top: e.feature.properties.extrudedHeight ?? DEFAULT_TOP,
            bottom: e.feature.properties.extrudedHeight ? 0 : DEFAULT_BOTTOM,
          },
        });
      }
    },
    [component, setComponent],
  );

  useReEarthEvent("sketchfeaturecreated", handleSketchFeatureCreated);

  const GroupedParameterItemRef = useRef<GroupedParameterItemRef>(null);

  const hasDrawClipping = useMemo(
    () =>
      component?.value?.drawGeometryCoordinates &&
      component.value.drawGeometryCoordinates.length > 0,
    [component?.value],
  );

  return (
    <GroupedParameterItem label="クリッピング" ref={GroupedParameterItemRef}>
      <InspectorItem sx={{ width: 320 }} level={2}>
        <ParameterList>
          {hasDrawClipping ? (
            <ViewButton onClick={handleRemove} variant="outlined" fullWidth>
              <TrashIcon />
              スペースを消す
            </ViewButton>
          ) : (
            <ButtonWrapper>
              <ViewButton onClick={handleDrawRectangle} variant="outlined" fullWidth>
                <SketchRectangleIcon />
                立方体スペース
              </ViewButton>
              <ViewButton onClick={handleDrawPolygon} variant="outlined" fullWidth>
                <SketchPolygonIcon />
                自由形状スペース
              </ViewButton>
            </ButtonWrapper>
          )}
        </ParameterList>
        {hasDrawClipping && (
          <ParameterList>
            <SwitchParameterItem label="クリッピング" atom={enabledAtom} />
            <SwitchParameterItem
              label="クリップボックスを表示"
              atom={visibleAtom}
              disabled={!enabled}
            />
            <SliderParameterItem
              label={"地形からの高さ"}
              atom={topAtom}
              min={0}
              max={maxTop}
              step={1}
              allowFloat={false}
              disabled={!enabled}
            />
            <SliderParameterItem
              label={"地形からの深さ"}
              atom={bottomAtom}
              min={0}
              max={DEFAULT_MAX_BOTTOM}
              step={1}
              allowFloat={false}
              disabled={!enabled}
            />
            <SelectParameterItem
              label="トリミング方向"
              atom={directionAtom}
              items={directionOptions}
              disabled={!enabled}
            />
          </ParameterList>
        )}
      </InspectorItem>
    </GroupedParameterItem>
  );
};

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(0.5),
}));
