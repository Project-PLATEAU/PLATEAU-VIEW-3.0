import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";

export async function handleFieldForm(page: Page, name: string, key = name) {
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill(name);
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill(key);
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByText(`${name} #${key}`)).toBeVisible();
  await expect(page.getByRole("alert").last()).toContainText(
    /Successfully created field!|Successfully updated field!/,
  );
  await closeNotification(page);
}
