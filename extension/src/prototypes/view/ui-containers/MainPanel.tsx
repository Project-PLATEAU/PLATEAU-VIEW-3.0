import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ResizeCallback } from "re-resizable";
import { useCallback, useState, type FC, useRef, MouseEvent } from "react";

import { clearLayerSelectionAtom, layerAtomsAtom, LayerList } from "../../layers";
import { AutoHeight, LayerList as LayerListComponent } from "../../ui-components";
import { ViewLayerListItem } from "../../view-layers";
import { mainWidthAtom } from "../states/app";

import { ResizeableWrapper } from "./ResizeableWrapper";
import { SearchAutocompletePanel } from "./SearchAutocompletePanel";

export const MainPanel: FC = () => {
  const layerAtoms = useAtomValue(layerAtomsAtom);
  const [layersOpen, setLayersOpen] = useState(false);
  const handleLayersOpen = useCallback(() => {
    setLayersOpen(true);
  }, []);
  const handleLayersClose = useCallback(() => {
    setLayersOpen(false);
  }, []);

  const clearLayerSelection = useSetAtom(clearLayerSelectionAtom);
  const listRef = useRef<HTMLDivElement>(null);
  const handleLayersClick = useCallback(
    (event: MouseEvent) => {
      if (event.target === listRef.current) {
        clearLayerSelection();
      }
    },
    [clearLayerSelection],
  );

  const [mainWidth, setMainWidth] = useAtom(mainWidthAtom);
  const handleResizeStop: ResizeCallback = useCallback(
    (_event, _direction, _element, delta) => {
      setMainWidth(prevValue => prevValue + delta.width);
    },
    [setMainWidth],
  );

  return (
    <AutoHeight>
      <ResizeableWrapper defaultWidth={mainWidth} onResizeStop={handleResizeStop}>
        <SearchAutocompletePanel>
          <LayerListComponent
            listRef={listRef}
            footer={`${layerAtoms.length}項目`}
            open={layersOpen}
            onOpen={handleLayersOpen}
            onClose={handleLayersClose}
            onClick={handleLayersClick}>
            <LayerList itemComponent={ViewLayerListItem} unmountWhenEmpty />
          </LayerListComponent>
        </SearchAutocompletePanel>
      </ResizeableWrapper>
    </AutoHeight>
  );
};
