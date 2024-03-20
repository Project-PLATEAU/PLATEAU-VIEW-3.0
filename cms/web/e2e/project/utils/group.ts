import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";

export async function createGroup(page: Page) {
  await page.getByText("Schema").first().click();
  await page.getByRole("button", { name: "plus Add" }).last().click();
  await page.getByLabel("New Group").locator("#name").click();
  await page.getByLabel("New Group").locator("#name").fill("e2e group name");
  await page.getByLabel("New Group").locator("#key").click();
  await page.getByLabel("New Group").locator("#key").fill("e2e-group-key");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created group!");
  await closeNotification(page);
  await expect(page.getByTitle("e2e group name")).toBeVisible();
  await expect(page.getByText("#e2e-group-key")).toBeVisible();
}

const updateGroupName = "new e2e group name";

async function updateGroup(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Edit", { exact: true }).click();
  await page.getByLabel("Update Group").locator("#name").click();
  await page.getByLabel("Update Group").locator("#name").fill(updateGroupName);
  await page.getByLabel("Update Group").locator("#key").click();
  await page.getByLabel("Update Group").locator("#key").fill("new-e2e-group-key");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated group!");
  await closeNotification(page);
  await expect(page.getByTitle(updateGroupName)).toBeVisible();
  await expect(page.getByText("#new-e2e-group-key")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: updateGroupName }).locator("span")).toBeVisible();
}

async function deleteGroup(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Delete").click();
  await page.getByRole("button", { name: "Delete Group" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted group!");
  await closeNotification(page);
  await expect(page.getByTitle(updateGroupName)).not.toBeVisible();
}

export async function crudGroup(page: Page) {
  await createGroup(page);
  await updateGroup(page);
  await deleteGroup(page);
}
