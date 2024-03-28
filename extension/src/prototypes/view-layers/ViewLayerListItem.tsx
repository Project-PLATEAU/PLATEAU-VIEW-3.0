import { IconButton, Tooltip } from "@mui/material";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { memo, useCallback, useMemo, type FC, type SyntheticEvent } from "react";

import { useOptionalAtomValue } from "../../shared/hooks";
import { flyToCamera, flyToLayerId, lookAtXYZ } from "../../shared/reearth/utils";
import { findRootLayerAtom } from "../../shared/states/rootLayer";
import { removeLayerAtom, type LayerProps, type LayerType } from "../layers";
import { ColorMapIcon, ColorSetIcon, ImageIconSetIcon, LayerListItem } from "../ui-components";
import { CustomLegendSetIcon } from "../ui-components/CustomLegendSetIcon";

import { layerTypeIcons } from "./layerTypeIcons";
import { STORY_LAYER } from "./layerTypes";
import {
  colorSchemeSelectionAtom,
  customLegendSchemeSelectionAtom,
  highlightedLayersAtom,
  imageSchemeSelectionAtom,
} from "./states";

function stopPropagation(event: SyntheticEvent): void {
  event.stopPropagation();
}

export type ViewLayerListItemProps<T extends LayerType = LayerType> = LayerProps<T>;

export const ViewLayerListItem: FC<ViewLayerListItemProps> = memo(
  (props: ViewLayerListItemProps) => {
    const {
      id,
      type,
      selected,
      titleAtom,
      loadingAtom,
      hiddenAtom,
      layerIdAtom,
      boundingSphereAtom,
      itemProps,
    } = props;

    const title = useAtomValue(titleAtom);
    const loading = useAtomValue(loadingAtom);

    const highlightedAtom = useMemo(
      () => atom(get => get(highlightedLayersAtom).some(layer => layer.id === id)),
      [id],
    );
    const highlighted = useAtomValue(highlightedAtom);

    const findRootLayer = useSetAtom(findRootLayerAtom);
    const rootLayer = findRootLayer(props.id);

    const layerId = useAtomValue(layerIdAtom);
    const layerCamera = useOptionalAtomValue(
      useMemo(() => ("cameraAtom" in props ? props.cameraAtom : undefined), [props]),
    );
    const storyCamera = useOptionalAtomValue(
      useMemo(() => ("capturesAtom" in props ? props.capturesAtom : undefined), [props]),
    )?.[0]?.camera;
    const boundingSphere = useAtomValue(boundingSphereAtom);
    const handleMove = useCallback(() => {
      if (type === STORY_LAYER) {
        return storyCamera && flyToCamera(storyCamera);
      }
      const camera = rootLayer?.general?.camera;
      if (camera) {
        return flyToCamera(camera);
      }
      if (layerCamera) {
        return flyToCamera(layerCamera);
      }
      if (boundingSphere) {
        return lookAtXYZ(boundingSphere);
      }
      if (layerId) {
        return flyToLayerId(layerId);
      }
    }, [layerId, rootLayer?.general?.camera, layerCamera, boundingSphere, storyCamera, type]);

    const [hidden, setHidden] = useAtom(hiddenAtom);
    const handleToggleHidden = useCallback(() => {
      setHidden(value => !value);
    }, [setHidden]);

    const remove = useSetAtom(removeLayerAtom);
    const handleRemove = useCallback(() => {
      remove(id);
    }, [id, remove]);

    const colorScheme = useAtomValue(props.colorSchemeAtom);
    const colorMap = useAtomValue(
      useMemo(
        () =>
          atom(get =>
            colorScheme?.type === "quantitative" ? get(colorScheme.colorMapAtom) : null,
          ),
        [colorScheme],
      ),
    );
    const colorSetColors = useAtomValue(
      useMemo(
        () =>
          atom(get => (colorScheme?.type === "qualitative" ? get(colorScheme.colorsAtom) : null)),
        [colorScheme],
      ),
    );

    const [colorSchemeSelection, setColorSchemeSelection] = useAtom(colorSchemeSelectionAtom);
    const colorSchemeSelected = useMemo(
      () => colorSchemeSelection.includes(id),
      [id, colorSchemeSelection],
    );
    const handleColorSchemeClick = useCallback(() => {
      setColorSchemeSelection([id]);
    }, [id, setColorSchemeSelection]);

    const imageScheme = useAtomValue(props.imageSchemeAtom);
    const imageIcons = useAtomValue(
      useMemo(
        () =>
          atom(get => (imageScheme?.type === "imageIcon" ? get(imageScheme.imageIconsAtom) : null)),
        [imageScheme],
      ),
    );
    const [imageSchemeSelection, setImageSchemeSelection] = useAtom(imageSchemeSelectionAtom);
    const imageSchemeSelected = useMemo(
      () => imageSchemeSelection.includes(id),
      [id, imageSchemeSelection],
    );
    const handleImageSchemeClick = useCallback(() => {
      setImageSchemeSelection([id]);
    }, [id, setImageSchemeSelection]);

    const customLegendScheme = useAtomValue(props.customLegendSchemeAtom);
    const customLegends = useAtomValue(
      useMemo(
        () =>
          atom(get =>
            customLegendScheme?.type === "customLegend"
              ? get(customLegendScheme?.customLegendsAtom)
              : null,
          ),
        [customLegendScheme],
      ),
    );
    const [customLegendSchemeSelection, setCustomLegendSchemeSelection] = useAtom(
      customLegendSchemeSelectionAtom,
    );
    const customLegendSchemeSelected = useMemo(
      () => customLegendSchemeSelection.includes(id),
      [id, customLegendSchemeSelection],
    );
    const handleCustomLegendSchemeClick = useCallback(() => {
      setCustomLegendSchemeSelection([id]);
    }, [id, setCustomLegendSchemeSelection]);

    return (
      <LayerListItem
        {...itemProps}
        title={title ?? undefined}
        iconComponent={layerTypeIcons[type] ?? layerTypeIcons.USE_CASE_LAYER}
        highlighted={highlighted}
        selected={selected}
        loading={loading}
        hidden={hidden}
        layerId={layerId}
        layerType={type}
        boundingSphere={boundingSphere}
        hasStoryCamera={!!storyCamera}
        accessory={
          colorMap != null ? (
            <Tooltip title={colorScheme?.name}>
              <IconButton
                aria-label={colorScheme?.name}
                onMouseDown={stopPropagation}
                onDoubleClick={stopPropagation}
                onClick={handleColorSchemeClick}>
                <ColorMapIcon colorMap={colorMap} selected={colorSchemeSelected} />
              </IconButton>
            </Tooltip>
          ) : colorSetColors != null ? (
            <Tooltip title={colorScheme?.name}>
              <IconButton
                aria-label={colorScheme?.name}
                onMouseDown={stopPropagation}
                onDoubleClick={stopPropagation}
                onClick={handleColorSchemeClick}>
                <ColorSetIcon colors={colorSetColors} selected={colorSchemeSelected} />
              </IconButton>
            </Tooltip>
          ) : imageIcons != null ? (
            <Tooltip title={imageScheme?.name}>
              <IconButton
                aria-label={imageScheme?.name}
                onMouseDown={stopPropagation}
                onDoubleClick={stopPropagation}
                onClick={handleImageSchemeClick}>
                <ImageIconSetIcon imageIcons={imageIcons} selected={imageSchemeSelected} />
              </IconButton>
            </Tooltip>
          ) : customLegends != null ? (
            <Tooltip title={customLegendScheme?.name}>
              <IconButton
                aria-label={customLegendScheme?.name}
                onMouseDown={stopPropagation}
                onDoubleClick={stopPropagation}
                onClick={handleCustomLegendSchemeClick}>
                <CustomLegendSetIcon
                  customLegends={customLegends}
                  selected={customLegendSchemeSelected}
                />
              </IconButton>
            </Tooltip>
          ) : undefined
        }
        onDoubleClick={handleMove}
        onRemove={handleRemove}
        onToggleHidden={handleToggleHidden}
        onMove={handleMove}
      />
    );
  },
) as unknown as <T extends LayerType = LayerType>(props: ViewLayerListItemProps<T>) => JSX.Element; // For generics
