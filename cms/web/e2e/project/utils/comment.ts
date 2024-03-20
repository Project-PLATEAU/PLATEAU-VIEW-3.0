import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect } from "@reearth-cms/e2e/utils";

async function createComment(page: Page) {
  await page.locator("#content").click();
  await page.locator("#content").fill("comment");
  await page.getByRole("button", { name: "Comment" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created comment!");
  await closeNotification(page);
  await expect(page.getByRole("main")).toContainText("comment");
}

async function updateComment(page: Page) {
  await page.getByRole("main").getByRole("complementary").getByLabel("edit").locator("svg").click();
  await page.locator("textarea").filter({ hasText: "comment" }).click();
  await page.locator("textarea").filter({ hasText: "comment" }).fill("new comment");
  await page.getByLabel("check").locator("svg").first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated comment!");
  await closeNotification(page);
  await expect(page.getByRole("main")).toContainText("new comment");
}

async function deleteComment(page: Page) {
  await page.getByLabel("delete").locator("svg").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted comment!");
  await closeNotification(page);
  await expect(page.getByRole("main")).not.toContainText("new comment");
}

export async function crudComment(page: Page) {
  await createComment(page);
  await updateComment(page);
  await deleteComment(page);
}
