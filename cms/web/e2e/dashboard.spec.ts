import { expect, test } from "@reearth-cms/e2e/utils";

test("Home page is displayed", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("textbox")).toBeVisible();
});
