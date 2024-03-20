import { test, expect } from "vitest";

import { validateKey, validateURL } from "./regex";

test("validateKey function returns true for valid keys", () => {
  expect(validateKey("valid_key")).toBe(true);
  expect(validateKey("anotherKey123")).toBe(true);
  expect(validateKey("123_456")).toBe(true);
});

test("validateKey function returns false for invalid keys", () => {
  expect(validateKey("")).toBe(false);
  expect(validateKey("too_long_key_to_validate_whether_it_is_valid_or_not")).toBe(false);
  expect(validateKey("with spaces")).toBe(false);
  expect(validateKey("special!char")).toBe(false);
});

test("validateURL function returns true for valid URLs", () => {
  expect(validateURL("http://example.com")).toBe(true);
  expect(validateURL("https://www.example.com")).toBe(true);
  expect(validateURL("ftp://ftp.example.com")).toBe(true);
});

test("validateURL function returns false for invalid URLs", () => {
  expect(validateURL("example.com")).toBe(false);
  expect(validateURL("htp://example.com")).toBe(false);
  expect(validateURL("http://example")).toBe(false);
  expect(validateURL("http://localhost:3000")).toBe(false);
});
