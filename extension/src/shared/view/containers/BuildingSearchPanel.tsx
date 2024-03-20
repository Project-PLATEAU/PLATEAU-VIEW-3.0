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
import {
  FC,
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { InspectorHeader, Space } from "../../../prototypes/ui-components";
import { BUILDING_LAYER } from "../../../prototypes/view-layers";
import { useOptionalAtomValue, useOptionalPrimitiveAtom } from "../../hooks";
import { PlateauTilesetProperties, TileFeatureIndex, makePropertyName } from "../../plateau";
import { BUILDING_FEATURE_TYPE } from "../../plateau/constants";
import { lookAtTileFeature } from "../../reearth/utils";
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

const Content = styled("div")(({ theme }) => ({
  width: 320,
  [theme.breakpoints.down("mobile")]: {
    width: `calc(100vw - ${theme.spacing(4)})`,
  },
}));

const SearchContent = styled("div")(({ theme }) => ({
  padding: theme.spacing(1, 1, 2, 1),
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

const SearchConditionListItem = styled(ListItem)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1),
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

type SearchOption = { label: string; value: string; accessor?: string };

const INCLUDE_PROPERTY_NAMES: (string | [name: string, property: string, accessor: string])[] = [
  "住所",
  "bldg:address",
  "名称",
  "gml:name",
  "構造種別",
  "uro:BuildingDetailAttribute_uro:buildingStructureType",
  [
    "uro:BuildingDetailAttribute_uro:buildingStructureOrgType",
    `rootProperties["attributes"]["uro:BuildingDetailAttribute"][0]["uro:buildingStructureOrgType"]`,
    `attributes.uro:BuildingDetailAttribute.[0].uro:buildingStructureOrgType`,
  ],
  "用途",
  "bldg:usage",
  "耐火構造種別",
  "uro:BuildingDetailAttribute_uro:fireproofStructureType",
  [
    "uro:BuildingDetailAttribute_uro:fireproofStructureOrgType",
    `rootProperties["attributes"]["uro:BuildingDetailAttribute"][0]["uro:fireproofStructureOrgType"]`,
    `attributes.uro:BuildingDetailAttribute.[0].uro:fireproofStructureOrgType`,
  ],
  [
    "uro:BuildingDetailAttribute_uro:majorUsage",
    `rootProperties["attributes"]["uro:BuildingDetailAttribute"][0]["uro:majorUsage"]`,
    `attributes.uro:BuildingDetailAttribute.[0].uro:majorUsage`,
  ],
  [
    "uro:BuildingDetailAttribute_uro:orgUsage",
    `rootProperties["attributes"]["uro:BuildingDetailAttribute"][0]["uro:orgUsage"]`,
    `attributes.uro:BuildingDetailAttribute.[0].uro:orgUsage`,
  ],
  [
    "uro:BuildingDetailAttribute_uro:orgUsage2",
    `rootProperties["attributes"]["uro:BuildingDetailAttribute"][0]["uro:orgUsage2"]`,
    `attributes.uro:BuildingDetailAttribute.[0].uro:orgUsage2`,
  ],
  [
    "uro:BuildingDetailAttribute_uro:detailedUsage",
    `rootProperties["attributes"]["uro:BuildingDetailAttribute"][0]["uro:detailedUsage"]`,
    `attributes.uro:BuildingDetailAttribute.[0].uro:detailedUsage`,
  ],
  "gml_id",
];

export const BuildingSearchPanel: FC<Props> = ({ state, layer, layerId }) => {
  const [tab, setTab] = useState(0);
  const deferredTab = useDeferredValue(tab);
  const handleTabChange = useCallback((_event: unknown, value: number) => {
    setTab(value);
  }, []);
  const featureIndex = useOptionalAtomValue(
    useMemo(
      () =>
        ("featureIndexAtom" in layer ? layer.featureIndexAtom : undefined) as
          | PrimitiveAtom<TileFeatureIndex | null>
          | undefined,
      [layer],
    ),
  );
  const featureIds = useMemo(() => (state.isOpen ? featureIndex?.featureIds : []), [state.isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const initialized = useRef(false);
  if (state.isOpen && !initialized.current) {
    initialized.current = !!featureIds?.length;
  }

  const properties = useOptionalAtomValue(
    useMemo(() => {
      if (layer.type !== BUILDING_LAYER || !("propertiesAtom" in layer) || !initialized.current)
        return;
      return layer.propertiesAtom as PrimitiveAtom<PlateauTilesetProperties | null>;
    }, [layer, initialized.current]), // eslint-disable-line react-hooks/exhaustive-deps
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
  const defferedSearchedFeatures = useDeferredValue(searchedFeatures);

  const allFeatures = useMemo(
    () =>
      initialized.current
        ? window.reearth?.layers?.findFeaturesByIds?.(layerId ?? "", featureIds ?? [])
        : [],
    [layerId, featureIds, initialized.current], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [groups, setGroups] = useState<
    {
      key: string;
      title: string;
      options: { label: string; value: string; accessor?: string }[];
    }[]
  >([]);

  const prevAllFeaturesLengthRef = useRef(0);
  useLayoutEffect(() => {
    if (
      !allFeatures ||
      prevAllFeaturesLengthRef.current === allFeatures.length ||
      !initialized.current ||
      tab !== 0
    )
      return;

    prevAllFeaturesLengthRef.current = allFeatures.length;

    setGroups(
      INCLUDE_PROPERTY_NAMES.map(value => {
        const name = typeof value === "string" ? value : value[0];
        const property = typeof value === "string" ? value : value[1];
        const accessor = typeof value === "string" ? undefined : value[2];
        return {
          key: property ?? name,
          title: makePropertyName(`${BUILDING_FEATURE_TYPE}_${name}`, name) ?? name,
          options: uniqBy(
            allFeatures.reduce((res, f) => {
              const propertyValue = get(f.properties, accessor ?? value);
              if (!propertyValue) return res;
              res.push({ label: propertyValue, value: propertyValue, accessor: accessor ?? name });
              return res;
            }, [] as { label: string; value: string; accessor?: string }[]),
            "label",
          ),
        };
      }).filter(v => !!v.options.length) ?? [],
    );
  }, [allFeatures, initialized.current, tab, properties]); // eslint-disable-line react-hooks/exhaustive-deps

  const defferredGroups = useDeferredValue(groups);

  const [conditions, setConditions] = useState<
    Record<string, MultipleSelectSearchProps<SearchOption>["options"]>
  >({});
  const handleConditionsChange = useCallback(
    (key: string, value: MultipleSelectSearchProps<SearchOption>["options"]) => {
      setConditions(p => ({ ...p, [key]: value }));
    },
    [],
  );

  const handleSearchButtonClick = useCallback(() => {
    if (!allFeatures) return;

    const conditionEntries: [string, string[], string][] = Object.entries(conditions)
      .filter(([, v]) => !!v.length)
      .map(([key, value]) => [key, value.map(v => v.label), value[0].accessor ?? key]);
    const hasCondition = !!conditionEntries.filter(([, values]) => !!values.length).length;

    if (allFeatures && hasCondition) {
      const searchedFeatures: SearchedFeatures = {
        features: uniq(
          allFeatures
            .filter(f =>
              conditionEntries.every(([_, values, accessor]) =>
                values.includes(get(f.properties, accessor)),
              ),
            )
            .map(f => f.id),
        ),
        conditions: conditionEntries.map(([key, vals]) => [
          key.startsWith("rootProperties") ? key : `rootProperties["${key}"]`,
          vals,
        ]),
        highlight: true,
        onlyShow: false,
        selectedIndices: [],
      };
      setSearchedFeatures(searchedFeatures);
    }
    setTab(1);
  }, [allFeatures, conditions, setSearchedFeatures]);

  const handleResultItemClick = useCallback(
    (i: number) => {
      setSearchedFeatures(p => {
        return p
          ? {
              ...p,
              selectedIndices: [i],
              highlight: false,
            }
          : p;
      });
    },
    [setSearchedFeatures],
  );

  useEffect(() => {
    if (!searchedFeatures) return;
    const index = searchedFeatures.selectedIndices[0];
    if (index === undefined) return;
    const featureId = searchedFeatures.features[index];
    if (!layerId || !featureId) return;
    const feature = window.reearth?.layers?.findFeatureById?.(layerId, featureId);
    if (!feature) return;
    lookAtTileFeature(feature.properties);
  }, [searchedFeatures, layerId]);

  const handleHighlightResultButtonClick = useCallback(() => {
    setSearchedFeatures(p => (p ? { ...p, highlight: !p.highlight, selectedIndices: [] } : p));
  }, [setSearchedFeatures]);

  const handleShowOnlyResultButtonClick = useCallback(() => {
    setSearchedFeatures(p => (p ? { ...p, onlyShow: !p.onlyShow } : p));
  }, [setSearchedFeatures]);

  useEffect(() => () => setSearchedFeatures(null), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!allFeatures) return null;

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
      <StyledTabs value={deferredTab} onChange={handleTabChange} sx={{ width: "100%" }}>
        <Tab label="条件" />
        <Tab label="結果" />
      </StyledTabs>
      <Content>
        {tab === 0 && (
          <SearchContent>
            <SearchConditionList>
              {defferredGroups.map((group, i) => (
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
            <SearchButton
              color="primary"
              variant="contained"
              onClick={handleSearchButtonClick}
              disabled={!defferredGroups.length}>
              検索
            </SearchButton>
          </SearchContent>
        )}
        {tab === 1 && (
          <div>
            <ResultLabel>{searchedFeatures?.features.length ?? 0}件見つかりました</ResultLabel>
            <Divider />
            <ResultList>
              {defferedSearchedFeatures?.features.map((f, i) => (
                <ResultListItem
                  key={f}
                  selected={searchedFeatures?.selectedIndices.includes(i)}
                  onClick={() => handleResultItemClick(i)}
                  disabled={!defferedSearchedFeatures?.features.length}>
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
                  onClick={handleHighlightResultButtonClick}
                  disabled={!defferedSearchedFeatures?.features.length}>
                  結果をハイライト
                </ResultButton>
              </li>
              <li>
                <ResultButton
                  color={searchedFeatures?.onlyShow ? "primary" : "secondary"}
                  variant={searchedFeatures?.onlyShow ? "contained" : "outlined"}
                  onClick={handleShowOnlyResultButtonClick}
                  disabled={!defferedSearchedFeatures?.features.length}>
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
