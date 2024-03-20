import { expect, test } from "vitest";

import { roundFloat } from "./number";

test("roundFloat", () => {
  expect(roundFloat(12.3450000000001)).toBe(12.345);
  expect(roundFloat(12)).toBe(12);
});
