import { expect, test } from "vitest";

import { FieldComponent as View2FieldComponent } from "../../types/view2";

import { convertGeneral } from "./general";

test("The component fields from VIEW2.0 should be converted to general setting for VIEW3.0", () => {
  const view2Components: View2FieldComponent[] = [
    {
      id: "",
      position: {
        fov: 1,
        heading: 5,
        height: 682,
        lat: 35,
        lng: 139,
        pitch: -0.8,
        roll: 0,
      },
      type: "idealZoom",
    },
    {
      id: "",
      eventType: "select",
      triggerEvent: "openUrl",
      type: "eventField",
      url: "https://example.com",
      urlType: "manual",
    },
    {
      id: "",
      type: "realtime",
      updateInterval: 50,
      userSettings: {},
    },
  ];

  expect(convertGeneral(view2Components)).toEqual({
    camera: {
      fov: 1,
      heading: 5,
      height: 682,
      lat: 35,
      lng: 139,
      pitch: -0.8,
      roll: 0,
    },
    dataFetching: {
      enabled: true,
      timeInterval: 50,
    },
    featureClickEvent: {
      eventType: "openNewTab",
      urlType: "manual",
      websiteURL: "https://example.com",
      fieldName: undefined,
    },
  });
});

test("When the component is not exist", () => {
  const view2Components: View2FieldComponent[] = [
    {
      id: "",
      type: "switchDataset",
      userSettings: {},
    },
  ];

  expect(convertGeneral(view2Components)).toEqual({
    camera: undefined,
    dataFetching: {
      enabled: false,
      timeInterval: undefined,
    },
    featureClickEvent: {
      eventType: "openFeatureInspector",
      urlType: undefined,
      websiteURL: undefined,
      fieldName: undefined,
    },
  });
});
