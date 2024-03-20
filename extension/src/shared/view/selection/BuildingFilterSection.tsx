import { SetStateAction, atom, useAtomValue } from "jotai";
import { intersectionWith } from "lodash-es";
import { useMemo, type FC, useState, useCallback } from "react";
import invariant from "tiny-invariant";

import { isNotNullish } from "../../../prototypes/type-helpers";
import {
  GroupedParameterItem,
  InspectorItem,
  ParameterList,
  SliderParameterItem,
} from "../../../prototypes/ui-components";
import { BUILDING_LAYER } from "../../../prototypes/view-layers";
import { AvailableFeatures, PlateauTilesetProperty } from "../../plateau";
import {
  TilesetBuildingModelFilterField,
  TilesetFloodModelFilterField,
} from "../../types/fieldComponents/3dtiles";
import {
  BuildingLayerModel,
  FLOOD_LAYER_TYPES,
  LayerModel,
  FloodLayerModel,
} from "../../view-layers";
import { WritableAtomForComponent } from "../../view-layers/component";

export interface BuildingFilterSectionProps {
  label: string;
  layers: readonly LayerModel[];
  atoms: WritableAtomForComponent<TilesetBuildingModelFilterField | TilesetFloodModelFilterField>[];
  availableFeature: AvailableFeatures[number];
}

type Poperty = Extract<PlateauTilesetProperty, { type: "qualitative" | "number" }>;

export const BuildingFilterSection: FC<BuildingFilterSectionProps> = ({
  label,
  atoms,
  layers,
  availableFeature,
}) => {
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
        atom((get): Array<[Poperty, string]> => {
          const props = intersectionWith(
            ...buildingLayers.map(layer =>
              "propertiesAtom" in layer
                ? get(layer.propertiesAtom)
                    ?.value?.map(property => {
                      if (
                        (property.type !== "number" && property.type !== "qualitative") ||
                        property.minimum == null ||
                        property.maximum == null ||
                        !property.availableFeatures?.includes(availableFeature)
                      )
                        return;

                      const minimum = Math.ceil(property.minimum);
                      const maximum = Math.ceil(property.maximum);

                      return {
                        ...property,
                        minimum,
                        maximum,
                      };
                    })
                    .filter(isNotNullish) ?? []
                : [],
            ),
            (a, b: Poperty) => a.name === b.name,
          );
          return props.map((prop): [Poperty, string] => [prop, prop.displayName]);
        }),
      [buildingLayers, recalcPropertyItems], // eslint-disable-line react-hooks/exhaustive-deps
    ),
  );

  const wrappedAtoms: Record<string, WritableAtomForComponent<number[]>[]> = useMemo(
    () =>
      propertyItems.reduce((res, [prop]) => {
        const maximum = prop.maximum;
        const minimum = prop.minimum;
        invariant(maximum !== undefined && minimum !== undefined);
        res[prop.name] = atoms.map(a =>
          atom(
            get => {
              const filter = get(a).value.filters[prop.name];
              return [filter?.value[0] ?? minimum, filter?.value[1] ?? maximum];
            },
            (get, set, action: SetStateAction<number[]>) => {
              const prevComponent = get(a);
              const prevFilters = prevComponent.value.filters;
              const prevFilter = prevFilters[prop.name];
              const prevRange = [prevFilter?.value[0] ?? minimum, prevFilter?.value[1] ?? maximum];
              const update = typeof action === "function" ? action(prevRange) : action;

              set(a, {
                ...prevComponent,
                value: {
                  ...prevComponent.value,
                  filters: {
                    ...prevFilters,
                    [prop.name]: {
                      range: [minimum, maximum],
                      value: [update[0] ?? minimum, update[1] ?? maximum],
                      accessor: prop.accessor,
                      defaultValue: prop.defaultValue,
                    },
                  },
                },
              });
            },
          ),
        );
        return res;
      }, {} as Record<string, WritableAtomForComponent<number[]>[]>),
    [atoms, propertyItems],
  );

  const handleClickParameterItem = useCallback(() => {
    setRecalcPropertyItems(p => p + 1);
  }, []);

  return (
    <GroupedParameterItem label={label} onClick={handleClickParameterItem}>
      <InspectorItem sx={{ width: 320 }} level={2}>
        <ParameterList>
          {propertyItems.map(([prop, name]) => (
            <SliderParameterItem
              key={prop.name}
              label={name}
              atom={wrappedAtoms[prop.name]}
              min={prop.minimum}
              max={prop.maximum}
              range
              step={1}
              allowFloat={false}
            />
          ))}
        </ParameterList>
      </InspectorItem>
    </GroupedParameterItem>
  );
};
