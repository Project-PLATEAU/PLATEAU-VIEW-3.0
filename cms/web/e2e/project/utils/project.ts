import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";

export async function createProject(page: Page) {
  const id = Math.ceil(Math.random() * (100000 - 10000) + 10000).toString();
  await page.getByRole("button", { name: "plus New Project" }).first().click();
  await page.getByRole("dialog").locator("#name").click();
  await page.getByRole("dialog").locator("#name").fill(id);
  await page.getByLabel("Project alias").click();
  await page.getByLabel("Project alias").fill(id);
  await page.getByLabel("Project description").click();
  await page.getByLabel("Project description").fill("e2e project description");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created project!");
  await closeNotification(page);
  await page.getByText(id, { exact: true }).click();
}

export async function deleteProject(page: Page) {
  await page.getByText("Settings").first().click();
  await page.getByRole("button", { name: "Delete Project" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted project!");
  await closeNotification(page);
}
