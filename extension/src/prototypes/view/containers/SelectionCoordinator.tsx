import { useAtom } from "jotai";
import { type FC } from "react";
import { useIsomorphicLayoutEffect } from "react-use";

import { layerSelectionAtom } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import {
  colorSchemeSelectionAtom,
  customLegendSchemeSelectionAtom,
  imageSchemeSelectionAtom,
} from "../../view-layers";

function clearValue<T>(prevValue: readonly T[]): readonly T[] {
  return prevValue.length !== 0 ? [] : prevValue;
}

export const SelectionCoordinator: FC = () => {
  const [layerSelection, setLayerSelection] = useAtom(layerSelectionAtom);
  const [screenSpaceSelection, setScreenSpaceSelection] = useAtom(screenSpaceSelectionAtom);
  const [colorSchemeSelection, setColorSchemeSelection] = useAtom(colorSchemeSelectionAtom);
  const [imageSchemeSelection, setImageSchemeSelection] = useAtom(imageSchemeSelectionAtom);
  const [customLegendSchemeSelection, setCustomLegendSchemeSelection] = useAtom(
    customLegendSchemeSelectionAtom,
  );

  useIsomorphicLayoutEffect(() => {
    if (screenSpaceSelection.length > 0) {
      setLayerSelection(clearValue);
      setColorSchemeSelection(clearValue);
      setImageSchemeSelection(clearValue);
      setCustomLegendSchemeSelection(clearValue);
    }
  }, [
    screenSpaceSelection,
    setLayerSelection,
    setColorSchemeSelection,
    setImageSchemeSelection,
    setCustomLegendSchemeSelection,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (layerSelection.length > 0) {
      setScreenSpaceSelection(clearValue);
      setColorSchemeSelection(clearValue);
      setImageSchemeSelection(clearValue);
      setCustomLegendSchemeSelection(clearValue);
      // Deselect the feature selection
      window.reearth?.layers?.select?.(undefined);
    }
  }, [
    layerSelection,
    setScreenSpaceSelection,
    setColorSchemeSelection,
    setImageSchemeSelection,
    setCustomLegendSchemeSelection,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (colorSchemeSelection.length > 0) {
      setLayerSelection(clearValue);
      setScreenSpaceSelection(clearValue);
      setImageSchemeSelection(clearValue);
      setCustomLegendSchemeSelection(clearValue);
    }
  }, [
    colorSchemeSelection,
    setLayerSelection,
    setScreenSpaceSelection,
    setImageSchemeSelection,
    setCustomLegendSchemeSelection,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (imageSchemeSelection.length > 0) {
      setLayerSelection(clearValue);
      setScreenSpaceSelection(clearValue);
      setColorSchemeSelection(clearValue);
      setCustomLegendSchemeSelection(clearValue);
    }
  }, [
    imageSchemeSelection,
    setLayerSelection,
    setScreenSpaceSelection,
    setColorSchemeSelection,
    setCustomLegendSchemeSelection,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (customLegendSchemeSelection.length > 0) {
      setLayerSelection(clearValue);
      setScreenSpaceSelection(clearValue);
      setColorSchemeSelection(clearValue);
      setImageSchemeSelection(clearValue);
    }
  }, [
    customLegendSchemeSelection,
    setLayerSelection,
    setScreenSpaceSelection,
    setColorSchemeSelection,
    setImageSchemeSelection,
  ]);

  return null;
};
