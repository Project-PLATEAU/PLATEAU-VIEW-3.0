import { expect, test } from "vitest";

import { parseProcess } from "./utils";

test("parseProcess", () => {
  expect(parseProcess("[1 || value, result]")).toEqual({
    conditions: ["1", "value"],
    result: "result",
  });
  expect(parseProcess("[1, result]")).toEqual({
    conditions: ["1"],
    result: "result",
  });
  expect(parseProcess("[, result]")).toEqual({
    conditions: [""],
    result: "result",
  });
  expect(parseProcess("abc")).toBeUndefined();
});
