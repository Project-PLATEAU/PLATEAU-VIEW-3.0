import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";

export async function createModel(page: Page) {
  await page.getByText("Schema").first().click();
  await page.getByRole("button", { name: "plus Add" }).first().click();
  await page.getByLabel("Model name").click();
  await page.getByLabel("Model name").fill("e2e model name");
  await page.getByLabel("Model key").click();
  await page.getByLabel("Model key").fill("e2e-model-key");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created model!");
  await closeNotification(page);
  await expect(page.getByTitle("e2e model name")).toBeVisible();
  await expect(page.getByText("#e2e-model-key")).toBeVisible();
  await expect(
    page.getByRole("menuitem", { name: "e2e model name" }).locator("span"),
  ).toBeVisible();
}

const updateModelName = "new e2e model name";

async function updateModel(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Edit", { exact: true }).click();
  await page.getByLabel("Update Model").locator("#name").click();
  await page.getByLabel("Update Model").locator("#name").fill(updateModelName);
  await page.getByLabel("Update Model").locator("#key").click();
  await page.getByLabel("Update Model").locator("#key").fill("new-e2e-model-key");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated model!");
  await closeNotification(page);
  await expect(page.getByTitle(updateModelName)).toBeVisible();
  await expect(page.getByText("#new-e2e-model-key")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: updateModelName }).locator("span")).toBeVisible();
}

async function deleteModel(page: Page) {
  await page.getByRole("button", { name: "more" }).hover();
  await page.getByText("Delete").click();
  await page.getByRole("button", { name: "Delete Model" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted model!");
  await closeNotification(page);
  await expect(page.getByTitle(updateModelName)).not.toBeVisible();
}

export async function crudModel(page: Page) {
  await createModel(page);
  await updateModel(page);
  await deleteModel(page);
}
