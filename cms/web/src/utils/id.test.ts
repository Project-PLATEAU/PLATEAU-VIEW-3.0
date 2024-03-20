import { test, expect } from "vitest";

import { newID } from "./id";

test("newID function returns a string", () => {
  const id = newID();
  expect(typeof id).toBe("string");
});

test("newID function returns a lowercase ULID", () => {
  const id = newID();
  expect(id).toMatch(/^[0-9a-z]{26}$/);
});

test("newID function returns unique IDs", () => {
  const id1 = newID();
  const id2 = newID();
  expect(id1).not.toBe(id2);
});
