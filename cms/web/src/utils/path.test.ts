import { test, expect } from "vitest";

import { splitPathname } from "./path";

test("splitPathname function correctly splits pathname into primary, secondary, and sub routes", () => {
  const pathname1 = "localhost:3000/workspace/xxx";
  const pathname2 = "localhost:3000/workspace/xxx/project/yyy";
  const pathname3 = "localhost:3000/workspace/xxx/project/yyy/content/zzz";

  expect(splitPathname(pathname1)).toEqual(["workspace", undefined, undefined]);
  expect(splitPathname(pathname2)).toEqual(["workspace", "project", undefined]);
  expect(splitPathname(pathname3)).toEqual(["workspace", "project", "content"]);
});
