import JP from "jsonpath";
import { intersection } from "lodash-es";

import { LayerModel } from "../../../prototypes/layers";
import { isNotNullish } from "../../../prototypes/type-helpers";
import { layerDatasetTypes } from "../../../prototypes/view/constants/datasetTypeLayers";
import { datasetTypeNames } from "../../../prototypes/view/constants/datasetTypeNames";
import { Feature } from "../../reearth/types/layer";
import { RootLayerForDataset } from "../../view-layers";

import { AttributeValue, getAttributeLabel, getRootFields } from "./attributes";

export const attributesKey = "attributes";
export const ancestorsKey = "ancestors";

const parseJsonPathAsNodes = (obj: any, path: string) => {
  try {
    return JP.nodes(obj, path);
  } catch (e) {
    console.error("FeatureInpector error: ", e);
    return;
  }
};

// `process` should be like `[from (|| from), to]`
export const parseProcess = (process: string | undefined) => {
  if (!process) return;
  if (!process.startsWith("[") || !process.endsWith("]")) return;
  const splitProcess = process.slice(1, -1).split(/ ?, ?/);
  if (splitProcess.length !== 2) return;
  const conditions = splitProcess[0].split(/ ?\|\| ?/);
  const result = splitProcess[1];
  return {
    conditions,
    result,
  };
};

export const makePropertyForFeatureInspector = ({
  features,
  featureInspector,
  layer,
  builtin,
  featureType,
  sortRootPropertyNames,
}: {
  featureInspector?: RootLayerForDataset["featureInspector"];
  layer: LayerModel | undefined;
  features: Pick<Feature, "properties">[];
  builtin?: boolean;
  sortRootPropertyNames?: (names: string[]) => string[];
  featureType: string;
}) => {
  const shouldUseSettingProperty =
    (!builtin &&
      (featureInspector?.basic?.displayType === "auto" || !featureInspector?.basic?.displayType)) ||
    featureInspector?.basic?.displayType === "propertyList";

  const convertedFeatureInspectorProperties = shouldUseSettingProperty
    ? featureInspector?.emphasisProperty?.properties?.map(p => {
        // NOTE: This process is really slow when a lot of features are selected, because JSON Path will be parsed by each feature.
        const nodes = features
          .flatMap(f => (p.jsonPath ? parseJsonPathAsNodes(f.properties, p.jsonPath) : undefined))
          .filter(isNotNullish);
        return {
          ...p,
          nodes,
        };
      })
    : [];
  const settingRootPropertyNames = convertedFeatureInspectorProperties
    ?.map(p =>
      p.nodes.length === features.length
        ? p.nodes[0]?.path.find(key => key !== "$") // Get first value which isn't `$`.
        : undefined,
    )
    .filter(isNotNullish);
  const settingRootProperties =
    convertedFeatureInspectorProperties
      ?.map(p => {
        if (!p.visible) return;
        const lastPathName = p.nodes[0]?.path
          .filter(
            key =>
              key &&
              !["$", "[", "]", "(", ")", ".", "{", "}"].includes(String(key)) &&
              isNaN(Number(key)),
          )
          .join("_");
        const label = lastPathName
          ? getAttributeLabel(`${featureType}_${lastPathName}`)?.description
          : undefined;
        return {
          name: p.displayName || label || lastPathName,
          values: p.nodes
            .map(n => {
              if (!n) return;

              const parsedProcess = parseProcess(p.process);
              if (!parsedProcess) return n.value;

              const match = parsedProcess?.conditions.some(cond => {
                if (isNaN(Number(cond))) {
                  return n.value === cond;
                }
                return n.value === Number(cond) || n.value === cond;
              });
              return match ? parsedProcess.result : n.value;
            })
            .filter(isNotNullish),
        };
      })
      .filter(v => v && !!v.values.length) ?? [];

  // Built-in root properties
  const datasetType = layer
    ? layerDatasetTypes[layer.type] ?? layerDatasetTypes.USE_CASE_LAYER
    : undefined;

  const rawBuiltInRootPropertyNames = intersection(
    features.flatMap(f => Object.keys(f.properties ?? {})),
  );
  const sortedRawBuiltInRootPropertyNames = sortRootPropertyNames
    ? sortRootPropertyNames(rawBuiltInRootPropertyNames)
    : rawBuiltInRootPropertyNames;
  const rawBuiltInRootProperties = !shouldUseSettingProperty
    ? features
        .map(f =>
          layer
            ? getRootFields(
                Object.fromEntries(
                  sortedRawBuiltInRootPropertyNames.map(n => [n, f.properties[n]]),
                ),
                datasetType,
                {
                  name: "title" in layer ? layer?.title : undefined,
                  datasetName: datasetType
                    ? datasetTypeNames[datasetType] ?? datasetTypeNames.usecase
                    : undefined,
                },
              )
            : undefined,
        )
        .filter(v => !!v && !!Object.keys(v).length)
    : [];
  const builtInRootPropertyNames = intersection(
    rawBuiltInRootProperties.flatMap(p => Object.keys(p ?? {})),
  );
  const builtInRootProperties: { name: string; values: any[] }[] = builtInRootPropertyNames
    .map(name => ({
      name,
      values: rawBuiltInRootProperties.map((p: any) => p[name]).filter(isNotNullish),
    }))
    .filter(({ values }) => {
      if (values.length === 0) {
        return false;
      }
      const type = typeof values[0];
      if (type !== "string" && type !== "number" && type !== "object") {
        return false;
      }
      return (
        values.length === features.length &&
        // eslint-disable-next-line valid-typeof
        values.slice(1).every((value: any) => typeof value === type)
      );
    });

  // All attributes
  const shouldDisplayAllAttributes = features.length === 1;
  const rawAllAttributes = shouldDisplayAllAttributes
    ? features
        ?.map(f => f.properties?.[attributesKey] ?? {})
        .filter(v => !!v && !!Object.keys(v).length)
    : undefined;

  return [
    // Root properties
    ...(shouldUseSettingProperty
      ? [
          ...settingRootProperties,
          // Others which don't have the root property and attributes.
          ...intersection(...features.map(f => Object.keys(f.properties)))
            .filter(n => {
              if (n === attributesKey) return false;
              return !settingRootPropertyNames?.includes(n);
            })
            .map(name => {
              const joinedName = `${featureType}_${name}`;
              const attrVal = getPropertyAttributeValue(joinedName);
              return {
                name: makePropertyName(joinedName, name, attrVal) || name,
                values: features
                  .map(f =>
                    attrVal
                      ? makePropertyValue(attrVal, f.properties?.[name])
                      : f.properties?.[name],
                  )
                  .filter(Boolean),
              };
            })
            .filter(({ values }) => features.length === values.length),
        ]
      : builtInRootProperties),
    // All attributes
    ...(rawAllAttributes?.length ? [{ name: "全ての属性", values: rawAllAttributes ?? {} }] : []),
  ];
};

const UNION_MAP = [
  ["_code", "コード"],
  ["code", "コード"],
  ["_uom", "単位"],
  ["uom", "単位"],
] as const;

export const makePropertyName = (name: string, defaultName: string, attrVal_?: AttributeValue) => {
  const attrVal = attrVal_ ?? getPropertyAttributeValue(name);
  if (attrVal) return attrVal.description;

  // Find a name which has a suffix for union.
  const union = UNION_MAP.map(([key, val]) => {
    if (!name.endsWith(key)) return;

    const attr =
      getAttributeLabel(name.split(key)[0])?.description ||
      defaultName.split(key)[0].replaceAll("_", "");

    return attr + val;
  }).filter(Boolean)[0];
  if (union) return union;

  return defaultName.replaceAll("_", "");
};

export const getPropertyAttributeValue = (name: string) => {
  const first = getAttributeLabel(name);
  if (first) return first;

  const featureType = name.split("_")[0];
  if (featureType) {
    const withoutFeatureType = getAttributeLabel(name.split(featureType + "_").slice(-1)[0]);
    if (withoutFeatureType) return withoutFeatureType;
  }

  // Replace urf_function into urf:function.
  const second = getAttributeLabel(
    featureType
      ? [
          featureType,
          name
            .split(featureType + "_")
            .slice(-1)[0]
            .replace("_", ":"),
        ].join("_")
      : name.replace("_", ":"),
  );
  if (second) return second;

  // Find last name, because the nested structure is expressed by `_`.
  // For example, `parent_child_attr` should be `attr`.
  const lastName = name.split("_").slice(-1)[0];
  const third = getAttributeLabel(lastName);
  if (third) return third;
};

export const makePropertyValue = (attr: AttributeValue, val: string | number) => {
  if (["date", "gYear"].includes(attr.dataType ?? "")) {
    return val === 1 || val === "1" || String(val).startsWith("0001") ? "不明" : val;
  }
  if (val === "Null" || val === "null") {
    return "不明";
  }
  return val;
};
