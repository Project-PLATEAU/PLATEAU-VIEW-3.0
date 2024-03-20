import { CameraPosition } from "../../reearth/types";

import { ComponentGroup } from "./component";
import { EmphasisProperty } from "./emphasis";

export type FeatureClickEventType = "openFeatureInspector" | "openNewTab" | undefined;
export type FeatureClickUrlType = "manual" | "fromData" | undefined;

export type DataFetchingEnableType = boolean | undefined;

export type GeneralSetting = {
  camera?: CameraPosition | undefined;
  dataFetching?: {
    enabled?: DataFetchingEnableType;
    timeInterval?: number;
  };
  featureClickEvent?: {
    eventType?: FeatureClickEventType;
    urlType?: FeatureClickUrlType;
    websiteURL?: string | undefined;
    fieldName?: string | undefined;
  };
  initialLayer?: {
    isInitialLayer?: boolean;
  };
};

export type Setting = {
  id: string; // NOTE: This is set from CMS automatically.
  datasetId: string;
  dataId: string;
  general?: GeneralSetting;
  fieldComponents?: {
    useTemplate?: boolean;
    templateId?: string;
    groups?: ComponentGroup[];
  };
  featureInspector?: FeatureInspectorSettings;
};

export type FeatureInspectorTitleType = "datasetType" | "custom" | undefined;
export type FeatureInspectorDisplayType =
  | "auto"
  | "builtin"
  | "propertyList"
  | "CZMLDescription"
  | undefined;

export type FeatureInspectorSettings = {
  basic?: {
    titleType?: FeatureInspectorTitleType;
    customTitle?: string;
    displayType?: FeatureInspectorDisplayType;
  };
  emphasisProperty?: {
    useTemplate?: boolean;
    templateId?: string;
    properties?: EmphasisProperty[];
  };
};
