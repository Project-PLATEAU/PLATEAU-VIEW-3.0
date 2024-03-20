import { expect, test } from "vitest";

import { replaceUnknownDate } from "./clearfyDate";
import type { Json } from "./json";

test("replaceUnknownDate", () => {
  const src: Json = {
    a: "0001-01-01",
    b: {
      c: "0001-01-01",
      d: {
        e: "0001-01-01",
        f: "fff",
      },
    },
  };
  const actual = replaceUnknownDate(src);
  expect(actual).toEqual({
    a: "不明",
    b: {
      c: "不明",
      d: {
        e: "不明",
        f: "fff",
      },
    },
  });
});
