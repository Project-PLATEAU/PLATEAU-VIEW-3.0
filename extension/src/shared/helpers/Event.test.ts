import { it, expect, vi } from "vitest";

import { Event } from "./Event";

it("should executed with the settled value", () => {
  type TestEventValue = { test: string };

  const mockCb = vi.fn();
  const e = new Event<TestEventValue>({ test: "INITIAL" });
  const remove = e.addEventListener(mockCb);
  e.dispatch();
  expect(mockCb).toBeCalledWith({ test: "INITIAL" });
  expect(mockCb).toBeCalledTimes(1);

  e.value = { test: "SECOND" };
  e.dispatch();
  expect(mockCb).toBeCalledWith({ test: "SECOND" });
  expect(mockCb).toBeCalledTimes(2);

  e.dispatch({ test: "THIRD" });
  expect(mockCb).toBeCalledWith({ test: "THIRD" });
  expect(mockCb).toBeCalledTimes(3);

  e.dispatch();
  expect(mockCb).toBeCalledWith({ test: "THIRD" });
  expect(mockCb).toBeCalledTimes(4);

  remove();

  e.dispatch();
  expect(mockCb).toBeCalledTimes(4);
});
