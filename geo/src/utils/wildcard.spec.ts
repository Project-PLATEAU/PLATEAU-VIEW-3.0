import invariant from "tiny-invariant";

import { wildCardToRegExp } from "./wildcard";

test("wildcard()", () => {
  expect(wildCardToRegExp("https://*.example.com")).toBeInstanceOf(RegExp);
  expect(wildCardToRegExp("https://test.example.com")).toBe("https://test.example.com");

  const reg = wildCardToRegExp("https://*.example.com");
  invariant(reg instanceof RegExp);
  expect(reg.test("https://test.example.com")).toBeTruthy();
  expect(reg.test("https://https://test.example.com")).toBeTruthy();
  expect(reg.test("https://test.dev.example.com")).toBeTruthy();
  expect(reg.test("https://test.dev.example.dev.com")).toBeFalsy();
});
