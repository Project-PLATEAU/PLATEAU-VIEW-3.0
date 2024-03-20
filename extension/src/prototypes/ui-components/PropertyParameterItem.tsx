import {
  alpha,
  Collapse,
  IconButton,
  Select,
  selectClasses,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableRow,
  tableRowClasses,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { median } from "d3";
import { atom, useAtom } from "jotai";
import { atomFamily } from "jotai/utils";
import { groupBy, max, mean, min, round, intersection } from "lodash-es";
import { forwardRef, useCallback, type ComponentPropsWithRef, type FC, useMemo } from "react";

import {
  ancestorsKey,
  getPropertyAttributeValue,
  makePropertyName,
  makePropertyValue,
} from "../../shared/plateau";
import { roundFloat } from "../../shared/utils";
import { isNotNullish } from "../type-helpers";

import { TreeArrowCollapsedIcon } from "./icons/TreeArrowCollapsedIcon";
import { TreeArrowExpandedIcon } from "./icons/TreeArrowExpandedIcon";
import { SelectItem } from "./SelectItem";

const Root = styled("div", {
  shouldForwardProp: prop => prop !== "gutterBottom",
})<{ gutterBottom?: boolean }>(({ theme, gutterBottom = false }) => ({
  ...(gutterBottom && {
    marginBottom: theme.spacing(1),
  }),
}));

const StyledTable = styled(Table)(({ theme }) => ({
  [`& .${tableCellClasses.head}`]: {
    color: theme.palette.text.secondary,
  },
  [`& .${tableCellClasses.root}`]: {
    // Match the light style of divider.
    // https://github.com/mui/material-ui/blob/v5.13.1/packages/mui-material/src/Divider/Divider.js#L71
    borderBottomColor: alpha(theme.palette.divider, 0.08),
  },
  [`& .${tableRowClasses.root}:last-of-type .${tableCellClasses.root}`]: {
    borderBottomWidth: 0,
  },
}));

export interface PropertySet {
  id?: string;
  name: string;
  values: string[] | number[] | PropertySet[];
}

const StringValue: FC<{
  name: string;
  values: string[];
}> = ({ values }) => (
  <>
    {values.every(value => value === values[0]) ? (
      values[0]
    ) : (
      <Typography variant="body2" color="text.secondary">
        混在
      </Typography>
    )}
  </>
);

const numberFormatAtomFamily = atomFamily(() => atom("mean"));

const NumberValueRoot = styled("div")({
  position: "relative",
});

const StyledSelect = styled(Select)({
  position: "absolute",
  top: "50%",
  right: 0,
  transform: "translateY(-50%)",
  // Increased specificity
  [`& .${selectClasses.select}.${selectClasses.select}`]: {
    paddingTop: 4,
    paddingBottom: 4,
  },
}) as unknown as typeof Select;

const NumberValue: FC<{
  name: string;
  values: number[];
}> = ({ name, values }) => {
  const formatAtom = numberFormatAtomFamily(name);
  const [format, setFormat] = useAtom(formatAtom);
  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      setFormat(event.target.value);
    },
    [setFormat],
  );

  if (values.length === 1 || values.slice(1).every(value => value === values[0])) {
    const roundedValue = roundFloat(values[0]);
    return <>{roundedValue}</>;
  }

  return (
    <NumberValueRoot>
      {format === "mean"
        ? round(mean(values), 1)
        : format === "median"
        ? round(median(values) ?? 0, 1)
        : format === "max"
        ? round(max(values) ?? 0, 1)
        : format === "min"
        ? round(min(values) ?? 0, 1)
        : null}
      <StyledSelect variant="filled" size="small" value={format} onChange={handleChange}>
        <SelectItem value="mean">
          <Typography variant="body2">平均</Typography>
        </SelectItem>
        <SelectItem value="median">
          <Typography variant="body2">中央</Typography>
        </SelectItem>
        <SelectItem value="min">
          <Typography variant="body2">最小</Typography>
        </SelectItem>
        <SelectItem value="max">
          <Typography variant="body2">最大</Typography>
        </SelectItem>
      </StyledSelect>
    </NumberValueRoot>
  );
};

const ObjectValue: FC<{
  id: string;
  name: string;
  values: object[];
  level?: number;
  path?: string[];
  featureType: string;
  ancestorsFeatureType?: string;
}> = ({ id, name, values, level, path, featureType, ancestorsFeatureType }) => {
  const properties = useMemo(() => {
    return intersection(...values.map(v => Object.keys(v ?? {})))
      .filter(name => !name.startsWith("_"))
      .map(name => ({
        name,
        values: values.map(v => (v as Record<string, unknown>)[name]).filter(isNotNullish),
      }))
      .filter(({ values: nextValues }) => {
        if (nextValues.length === 0) {
          return false;
        }
        const type = typeof nextValues[0];
        if (type !== "string" && type !== "number" && type !== "object") {
          return false;
        }
        return (
          nextValues.length === values.length &&
          // eslint-disable-next-line valid-typeof
          nextValues.slice(1).every(value => typeof value === type)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [values]);
  return (
    <PropertyGroup
      id={id}
      name={name}
      properties={properties as PropertySet[]}
      level={level}
      path={path ? [...path, ...(isNaN(Number(name)) ? [name] : [])] : []}
      featureType={featureType}
      ancestorsFeatureType={ancestorsFeatureType}
    />
  );
};

const PropertyNameCell = styled(TableCell)<{
  level?: number;
}>(({ theme, level }) => ({
  ...(level != null && {
    paddingLeft: theme.spacing(level * 2.5 + 2),
    wordBreak: "break-all",
  }),
}));

const Property: FC<{
  property: PropertySet;
  level?: number;
  path?: string[];
  featureType: string;
  ancestorsFeatureType?: string;
}> = ({ property: { id, name, values }, level, path, featureType, ancestorsFeatureType }) => {
  const isPrimitive = ["string", "number"].includes(typeof values[0]);
  const hasAncestors = !!path?.includes(ancestorsKey);
  const actualName = `${hasAncestors ? ancestorsFeatureType : featureType}_${[
    ...((hasAncestors ? path?.filter(p => p !== ancestorsKey) : path) ?? []),
    ...(isNaN(Number(name)) ? [name] : []),
  ].join("_")}`;
  const attrVal = isPrimitive ? getPropertyAttributeValue(actualName) : undefined;

  return isPrimitive ? (
    <TableRow style={{ wordBreak: "break-all" }}>
      <PropertyNameCell variant="head" width="50%" level={level}>
        {makePropertyName(actualName, name, attrVal)}
      </PropertyNameCell>
      <TableCell width="50%">
        {typeof values[0] === "string" ? (
          <StringValue
            name={name}
            values={(values as string[]).map(v =>
              attrVal ? (makePropertyValue(attrVal, v) as string) : v,
            )}
          />
        ) : typeof values[0] === "number" ? (
          <NumberValue
            name={name}
            values={(values as number[]).map(v =>
              attrVal ? (makePropertyValue(attrVal, v) as number) : v,
            )}
          />
        ) : null}
      </TableCell>
    </TableRow>
  ) : (
    <ObjectValue
      id={id ?? name}
      name={name}
      values={values as object[]}
      level={level}
      path={path}
      featureType={featureType}
      ancestorsFeatureType={ancestorsFeatureType}
    />
  );
};

const groupExpandedAtomFamily = atomFamily(() => atom(false));

const PropertyGroupCell = styled(TableCell)<{ level: number }>(({ theme, level }) => ({
  borderBottomWidth: 0,
  paddingLeft: theme.spacing(level * 2.5 + 2),
}));

const PropertyGroupName = styled("div")(({ theme }) => ({
  position: "relative",
  paddingLeft: theme.spacing(2.5),
}));

const TreeArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: `calc(${theme.spacing(-2)} + 4px)`,
  transform: "translateY(-50%)",
}));

const PropertyGroup: FC<{
  id?: string;
  name: string;
  properties: readonly PropertySet[];
  level?: number;
  path?: string[];
  featureType: string;
  ancestorsFeatureType?: string;
}> = ({ id = "", name, properties, level = 0, path, featureType, ancestorsFeatureType }) => {
  const hasAncestors = path?.slice(-1)[0] !== ancestorsKey && !!path?.includes(ancestorsKey);
  const expandedAtom = groupExpandedAtomFamily(id ?? name);
  const [expanded, setExpanded] = useAtom(expandedAtom);
  const handleClick = useCallback(() => {
    setExpanded(value => !value);
  }, [setExpanded]);
  return (
    <>
      <TableRow>
        <PropertyGroupCell variant="head" colSpan={2} level={level}>
          <PropertyGroupName>
            <TreeArrowButton size="small" onClick={handleClick}>
              {expanded ? <TreeArrowExpandedIcon /> : <TreeArrowCollapsedIcon />}
            </TreeArrowButton>
            {isNaN(Number(name))
              ? makePropertyName(
                  `${hasAncestors ? ancestorsFeatureType : featureType}_${[
                    ...(path?.length
                      ? hasAncestors
                        ? path.filter(p => p !== ancestorsKey)
                        : path
                      : [name]),
                  ].join("_")}`,
                  name,
                )
              : name}
          </PropertyGroupName>
        </PropertyGroupCell>
      </TableRow>
      <TableRow>
        <TableCell variant="head" colSpan={2} padding="none">
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <StyledTable size="small">
              <TableBody>
                {properties.map(property => (
                  <Property
                    key={property.name}
                    property={{
                      ...property,
                      id: id + property.name,
                      name: property.name,
                    }}
                    level={level + 1}
                    path={path}
                    featureType={featureType}
                    ancestorsFeatureType={ancestorsFeatureType}
                  />
                ))}
              </TableBody>
            </StyledTable>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export interface PropertyParameterItemProps
  extends Omit<ComponentPropsWithRef<typeof Root>, "children"> {
  properties: readonly PropertySet[];
  labelFontSize?: "small" | "medium";
  featureType: string;
  ancestorsFeatureType?: string;
}

export const PropertyParameterItem = forwardRef<HTMLDivElement, PropertyParameterItemProps>(
  ({ properties, featureType, ancestorsFeatureType, ...props }, ref) => {
    const groups = Object.entries(groupBy(properties, property => property.name))
      .map(([name, properties]) => ({ name, properties }))
      .filter(({ name }) => !name.startsWith("_"));
    return (
      <Root ref={ref} {...props}>
        <StyledTable size="small">
          <TableBody>
            {groups.map(({ name, properties }) =>
              properties.length === 1 ? (
                <Property
                  key={properties[0].name}
                  property={properties[0]}
                  featureType={featureType}
                  ancestorsFeatureType={ancestorsFeatureType}
                />
              ) : (
                <PropertyGroup
                  key={name}
                  name={name}
                  id={name}
                  properties={properties}
                  featureType={featureType}
                  ancestorsFeatureType={ancestorsFeatureType}
                />
              ),
            )}
          </TableBody>
        </StyledTable>
      </Root>
    );
  },
);
