import { Button, Stack, styled, Typography } from "@mui/material";
import { atom, useAtomValue, useSetAtom, type Getter } from "jotai";
import { intersection, isEqual, min, uniqWith } from "lodash-es";
import { useCallback, useMemo, type FC, useState } from "react";
import invariant from "tiny-invariant";

import { PlateauTilesetProperty } from "../../../shared/plateau";
import { BuildingLayerModel, FLOOD_LAYER_TYPES } from "../../../shared/view-layers";
import { FloodLayerModel } from "../../../shared/view-layers/plateau-3dtiles/FloodLayer";
import { type LayerModel } from "../../layers";
import { isNotNullish } from "../../type-helpers";
import {
  ColorMapParameterItem,
  GroupedParameterItem,
  InspectorItem,
  ParameterList,
  QualitativeColorLegend,
  QuantitativeColorLegend,
  SelectParameterItem,
  SliderParameterItem,
} from "../../ui-components";
import { BUILDING_LAYER, colorSchemeSelectionAtom } from "../../view-layers";

const StyledButton = styled(Button)(({ theme }) => ({
  ...theme.typography.body2,
  display: "block",
  width: `calc(100% + ${theme.spacing(2)})`,
  margin: 0,
  padding: `0 ${theme.spacing(1)}`,
  marginLeft: theme.spacing(-1),
  marginRight: theme.spacing(-1),
  textAlign: "left",
}));

const Legend: FC<{
  layers: readonly (BuildingLayerModel | FloodLayerModel)[];
}> = ({ layers }) => {
  const colorScheme = useAtomValue(
    useMemo(
      () =>
        atom(get => {
          const colorSchemes = uniqWith(
            layers.map(({ colorSchemeAtom }) => get(colorSchemeAtom)),
            (a, b) => {
              if (a?.type !== b?.type) {
                return false;
              }
              if (a?.type === "quantitative") {
                invariant(b?.type === "quantitative");
                return (
                  a.name === b.name &&
                  get(a.colorMapAtom) === get(b.colorMapAtom) &&
                  isEqual(get(a.colorRangeAtom), get(b.colorRangeAtom))
                );
              }
              if (a?.type === "qualitative") {
                invariant(b?.type === "qualitative");
                return a.name === b.name && isEqual(get(a.colorsAtom), get(b.colorsAtom));
              }
              return false;
            },
          );
          if (colorSchemes.length !== 1 || colorSchemes[0] == null) {
            return null;
          }
          const colorScheme = colorSchemes[0];
          switch (colorScheme.type) {
            case "quantitative":
              return {
                type: "quantitative" as const,
                name: colorScheme.name,
                colorMap: get(colorScheme.colorMapAtom),
                colorRange: get(colorScheme.colorRangeAtom),
              };
            case "qualitative":
              return {
                type: "qualitative" as const,
                name: colorScheme.name,
                colors: get(colorScheme.colorsAtom),
              };
          }
        }),
      [layers],
    ),
  );

  const setSelection = useSetAtom(colorSchemeSelectionAtom);
  const handleClick = useCallback(() => {
    // Assume that every layer as the same color scheme.
    setSelection([layers[0].id]);
  }, [layers, setSelection]);

  if (colorScheme == null) {
    return null;
  }
  return (
    <StyledButton variant="text" onClick={handleClick}>
      <Stack spacing={1} width="100%" marginY={1}>
        <Typography variant="body2">{colorScheme.name}</Typography>
        {colorScheme.type === "quantitative" && (
          <QuantitativeColorLegend
            colorMap={colorScheme.colorMap}
            min={colorScheme.colorRange[0]}
            max={colorScheme.colorRange[1]}
          />
        )}
        {colorScheme.type === "qualitative" && (
          <QualitativeColorLegend colors={colorScheme.colors} />
        )}
      </Stack>
    </StyledButton>
  );
};

function getProperty(get: Getter, layers: readonly LayerModel[]): PlateauTilesetProperty | null {
  const properties = uniqWith(
    layers.map(layer => {
      if (!("propertiesAtom" in layer) || !("colorPropertyAtom" in layer)) {
        return undefined;
      }
      const properties = get(layer.propertiesAtom);
      const colorProperty = get(layer.colorPropertyAtom);
      return colorProperty != null
        ? properties?.value?.find(({ name }) => name === colorProperty)
        : undefined;
    }),
  );
  const property = properties[0];
  if (property == null || !properties.every(other => other?.type === property.type)) {
    return null;
  }
  switch (property.type) {
    case "number": {
      const minimum = min(
        properties.map(property => {
          invariant(property?.type === "number");
          return property.minimum;
        }),
      );
      const maximum = min(
        properties.map(property => {
          invariant(property?.type === "number");
          return property.maximum;
        }),
      );
      invariant(minimum != null);
      invariant(maximum != null);
      return {
        ...property,
        minimum,
        maximum,
      };
    }
    case "qualitative":
      return property;
  }
  return null;
}

export interface BuildingLayerColorSectionProps {
  layers: readonly LayerModel[];
}

// TODO: Handle as component
export const BuildingLayerColorSection: FC<BuildingLayerColorSectionProps> = ({ layers }) => {
  const buildingLayers = useMemo(
    () =>
      layers.filter((l): l is BuildingLayerModel | FloodLayerModel =>
        [BUILDING_LAYER, ...FLOOD_LAYER_TYPES].includes(l.type),
      ),
    [layers],
  );
  const [recalcPropertyItems, setRecalcPropertyItems] = useState(0);
  const propertyItems = useAtomValue(
    useMemo(
      () =>
        atom((get): Array<[null, string] | [string, string]> => {
          const names = intersection(
            ...buildingLayers.map(layer =>
              "propertiesAtom" in layer
                ? get(layer.propertiesAtom)
                    ?.value?.map(property =>
                      property.type === "number" || property.type === "qualitative"
                        ? property.name
                        : undefined,
                    )
                    .filter(isNotNullish) ?? []
                : [],
            ),
          );
          return [
            [null, "なし"],
            ...names.map((name): [string, string] => [name, name.replaceAll("_", " ")]),
          ];
        }),
      [buildingLayers, recalcPropertyItems], // eslint-disable-line react-hooks/exhaustive-deps
    ),
  );

  const colorPropertyAtoms = useMemo(() => {
    const atoms = buildingLayers.map(layer =>
      "colorPropertyAtom" in layer ? layer.colorPropertyAtom : undefined,
    );
    return atoms.every(<T,>(atom: T | undefined): atom is T => atom != null) ? atoms : undefined;
  }, [buildingLayers]);

  const colorMapAtoms = useMemo(() => {
    const atoms = buildingLayers.map(layer =>
      "colorMapAtom" in layer ? layer.colorMapAtom : undefined,
    );
    return atoms.every(<T,>(atom: T | undefined): atom is T => atom != null) ? atoms : undefined;
  }, [buildingLayers]);

  const colorRangeAtoms = useMemo(() => {
    const atoms = buildingLayers.map(layer =>
      "colorRangeAtom" in layer ? layer.colorRangeAtom : undefined,
    );
    return atoms.every(<T,>(atom: T | undefined): atom is T => atom != null) ? atoms : undefined;
  }, [buildingLayers]);

  const property = useAtomValue(
    useMemo(() => atom(get => getProperty(get, buildingLayers)), [buildingLayers]),
  );

  // Update color range when properties change.
  const resetColorRange = useSetAtom(
    useMemo(
      () =>
        atom(null, (get, set) => {
          if (colorRangeAtoms == null) {
            return;
          }
          const property = getProperty(get, buildingLayers);
          if (property?.type === "number") {
            colorRangeAtoms.forEach(colorRange => {
              set(colorRange, [property.minimum, property.maximum]);
            });
          }
        }),
      [buildingLayers, colorRangeAtoms],
    ),
  );

  const handleClickParameterItem = useCallback(() => {
    setRecalcPropertyItems(p => p + 1);
  }, []);

  if (
    !buildingLayers.length ||
    colorPropertyAtoms == null ||
    colorMapAtoms == null ||
    colorRangeAtoms == null
  ) {
    return null;
  }
  return (
    <ParameterList>
      <GroupedParameterItem
        label="色分け"
        onClick={handleClickParameterItem}
        content={<Legend layers={buildingLayers} />}>
        <InspectorItem sx={{ width: 320 }}>
          <ParameterList>
            <SelectParameterItem
              label="モデル属性"
              atom={colorPropertyAtoms}
              items={propertyItems}
              layout="stack"
              displayEmpty
              onChange={resetColorRange}
            />
            {property?.type === "number" && (
              <>
                <ColorMapParameterItem label="配色" atom={colorMapAtoms} />
                <SliderParameterItem
                  label="値範囲"
                  min={property.minimum}
                  max={property.maximum}
                  range
                  atom={colorRangeAtoms}
                />
              </>
            )}
          </ParameterList>
        </InspectorItem>
      </GroupedParameterItem>
    </ParameterList>
  );
};
