import { test, expect } from "vitest";

import { getExtension } from "./file";

test("getExtension function returns correct extension when filename has extension", () => {
  expect(getExtension("file.txt")).toBe("txt");
  expect(getExtension("document.pdf")).toBe("pdf");
  expect(getExtension("image.jpeg")).toBe("jpeg");
});

test("getExtension function returns empty string when filename does not have an extension", () => {
  expect(getExtension("filename")).toBe("");
  expect(getExtension("anotherfile")).toBe("");
  expect(getExtension("noextension")).toBe("");
});

test("getExtension function returns correct extension when filename has multiple dots", () => {
  expect(getExtension("archive.tar.gz")).toBe("gz");
  expect(getExtension("backup.tar.gz")).toBe("gz");
  expect(getExtension("code.min.js")).toBe("js");
});

test("getExtension function returns empty string when filename is undefined or null", () => {
  expect(getExtension(undefined)).toBe("");
});
