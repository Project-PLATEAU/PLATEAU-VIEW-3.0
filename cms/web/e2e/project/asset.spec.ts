import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { crudComment } from "./utils/comment";
import { createProject, deleteProject } from "./utils/project";

const uploadFileUrl =
  "https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/tileset.json";
const uploadFileName = "tileset.json";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Asset CRUD and Searching has succeeded", async ({ page }) => {
  await page.getByText("Asset").click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl);
  await page.getByRole("button", { name: "Upload", exact: true }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully added asset!");
  await closeNotification(page);
  await expect(page.getByText(uploadFileName)).toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("no asset");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByText(uploadFileName)).not.toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByText(uploadFileName)).toBeVisible();
  await page.getByLabel("edit").locator("svg").click();
  await page
    .locator("div")
    .filter({ hasText: /^Unknown Type$/ })
    .nth(1)
    .click();
  await page.getByText("GEOJSON/KML/CZML").click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Asset was successfully updated!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Delete").click();
  await expect(page.getByText(uploadFileName)).not.toBeVisible();
  await expect(page.getByRole("alert").last()).toContainText(
    "One or more assets were successfully deleted!",
  );
  await closeNotification(page);
});

test("Donwloading asset has succeeded", async ({ page }) => {
  await page.getByText("Asset").click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl);
  await page.getByRole("button", { name: "Upload", exact: true }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully added asset!");
  await closeNotification(page);
  await expect(page.getByText(uploadFileName)).toBeVisible();

  await page.getByLabel("", { exact: true }).check();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "download Download" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toEqual(uploadFileName);

  await page.getByLabel("edit").locator("svg").click();
  const download1Promise = page.waitForEvent("download");
  await page.getByRole("button", { name: "download Download" }).click();
  const download1 = await download1Promise;
  expect(download1.suggestedFilename()).toEqual(uploadFileName);

  await page.getByLabel("Back").click();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Delete").click();
  await expect(page.getByRole("alert").last()).toContainText(
    "One or more assets were successfully deleted!",
  );
  await closeNotification(page);
});

test("Comment CRUD on edit page has succeeded", async ({ page }) => {
  await page.getByText("Asset").click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl);
  await page.getByRole("button", { name: "Upload", exact: true }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully added asset!");
  await closeNotification(page);
  await expect(page.getByText(uploadFileName)).toBeVisible();

  await page.getByRole("cell", { name: "edit" }).locator("svg").click();
  await page.getByLabel("message").click();
  await expect(page.getByText("CommentsComment")).toBeVisible();
  await crudComment(page);
});

test("Comment CRUD on Asset page has succeeded", async ({ page }) => {
  await page.getByText("Asset").click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl);
  await page.getByRole("button", { name: "Upload", exact: true }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully added asset!");
  await closeNotification(page);
  await expect(page.getByText(uploadFileName)).toBeVisible();

  await page.getByRole("button", { name: "0" }).click();
  await expect(page.getByText("CommentsNo comments.Comment")).toBeVisible();
  await crudComment(page);
});
