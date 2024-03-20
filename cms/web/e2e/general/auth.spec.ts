import { expect, test } from "@reearth-cms/e2e/utils";

test("Logout has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator("a").nth(1).click();
  await page.getByText("Logout").click();
  await expect(page.getByLabel("Log In")).toBeVisible();
});
