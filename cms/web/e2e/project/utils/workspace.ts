import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";

export async function createWorkspace(page: Page) {
  await page.getByRole("button", { name: "Create a Workspace" }).click();
  await page.getByLabel("Workspace name").click();
  await page.getByLabel("Workspace name").fill("e2e workspace name");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created workspace!");
  await closeNotification(page);
}

export async function deleteWorkspace(page: Page) {
  await page.getByText("Workspace", { exact: true }).click();
  await page.getByRole("button", { name: "Remove Workspace" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted workspace!");
  await closeNotification(page);
}
