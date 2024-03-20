import { PrimitiveAtom, WritableAtom, atom, type SetStateAction } from "jotai";
import invariant from "tiny-invariant";

import { LayerModel, LayerType } from "../../prototypes/layers";
import { datasetTypeLayers } from "../../prototypes/view/constants/datasetTypeLayers";
import { PlateauDatasetType } from "../../prototypes/view/constants/plateau";
import { DEFAULT_SETTING_DATA_ID } from "../api/constants";
import {
  ComponentGroup,
  ComponentTemplate,
  EmphasisPropertyTemplate,
  FeatureInspectorSettings,
  GeneralSetting,
  Setting,
  Template,
} from "../api/types";
import { DatasetFragmentFragment, DatasetItem } from "../graphql/types/catalog";
import { REEARTH_DATA_FORMATS } from "../plateau/constants";
import { CameraPosition } from "../reearth/types";
import { sharedStoreAtomWrapper } from "../sharedAtoms";
import { CURRENT_COMPONENT_GROUP_ID, CURRENT_DATA_ID } from "../states/rootLayer";
import { templatesAtom } from "../states/template";

import { makeComponentAtoms } from "./component";
import { createViewLayer } from "./createViewLayer";

export type RootLayerAtomParams = {
  areaCode: string;
  settings: Setting[];
  templates: Template[];
  currentDataId?: string;
  shareId?: string;
  dataset: DatasetFragmentFragment;
};

export type RootLayerParams = {
  datasetId: string;
  type: LayerType;
  title: string;
  dataList: DatasetItem[];
  settings: Setting[];
  templates: Template[];
  currentDataId: string | undefined;
  currentGroupId: string | undefined;
  shareId: string | undefined;
  shouldInitialize: boolean;
};

export type RootLayer = {
  general: GeneralSetting | undefined;
  featureInspector: FeatureInspectorSettings | undefined; // TODO: Use API definition
  layer: PrimitiveAtom<LayerModel>;
};

export type RootLayerConfig = {
  id: string;
  areaCode: string;
  rootLayerAtom: PrimitiveAtom<RootLayer>;
  currentGroupIdAtom: WritableAtom<string | undefined, [update: string | undefined], void>;
  currentDataIdAtom: WritableAtom<string | undefined, [update: string | undefined], void>;
  settingsAtom: WritableAtom<Setting[], [settings: Setting[]], void>;
  rawDataset: DatasetFragmentFragment;
};

const findComponentGroup = (
  setting: Setting | undefined,
  template: ComponentTemplate | undefined,
  currentGroupId: string | undefined,
): ComponentGroup | undefined => {
  const hasTemplate = setting?.fieldComponents?.useTemplate && setting?.fieldComponents?.templateId;
  const groups = hasTemplate ? template?.groups : setting?.fieldComponents?.groups;
  return currentGroupId ? groups?.find(g => g.id === currentGroupId) : groups?.[0];
};

const findSetting = (settings: Setting[], currentDataId: string | undefined) => {
  const result: (Setting | undefined)[] = new Array(2); // [found setting, default setting];
  for (const setting of settings) {
    if (setting.dataId === currentDataId) {
      result[0] = setting;
    }
    if (setting.dataId === DEFAULT_SETTING_DATA_ID) {
      result[1] = setting;
    }
  }

  const [setting, defaultSetting] = result;

  const fieldComponents = setting?.fieldComponents;
  const hasGroups = fieldComponents?.groups?.some(g => !!g.components.length);
  const hasTemplate = fieldComponents?.useTemplate && !!fieldComponents.templateId;

  return hasGroups || hasTemplate ? setting : defaultSetting;
};

const findComponentTemplate = (
  setting: Setting | undefined,
  templates: Template[],
): ComponentTemplate | undefined => {
  const { useTemplate, templateId } = setting?.fieldComponents ?? {};
  if (!useTemplate || !templateId) return;

  const template = templates.find(t => t.id === templateId);

  return template?.type === "component" ? template : undefined;
};

const findEmphasisPropertyTemplate = (
  featureInspector: FeatureInspectorSettings | undefined,
  templates: Template[],
): EmphasisPropertyTemplate | undefined => {
  const { useTemplate, templateId } = featureInspector?.emphasisProperty ?? {};
  if (!useTemplate || !templateId) return;

  const template = templates.find(t => t.id === templateId);

  return template?.type === "emphasis" ? template : undefined;
};

const findData = (dataList: DatasetItem[], currentDataId: string | undefined) =>
  currentDataId ? dataList.find(d => d.id === currentDataId) : dataList[0];

const createViewLayerWithComponentGroup = (
  datasetId: string,
  type: LayerType,
  title: string,
  setting: Setting | undefined,
  template: ComponentTemplate | undefined,
  data: DatasetItem | undefined,
  componentGroup: ComponentGroup | undefined,
  shareId: string | undefined,
  shouldInitialize: boolean,
): LayerModel => {
  invariant(type);
  return {
    ...createViewLayer({
      type,
      municipalityCode: "",
      title,
      datasetId,
      shareId,
      textured: data?.name !== "LOD1" && data?.name !== "LOD2（テクスチャなし）",
      shouldInitializeAtom: shouldInitialize,
    }),
    componentAtoms: makeComponentAtoms(
      datasetId,
      componentGroup?.components ?? [],
      shareId,
      shouldInitialize,
    ),
    id: datasetId,
    format: data?.format ? REEARTH_DATA_FORMATS[data.format] : undefined,
    url: data?.url,
    layers: data?.layers ?? undefined,
    cameraAtom: atom<CameraPosition, [SetStateAction<CameraPosition>], unknown>(undefined, null),
    componentGroups: (template ?? setting?.fieldComponents)?.groups?.map(
      g => [g.id, g.name] as [id: string, name: string],
    ),
  };
};

// TODO: Get layer from specified dataset
const createRootLayer = ({
  datasetId,
  type,
  title,
  dataList,
  settings,
  templates,
  currentDataId,
  currentGroupId,
  shareId,
  shouldInitialize,
}: RootLayerParams): RootLayer => {
  const setting = findSetting(settings, currentDataId);
  const data = findData(dataList, currentDataId);
  const componentTemplate = findComponentTemplate(setting, templates);
  const emphasisPropertyTemplate = findEmphasisPropertyTemplate(
    setting?.featureInspector,
    templates,
  );
  const componentGroup = findComponentGroup(setting, componentTemplate, currentGroupId);

  return {
    // TODO: get settings from featureInspectorTemplate
    general: setting?.general,
    featureInspector: setting?.featureInspector
      ? {
          ...setting.featureInspector,
          emphasisProperty: {
            ...(setting.featureInspector.emphasisProperty ?? {}),
            properties: emphasisPropertyTemplate?.properties,
          },
        }
      : undefined,
    layer: atom(
      createViewLayerWithComponentGroup(
        datasetId,
        type,
        title,
        setting,
        componentTemplate,
        data,
        componentGroup,
        shareId,
        shouldInitialize,
      ),
    ),
  };
};

export const createRootLayerAtom = (params: RootLayerAtomParams): RootLayerConfig => {
  const dataset = params.dataset;
  const dataList = dataset.items as DatasetItem[];
  const type = datasetTypeLayers[dataset.type.code as PlateauDatasetType];

  const initialSettings = params.settings;
  const initialTemplates = params.templates;
  const initialCurrentDataId = params.currentDataId ?? dataList[0].id;
  const rootLayerAtom = atom<RootLayer>(
    createRootLayer({
      datasetId: dataset.id,
      type,
      title: dataset.name,
      dataList,
      settings: initialSettings,
      templates: initialTemplates,
      currentDataId: initialCurrentDataId,
      currentGroupId: undefined,
      shareId: params.shareId,
      shouldInitialize: true,
    }),
  );

  const settingsPrimitiveAtom = atom(initialSettings);

  const settingsAtom = atom(
    get => get(settingsPrimitiveAtom),
    (get, set, settings: Setting[]) => {
      const currentDataId = get(currentDataIdAtom);
      const currentGroupId = get(currentGroupIdAtom);

      set(
        rootLayerAtom,
        createRootLayer({
          datasetId: dataset.id,
          type,
          title: dataset.name,
          dataList,
          settings: settings,
          templates: get(templatesAtom),
          currentDataId: currentDataId,
          currentGroupId: currentGroupId,
          shareId: params.shareId,
          shouldInitialize: false,
        }),
      );
      set(settingsPrimitiveAtom, settings);
    },
  );

  const currentDataIdAtom = atom<string | undefined>(initialCurrentDataId);

  const currentGroupIdAtom = atom<string | undefined, any[], unknown>(undefined, null);

  const currentDataIdAtomAtom = atom(
    get => get(currentDataIdAtom),
    (get, set, update: string | undefined) => {
      const currentDataId = get(currentDataIdAtom);
      if (currentDataId === update) return;

      const currentGroupId = get(currentGroupIdAtom);
      set(
        rootLayerAtom,
        createRootLayer({
          datasetId: dataset.id,
          type,
          title: dataset.name,
          dataList,
          settings: get(settingsPrimitiveAtom),
          templates: get(templatesAtom),
          currentDataId: update ?? currentDataId,
          currentGroupId: currentGroupId,
          shareId: params.shareId,
          shouldInitialize: false,
        }),
      );
      set(currentDataIdAtom, () => update);
    },
  );

  const currentGroupIdAtomAtom = atom(
    get => get(currentGroupIdAtom),
    (get, set, update: string | undefined) => {
      const currentGroupId = get(currentGroupIdAtom);
      if (currentGroupId === update) return;

      const rootLayer = get(rootLayerAtom);
      const currentDataId = get(currentDataIdAtom);
      const setting = findSetting(get(settingsPrimitiveAtom), currentDataId);
      const data = findData(dataList, currentDataId);
      const template = findComponentTemplate(setting, get(templatesAtom));
      const group = findComponentGroup(setting, template, update);

      set(
        rootLayer.layer,
        createViewLayerWithComponentGroup(
          dataset.id,
          type,
          dataset.name,
          setting,
          template,
          data,
          group,
          params.shareId,
          false,
        ),
      );
      set(currentGroupIdAtom, () => update);
    },
  );

  const shareableCurrentDataIdName = `${dataset.id}_${CURRENT_DATA_ID}${
    params.shareId ? `_${params.shareId}` : ""
  }`;
  const shareableCurrentDataIdAtom = sharedStoreAtomWrapper(
    shareableCurrentDataIdName,
    currentDataIdAtomAtom,
  );

  const shareableCurrentComponentGroupIdName = `${dataset.id}_${CURRENT_COMPONENT_GROUP_ID}${
    params.shareId ? `_${params.shareId}` : ""
  }`;
  const shareableCurrentGroupIdAtom = sharedStoreAtomWrapper(
    shareableCurrentComponentGroupIdName,
    currentGroupIdAtomAtom,
  );

  return {
    id: dataset.id,
    areaCode: params.areaCode,
    rootLayerAtom: atom(
      get => get(rootLayerAtom),
      () => {}, // readonly
    ),
    currentDataIdAtom: shareableCurrentDataIdAtom,
    currentGroupIdAtom: shareableCurrentGroupIdAtom,
    settingsAtom,
    rawDataset: dataset,
  };
};
