import { test, expect } from "vitest";

import { dateSortCallback, numberSortCallback, stringSortCallback } from "./sort";

test("dateSortCallback sorts dates correctly", () => {
  const date1 = new Date("2022-01-01");
  const date2 = new Date("2022-01-02");
  const date3 = new Date("2022-01-03");

  expect(dateSortCallback(date1, date2)).toBeLessThan(0);
  expect(dateSortCallback(date2, date1)).toBeGreaterThan(0);
  expect(dateSortCallback(date2, date3)).toBeLessThan(0);
  expect(dateSortCallback(date3, date2)).toBeGreaterThan(0);
  expect(dateSortCallback(date1, date1)).toBe(0);
});

test("numberSortCallback sorts numbers correctly", () => {
  expect(numberSortCallback(1, 2)).toBeLessThan(0);
  expect(numberSortCallback(2, 1)).toBeGreaterThan(0);
  expect(numberSortCallback(2, 2)).toBe(0);
});

test("stringSortCallback sorts strings correctly", () => {
  expect(stringSortCallback("apple", "banana")).toBeLessThan(0);
  expect(stringSortCallback("banana", "apple")).toBeGreaterThan(0);
  expect(stringSortCallback("banana", "banana")).toBe(0);
});
