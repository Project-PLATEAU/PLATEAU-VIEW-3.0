import { test, expect } from "vitest";

import { capitalizeFirstLetter } from "./stringUtils";

test("capitalizeFirstLetter capitalizes the first letter of a string and converts the rest to lowercase", () => {
  expect(capitalizeFirstLetter("hello")).toBe("Hello");
  expect(capitalizeFirstLetter("wORLD")).toBe("World");
  expect(capitalizeFirstLetter("hElLo")).toBe("Hello");
  expect(capitalizeFirstLetter("")).toBe("");
  expect(capitalizeFirstLetter("a")).toBe("A");
  expect(capitalizeFirstLetter("capitalization")).toBe("Capitalization");
});
