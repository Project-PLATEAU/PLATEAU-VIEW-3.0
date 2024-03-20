import { vi, expect, test } from "vitest";

import { FieldComponent as View2Component } from "../../types/view2";

import { convertComponentGroups } from "./componentGroups";

vi.mock("../../../../extension/src/shared/utils/id", () => ({
  generateID: () => "123",
}));

test("Switch group should work", () => {
  const view2Components: View2Component[] = [
    {
      groups: [
        {
          fieldGroupID: "group1",
          id: "",
          title: "急傾斜",
        },
        {
          fieldGroupID: "group2",
          id: "",
          title: "土石流",
        },
        {
          fieldGroupID: "group3",
          id: "",
          title: "地すべり",
        },
      ],
      id: "",
      title: "災害種別",
      type: "switchGroup",
    },
    {
      group: "group1",
      id: "",
      items: [
        {
          color: "#FFED4C",
          condition: {
            key: "",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"1"',
          },
        },
        {
          color: "#FB684C",
          condition: {
            key: "",
            operand: '${attributes["urf:areaType_code"]}',
            operator: "===",
            value: '"2"',
          },
        },
        {
          color: "transparent",
          condition: {
            key: "",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"2"',
          },
        },
        {
          color: "transparent",
          condition: {
            key: "",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"3"',
          },
        },
      ],
      type: "polygonColor",
    },
    {
      group: "group1",
      id: "",
      pointColors: [
        {
          color: "#FFFFFFFF",
          condition: {
            key: "",
            operand: true as unknown as string,
            operator: "===",
            value: true as unknown as string,
          },
        },
        {
          color: "#FFED4C",
          condition: {
            key: "",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"1"',
          },
        },
        {
          color: "#FB684C",
          condition: {
            key: "",
            operand: '${attributes["urf:areaType_code"]}',
            operator: "===",
            value: '"2"',
          },
        },
        {
          color: "transparent",
          condition: {
            key: "",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"2"',
          },
        },
        {
          color: "transparent",
          condition: {
            key: "",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"3"',
          },
        },
      ],
      type: "pointColor",
    },
    {
      group: "group1",
      id: "",
      items: [
        {
          color: "#FFFFFF",
          title: "全て",
        },
        {
          color: "#FB684C",
          title: "急傾斜地の崩落: 特別警戒区域",
        },
        {
          color: "#FFED4C",
          title: "急傾斜地の崩落: 警戒区域",
        },
      ],
      style: "square",
      type: "legend",
    },
    {
      group: "group2",
      id: "lfge9v9s072ece3f8506e",
      items: [
        {
          color: "#EDD86F",
          condition: {
            key: "lfge9wi8fc231c5fbb1cb",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"2"',
          },
        },
        {
          color: "#C04C63",
          condition: {
            key: "lfgebzo23bbb17b2136f6",
            operand: '${attributes["urf:areaType_code"]}',
            operator: "===",
            value: '"2"',
          },
        },
        {
          color: "transparent",
          condition: {
            key: "lfgee2at1286bdd0817a7",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"1"',
          },
        },
        {
          color: "transparent",
          condition: {
            key: "lfgepfvgdc035daf9a77a",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"3"',
          },
        },
      ],
      type: "polygonColor",
    },
    {
      group: "group2",
      id: "lfgeuqhdc5b72eb1acee8",
      items: [
        {
          color: "#C04C63",
          title: "土石流: 特別警戒区域",
        },
        {
          color: "#EDD86F",
          title: "土石流: 警戒区域",
        },
      ],
      style: "square",
      type: "legend",
    },
    {
      group: "group3",
      id: "lfgeottgf51b8f5166a3c",
      items: [
        {
          color: "#FFB74C",
          condition: {
            key: "lfgepsjiadb0f680169ec",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"3"',
          },
        },
        {
          color: "#CA4C95",
          condition: {
            key: "lfgeqdlq5e36cedbc28bb",
            operand: '${attributes["urf:areaType_code"]}',
            operator: "===",
            value: '"2"',
          },
        },
        {
          color: "transparent",
          condition: {
            key: "lfger50962e12b620e498",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"1"',
          },
        },
        {
          color: "transparent",
          condition: {
            key: "lfgere0e1aea1cd71b5a6",
            operand: '${attributes["urf:disasterType_code"]}',
            operator: "===",
            value: '"2"',
          },
        },
      ],
      type: "polygonColor",
    },
    {
      group: "group3",
      id: "lfgewbba2100c7f134976",
      items: [
        {
          color: "#CA4C95",
          title: "地すべり: 特別警戒区域",
        },
        {
          color: "#FFB74C",
          title: "地すべり: 警戒区域",
        },
      ],
      style: "square",
      type: "legend",
    },
  ];

  const result = convertComponentGroups(view2Components, {});
  expect(result).toEqual([
    {
      id: "123",
      name: "急傾斜",
      components: [
        {
          id: "123",
          type: "POLYGON_FILL_COLOR_CONDITION_FIELD",
          preset: {
            rules: [
              {
                id: "123",
                propertyName: 'attributes["urf:disasterType_code"]',
                conditions: [
                  {
                    id: "123",
                    operation: "===",
                    value: "1",
                    color: "#FFED4C",
                    asLegend: true,
                    legendName: "急傾斜地の崩落: 警戒区域",
                  },
                  {
                    id: "123",
                    operation: "===",
                    value: "2",
                    color: "transparent",
                    asLegend: false,
                    legendName: undefined,
                  },
                  {
                    id: "123",
                    operation: "===",
                    value: "3",
                    color: "transparent",
                    asLegend: false,
                    legendName: undefined,
                  },
                ],
              },
              {
                id: "123",
                propertyName: 'attributes["urf:areaType_code"]',
                conditions: [
                  {
                    id: "123",
                    operation: "===",
                    value: "2",
                    color: "#FB684C",
                    asLegend: true,
                    legendName: "急傾斜地の崩落: 特別警戒区域",
                  },
                ],
              },
            ],
          },
        },
        {
          id: "123",
          type: "POINT_FILL_COLOR_CONDITION_FIELD",
          preset: {
            rules: [
              {
                id: "123",
                propertyName: 'attributes["urf:disasterType_code"]',
                conditions: [
                  {
                    id: "123",
                    operation: "===",
                    value: "1",
                    color: "#FFED4C",
                    asLegend: true,
                    legendName: "急傾斜地の崩落: 警戒区域",
                  },
                  {
                    id: "123",
                    operation: "===",
                    value: "2",
                    color: "transparent",
                    asLegend: false,
                    legendName: undefined,
                  },
                  {
                    id: "123",
                    operation: "===",
                    value: "3",
                    color: "transparent",
                    asLegend: false,
                    legendName: undefined,
                  },
                  {
                    id: "123",
                    operation: "!==",
                    value: "1",
                    color: "#FFFFFFFF",
                    asLegend: true,
                    legendName: "全て",
                  },
                ],
              },
              {
                id: "123",
                propertyName: 'attributes["urf:areaType_code"]',
                conditions: [
                  {
                    id: "123",
                    operation: "===",
                    value: "2",
                    color: "#FB684C",
                    asLegend: true,
                    legendName: "急傾斜地の崩落: 特別警戒区域",
                  },
                  {
                    id: "123",
                    operation: "!==",
                    value: "2",
                    color: "#FFFFFFFF",
                    asLegend: true,
                    legendName: "全て",
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      id: "123",
      name: "土石流",
      components: [
        {
          id: "123",
          type: "POLYGON_FILL_COLOR_CONDITION_FIELD",
          preset: {
            rules: [
              {
                id: "123",
                propertyName: 'attributes["urf:disasterType_code"]',
                conditions: [
                  {
                    id: "123",
                    operation: "===",
                    value: "2",
                    color: "#EDD86F",
                    asLegend: true,
                    legendName: "土石流: 警戒区域",
                  },
                  {
                    id: "123",
                    operation: "===",
                    value: "1",
                    color: "transparent",
                    asLegend: false,
                    legendName: undefined,
                  },
                  {
                    id: "123",
                    operation: "===",
                    value: "3",
                    color: "transparent",
                    asLegend: false,
                    legendName: undefined,
                  },
                ],
              },
              {
                id: "123",
                propertyName: 'attributes["urf:areaType_code"]',
                conditions: [
                  {
                    id: "123",
                    operation: "===",
                    value: "2",
                    color: "#C04C63",
                    asLegend: true,
                    legendName: "土石流: 特別警戒区域",
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      id: "123",
      name: "地すべり",
      components: [
        {
          id: "123",
          type: "POLYGON_FILL_COLOR_CONDITION_FIELD",
          preset: {
            rules: [
              {
                id: "123",
                propertyName: 'attributes["urf:disasterType_code"]',
                conditions: [
                  {
                    id: "123",
                    operation: "===",
                    value: "3",
                    color: "#FFB74C",
                    asLegend: true,
                    legendName: "地すべり: 警戒区域",
                  },
                  {
                    id: "123",
                    operation: "===",
                    value: "1",
                    color: "transparent",
                    asLegend: false,
                    legendName: undefined,
                  },
                  {
                    id: "123",
                    operation: "===",
                    value: "2",
                    color: "transparent",
                    asLegend: false,
                    legendName: undefined,
                  },
                ],
              },
              {
                id: "123",
                propertyName: 'attributes["urf:areaType_code"]',
                conditions: [
                  {
                    id: "123",
                    operation: "===",
                    value: "2",
                    color: "#CA4C95",
                    asLegend: true,
                    legendName: "地すべり: 特別警戒区域",
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ]);
});
