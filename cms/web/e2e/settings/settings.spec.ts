import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { createWorkspace, deleteWorkspace } from "@reearth-cms/e2e/project/utils/workspace";
import { expect, test } from "@reearth-cms/e2e/utils";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createWorkspace(page);
});

test.afterEach(async ({ page }) => {
  await deleteWorkspace(page);
});

test("Tiles CRUD has succeeded", async ({ page }) => {
  await page.getByText("Settings").click();

  await page.getByRole("button", { name: "plus Add new Tiles option" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Default$/ })
    .nth(4)
    .click();
  await page.getByTitle("Labelled").click();
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated");
  await closeNotification(page);
  await page
    .locator("div:last-child > .ant-card-actions > li:nth-child(2) > span > .anticon")
    .click();
  await expect(page.getByText("Labelled", { exact: true })).toBeVisible();
  await page
    .locator("div")
    .filter({ hasText: /^Labelled$/ })
    .nth(4)
    .click();
  await page.getByTitle("URL").locator("div").click();
  await page.getByLabel("Name").click();
  await page.getByLabel("Name").fill("url");
  await page.getByRole("textbox", { name: "URL :", exact: true }).click();
  await page.getByRole("textbox", { name: "URL :", exact: true }).fill("http://url.com");
  await page.getByLabel("Image URL").click();
  await page.getByLabel("Image URL").fill("http://image.com");
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated");
  await closeNotification(page);
  await expect(page.getByText("url", { exact: true })).toBeVisible();
  await expect(page.locator("img")).toBeVisible();
  await page
    .locator("div:last-child > .ant-card-actions > li:nth-child(2) > span > .anticon")
    .click();
  await expect(page.locator("form")).toContainText("URL");
  await expect(page.getByLabel("Name")).toHaveValue("url");
  await expect(page.getByLabel("URL", { exact: true })).toHaveValue("http://url.com");
  await expect(page.getByLabel("Image URL")).toHaveValue("http://image.com");
  await page.getByLabel("Close", { exact: true }).click();
  await page
    .locator("div:last-child > .ant-card-actions > li:nth-child(1) > span > .anticon")
    .click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated");
  await closeNotification(page);
  await expect(page.getByText("url", { exact: true })).not.toBeVisible();
});

test("Terrain on/off and CRUD has succeeded", async ({ page }) => {
  await page.getByText("Settings").click();

  await expect(page.getByRole("switch")).toBeEnabled();
  await page.getByRole("switch").click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("button", { name: "plus Add new Terrain option" })).toBeVisible();
  await page.getByRole("button", { name: "plus Add new Terrain option" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Cesium World Terrain$/ })
    .nth(4)
    .click();
  await page.getByTitle("ArcGIS Terrain").click();
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated workspace!");
  await closeNotification(page);
  await page.getByLabel("edit").locator("svg").click();
  await expect(page.locator("form")).toContainText("ArcGIS Terrain");
  await page
    .locator("div")
    .filter({ hasText: /^ArcGIS Terrain$/ })
    .nth(4)
    .click();
  await page.getByTitle("Cesium Ion").click();
  await page.getByLabel("Name").click();
  await page.getByLabel("Name").fill("name");
  await page.getByLabel("Terrain Cesium Ion asset ID").click();
  await page.getByLabel("Terrain Cesium Ion asset ID").fill("id");
  await page.getByLabel("Terrain Cesium Ion access").click();
  await page.getByLabel("Terrain Cesium Ion access").fill("token");
  await page.getByLabel("Terrain URL").click();
  await page.getByLabel("Terrain URL").fill("http://terrain.com");
  await page.getByLabel("Image URL").click();
  await page.getByLabel("Image URL").fill("http://image.com");
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated workspace!");
  await closeNotification(page);
  await expect(page.getByText("name", { exact: true })).toBeVisible();
  await page.getByLabel("edit").locator("svg").click();
  await expect(page.locator("form")).toContainText("Cesium Ion");
  await expect(page.getByLabel("Name")).toHaveValue("name");
  await expect(page.getByLabel("Terrain Cesium Ion asset ID")).toHaveValue("id");
  await expect(page.getByLabel("Terrain Cesium Ion access")).toHaveValue("token");
  await expect(page.getByLabel("Terrain URL")).toHaveValue("http://terrain.com");
  await expect(page.getByLabel("Image URL")).toHaveValue("http://image.com");
  await page.getByLabel("Close", { exact: true }).click();
  await page.getByLabel("delete").locator("svg").click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated workspace!");
  await closeNotification(page);
  await expect(page.getByText("name", { exact: true })).not.toBeVisible();

  await page.getByRole("switch").click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated workspace!");
  await closeNotification(page);
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("button", { name: "plus Add new Terrain option" })).not.toBeVisible();
});
