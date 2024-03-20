import { CameraPosition } from "../../reearth/types";

import { ComponentGroup } from "./component";
import { EmphasisProperty } from "./emphasis";

export type GeneralSetting = {
  camera?: CameraPosition | undefined;
  dataFetching?: {
    enabled?: boolean;
    timeInterval?: number;
  };
  featureClickEvent?: {
    eventType: "openFeatureInspector" | "openNewTab";
    urlType?: "manual" | "fromData";
    websiteURL?: string;
    fieldName?: string;
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

export type FeatureInspectorSettings = {
  basic?: {
    titleType: "datasetType" | "custom";
    customTitle: string;
    displayType: "auto" | "builtin" | "propertyList" | "CZMLDescription";
  };
  emphasisProperty?: {
    useTemplate?: boolean;
    templateId?: string;
    properties?: EmphasisProperty[];
  };
};
