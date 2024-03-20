import {
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Popover,
  Tab,
  Tabs,
  styled,
  tabClasses,
} from "@mui/material";
import { PrimitiveAtom, useAtom } from "jotai";
import { get, uniq, uniqBy } from "lodash-es";
import { PopupState, bindPopover } from "material-ui-popup-state/hooks";
import { FC, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { isNotNullish } from "../../../prototypes/type-helpers";
import { InspectorHeader, Space } from "../../../prototypes/ui-components";
import { BUILDING_LAYER } from "../../../prototypes/view-layers";
import { useOptionalAtomValue, useOptionalPrimitiveAtom } from "../../hooks";
import { PlateauTilesetProperties, TileFeatureIndex } from "../../plateau";
import {
  MultipleSelectSearch,
  Props as MultipleSelectSearchProps,
} from "../../ui-components/MultipleSelectSearch";
import { LayerModel, SearchedFeatures } from "../../view-layers";

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: theme.spacing(5),
  backgroundColor: theme.palette.background.default,
  width: "100%",
  [`& .${tabClasses.root}`]: {
    minHeight: theme.spacing(5),
    width: "50%",
  },
}));

const Content = styled("div")(() => ({
  width: 320,
}));

const SearchContent = styled("div")(() => ({
  margin: "8px 8px 16px 8px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const SearchButton = styled(Button)(() => ({
  color: "#ffffff",
  fontSize: 12,
  width: 120,
  height: 32,
}));

const SearchConditionList = styled(List)(() => ({
  width: "100%",
  listStyle: "none",
  padding: 0,
}));

const SearchConditionListItem = styled(ListItem)(() => ({
  width: "100%",
}));

const ResultLabel = styled("div")(({ theme }) => ({
  ...theme.typography.body2,
  margin: "14px 16px",
  listStyle: "none",
  padding: 0,
}));

const ResultList = styled(List)(() => ({
  width: "100%",
  maxHeight: 360,
  overflowY: "auto",
}));

const ResultListItem = styled(ListItemButton)(({ theme }) => ({
  ...theme.typography.body2,
  width: "100%",
  maxHeight: 360,
}));

const ResultButtonList = styled("ul")(() => ({
  display: "flex",
  gap: 8,
  justifyContent: "center",
  listStyle: "none",
  padding: 0,
}));

const ResultButton = styled(Button)(() => ({
  color: "#232323",
  width: 120,
  height: 32,
  fontSize: 12,
  "&.MuiButton-containedPrimary": {
    color: "#ffffff",
  },
}));

type Props = {
  state: PopupState;
  layer: LayerModel;
  layerId: string | null;
};

const EXCLUDE_PROPERTY_NAMES = ["attributes", "gml_id"];

export const BuildingSearchPanel: FC<Props> = ({ state, layer, layerId }) => {
  const [tab, setTab] = useState(0);
  const deferredTab = useDeferredValue(tab);
  const handleTabChange = useCallback((_event: unknown, value: number) => {
    setTab(value);
  }, []);

  const triggerUpdateRef = useRef(0);
  const properties = useOptionalAtomValue(
    useMemo(() => {
      if (layer.type !== BUILDING_LAYER || !("propertiesAtom" in layer)) return;
      return layer.propertiesAtom as PrimitiveAtom<PlateauTilesetProperties | null>;
    }, [layer, triggerUpdateRef.current]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  const featureIndex = useOptionalAtomValue(
    useMemo(
      () =>
        ("featureIndexAtom" in layer ? layer.featureIndexAtom : undefined) as
          | PrimitiveAtom<TileFeatureIndex | null>
          | undefined,
      [layer],
    ),
  );
  const [searchedFeatures, setSearchedFeatures] = useAtom(
    useOptionalPrimitiveAtom(
      useMemo(
        () =>
          ("searchedFeaturesAtom" in layer ? layer.searchedFeaturesAtom : undefined) as
            | PrimitiveAtom<SearchedFeatures | null>
            | undefined,
        [layer],
      ),
    ),
  );

  const allFeatures = useMemo(
    () =>
      window.reearth?.layers?.findFeaturesByIds?.(layerId ?? "", featureIndex?.featureIds ?? []),
    [layerId, featureIndex, triggerUpdateRef.current], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const groups = useMemo(() => {
    if (!allFeatures) return;

    return properties?.value
      ?.map(value => {
        if (!value) return;
        if (value.type !== "unknown") return;
        if (EXCLUDE_PROPERTY_NAMES.includes(value.name)) return;

        return {
          key: value.name,
          title: value.name,
          options: uniqBy(
            allFeatures
              .map(f => {
                const propertyValue = get(f.properties, value.name);
                return { label: propertyValue, value: propertyValue };
              })
              .filter(v => !!v.label && !!v.value),
            "label",
          ),
        };
      })
      .filter(isNotNullish);
  }, [allFeatures, properties]);

  const [conditions, setConditions] = useState<
    Record<string, MultipleSelectSearchProps["options"]>
  >({});
  const handleConditionsChange = useCallback(
    (key: string, value: MultipleSelectSearchProps["options"]) => {
      setConditions(p => ({ ...p, [key]: value }));
    },
    [],
  );

  const handleSearchButtonClick = useCallback(() => {
    if (!allFeatures) return;

    const conditionEntries = Object.entries(conditions).map(([key, value]) => [
      key,
      value.map(v => v.label),
    ]);
    const hasCondition = conditionEntries.some(([, values]) => !!values.length);

    if (allFeatures && hasCondition) {
      setSearchedFeatures({
        features: uniq(
          allFeatures
            .filter(f =>
              conditionEntries.every(
                ([key, values]) => !values.length || values.includes(get(f.properties, key)),
              ),
            )
            .map(f => f.id),
        ),
        highlight: true,
        onlyShow: false,
        selectedIndices: [],
      });
    }
    setTab(1);
  }, [allFeatures, conditions, setSearchedFeatures]);

  // TODO: Handle moving camera to the selected feature in this function.
  const handleResultItemClick = useCallback(
    (i: number) => {
      setSearchedFeatures(p => {
        const shouldUpdate = p?.selectedIndices.every(v => v !== i);
        return p
          ? {
              ...p,
              selectedIndices: shouldUpdate ? [i] : p.selectedIndices.filter(v => v !== i),
              highlight: false,
            }
          : p;
      });
    },
    [setSearchedFeatures],
  );

  const handleHighlightResultButtonClick = useCallback(() => {
    setSearchedFeatures(p => (p ? { ...p, highlight: !p.highlight, selectedIndices: [] } : p));
  }, [setSearchedFeatures]);

  const handleShowOnlyResultButtonClick = useCallback(() => {
    setSearchedFeatures(p => (p ? { ...p, onlyShow: !p.onlyShow } : p));
  }, [setSearchedFeatures]);

  useEffect(() => () => setSearchedFeatures(null), []); // eslint-disable-line react-hooks/exhaustive-deps

  triggerUpdateRef.current += 1;

  if (!allFeatures || !groups) return null;

  return (
    <Popover
      {...bindPopover(state)}
      anchorOrigin={{
        horizontal: "left",
        vertical: "top",
      }}
      transformOrigin={{
        horizontal: "right",
        vertical: "top",
      }}>
      <InspectorHeader title={"データを検索"} onClose={state.close} />
      <Divider />
      <StyledTabs value={deferredTab} onChange={handleTabChange} sx={{ width: 320 }}>
        <Tab label="条件" />
        <Tab label="結果" />
      </StyledTabs>
      <Content>
        {tab === 0 && (
          <SearchContent>
            <SearchConditionList>
              {groups.map((group, i) => (
                <SearchConditionListItem key={group.title}>
                  <MultipleSelectSearch
                    title={group.title}
                    options={group.options}
                    position={i >= 2 ? "top" : "bottom"}
                    onChange={(_e, value) => handleConditionsChange(group.key, value)}
                    values={conditions[group.key]}
                  />
                </SearchConditionListItem>
              ))}
            </SearchConditionList>
            <Space size={3} />
            <SearchButton color="primary" variant="contained" onClick={handleSearchButtonClick}>
              検索
            </SearchButton>
          </SearchContent>
        )}
        {tab === 1 && (
          <div>
            <ResultLabel>{searchedFeatures?.features.length ?? 0}件見つかりました</ResultLabel>
            <Divider />
            <ResultList>
              {searchedFeatures?.features.map((f, i) => (
                <ResultListItem
                  key={f}
                  selected={searchedFeatures.selectedIndices.includes(i)}
                  onClick={() => handleResultItemClick(i)}>
                  {f}
                </ResultListItem>
              ))}
            </ResultList>
            <Divider />
            <ResultButtonList>
              <li>
                <ResultButton
                  color={searchedFeatures?.highlight ? "primary" : "secondary"}
                  variant={searchedFeatures?.highlight ? "contained" : "outlined"}
                  onClick={handleHighlightResultButtonClick}>
                  結果をハイライト
                </ResultButton>
              </li>
              <li>
                <ResultButton
                  color={searchedFeatures?.onlyShow ? "primary" : "secondary"}
                  variant={searchedFeatures?.onlyShow ? "contained" : "outlined"}
                  onClick={handleShowOnlyResultButtonClick}>
                  結果のみ表示
                </ResultButton>
              </li>
            </ResultButtonList>
          </div>
        )}
      </Content>
    </Popover>
  );
};
