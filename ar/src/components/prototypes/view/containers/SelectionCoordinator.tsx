import { useAtom } from "jotai";
import { type FC } from "react";
import { useIsomorphicLayoutEffect } from "react-use";

import { layerSelectionAtom } from "../../layers";
import { screenSpaceSelectionAtom } from "../../screen-space-selection";
import { colorSchemeSelectionAtom, imageSchemeSelectionAtom } from "../../view-layers";

function clearValue<T>(prevValue: readonly T[]): readonly T[] {
  return prevValue.length !== 0 ? [] : prevValue;
}

export const SelectionCoordinator: FC = () => {
  const [layerSelection, setLayerSelection] = useAtom(layerSelectionAtom);
  const [screenSpaceSelection, setScreenSpaceSelection] = useAtom(screenSpaceSelectionAtom);
  const [colorSchemeSelection, setColorSchemeSelection] = useAtom(colorSchemeSelectionAtom);
  const [imageSchemeSelection, setImageSchemeSelection] = useAtom(imageSchemeSelectionAtom);

  useIsomorphicLayoutEffect(() => {
    if (screenSpaceSelection.length > 0) {
      setLayerSelection(clearValue);
      setColorSchemeSelection(clearValue);
      setImageSchemeSelection(clearValue);
    }
  }, [screenSpaceSelection, setLayerSelection, setColorSchemeSelection, setImageSchemeSelection]);

  useIsomorphicLayoutEffect(() => {
    if (layerSelection.length > 0) {
      setScreenSpaceSelection(clearValue);
      setColorSchemeSelection(clearValue);
      setImageSchemeSelection(clearValue);
      // Deselect the feature selection
      window.reearth?.layers?.select?.(undefined);
    }
  }, [layerSelection, setScreenSpaceSelection, setColorSchemeSelection, setImageSchemeSelection]);

  useIsomorphicLayoutEffect(() => {
    if (colorSchemeSelection.length > 0) {
      setLayerSelection(clearValue);
      setScreenSpaceSelection(clearValue);
      setImageSchemeSelection(clearValue);
    }
  }, [colorSchemeSelection, setLayerSelection, setScreenSpaceSelection, setImageSchemeSelection]);

  useIsomorphicLayoutEffect(() => {
    if (imageSchemeSelection.length > 0) {
      setLayerSelection(clearValue);
      setScreenSpaceSelection(clearValue);
      setColorSchemeSelection(clearValue);
    }
  }, [imageSchemeSelection, setLayerSelection, setScreenSpaceSelection, setColorSchemeSelection]);

  return null;
};
