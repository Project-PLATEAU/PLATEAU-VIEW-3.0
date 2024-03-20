import { Button, Divider, List, ListItem, ListItemText } from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, type FC } from "react";
import invariant from "tiny-invariant";

import { makeColorSchemeAtomForComponent } from "../../../shared/view/state/colorSchemeForComponent";
import { FLOOD_LAYER_TYPES } from "../../../shared/view-layers";
import { LayerType } from "../../layers";
import {
  ColorMapIcon,
  ColorMapParameterItem,
  ColorSetIcon,
  ColorSetList,
  InspectorHeader,
  InspectorItem,
  ParameterList,
  QuantitativeColorLegend,
  SliderParameterItem,
} from "../../ui-components";
import {
  BUILDING_LAYER,
  colorSchemeSelectionAtom,
  HEATMAP_LAYER,
  type LayerColorScheme,
} from "../../view-layers";
import { type COLOR_SCHEME_SELECTION, type SelectionGroup } from "../states/selection";

const QuantitativeContent: FC<{
  colorScheme: Extract<LayerColorScheme, { type: "quantitative" }>;
  onClose?: () => void;
}> = ({ colorScheme, onClose }) => {
  const colorMap = useAtomValue(colorScheme.colorMapAtom);
  const colorRange = useAtomValue(colorScheme.colorRangeAtom);
  const valueRange = useAtomValue(colorScheme.valueRangeAtom);

  return (
    <List disablePadding>
      <InspectorHeader
        title={colorScheme.name}
        icon={<ColorMapIcon colorMap={colorMap} />}
        onClose={onClose}
      />
      <Divider />
      <QuantitativeColorLegend
        colorMap={colorMap}
        min={colorRange[0]}
        max={colorRange[1]}
        sx={{ margin: 2 }}
      />
      <Divider />
      <InspectorItem>
        <ParameterList>
          <ColorMapParameterItem label="配色" atom={colorScheme.colorMapAtom} />
          <SliderParameterItem
            label="値範囲"
            min={valueRange[0]}
            max={valueRange[1]}
            // @ts-expect-error Safe assertion
            atom={colorScheme.colorRangeAtom}
          />
        </ParameterList>
      </InspectorItem>
    </List>
  );
};

const QualitativeContent: FC<{
  colorScheme: Extract<LayerColorScheme, { type: "qualitative" }>;
  continuous?: boolean;
  onClose?: () => void;
}> = ({ colorScheme, continuous = false, onClose }) => {
  const [colors, setColors] = useAtom(colorScheme.colorsAtom);

  const handleColorReset = useCallback(() => {
    const { defaultColors } = colorScheme;
    setColors(defaultColors);
  }, [colorScheme, setColors]);

  return (
    <List disablePadding>
      <InspectorHeader
        title={colorScheme.name}
        icon={<ColorSetIcon colors={colors} />}
        onClose={onClose}
      />
      <Divider />
      <Button
        variant="outlined"
        size="small"
        style={{ float: "right", marginRight: "10px", marginTop: "8px" }}
        onClick={handleColorReset}>
        色をリセット
      </Button>
      <ListItem>
        <ListItemText>
          <ColorSetList colorsAtom={colorScheme.colorAtomsAtom} continuous={continuous} />
        </ListItemText>
      </ListItem>
    </List>
  );
};

export interface ColorSchemeContentProps {
  values: (SelectionGroup & {
    type: typeof COLOR_SCHEME_SELECTION;
  })["values"];
}

const DEFAULT_COLOR_SCHEME_LAYER_TYPES: LayerType[] = [
  BUILDING_LAYER,
  ...FLOOD_LAYER_TYPES,
  HEATMAP_LAYER,
];

export const ColorSchemeContent: FC<ColorSchemeContentProps> = ({ values }) => {
  invariant(values.length > 0);

  // TODO: Support multiple layers
  const layer = values[0];

  const setSelection = useSetAtom(colorSchemeSelectionAtom);
  const handleClose = useCallback(() => {
    setSelection([]);
  }, [setSelection]);

  const colorScheme = useAtomValue(
    useMemo(
      () =>
        DEFAULT_COLOR_SCHEME_LAYER_TYPES.includes(layer.type) && "colorSchemeAtom" in layer
          ? layer.colorSchemeAtom
          : makeColorSchemeAtomForComponent([layer]),
      [layer],
    ),
  );

  switch (colorScheme?.type) {
    case "quantitative":
      return <QuantitativeContent colorScheme={colorScheme} onClose={handleClose} />;
    case "qualitative":
      return (
        <QualitativeContent
          colorScheme={colorScheme}
          continuous={"isPlateauTilesetLayer" in layer && layer.isPlateauTilesetLayer}
          onClose={handleClose}
        />
      );
  }
  return null;
};
