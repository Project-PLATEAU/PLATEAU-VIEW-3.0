import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { crudComment } from "./utils/comment";
import { handleFieldForm } from "./utils/field";
import { createModel } from "./utils/model";
import { createProject, deleteProject } from "./utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Item CRUD and searching has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("no field");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).not.toBeVisible();
  await page.getByPlaceholder("input search text").fill("");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByRole("cell", { name: "text", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await page.getByLabel("text").click();

  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("new text");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "new text" })).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Delete").click();
  await expect(page.getByRole("alert").last()).toContainText(
    "One or more items were successfully deleted!",
  );
  await closeNotification(page);
  await expect(page.getByRole("cell", { name: "new text" })).not.toBeVisible();
});

test("Publishing and Unpublishing item has succeeded", async ({ page }) => {
  await page
    .locator("li")
    .filter({ hasText: "TextHeading and titles, one-" })
    .locator("div")
    .first()
    .click();
  await handleFieldForm(page, "text");
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully published items!");
  await closeNotification(page);
  await expect(page.getByText("PUBLIC")).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("PUBLIC")).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Unpublish").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully unpublished items!");
  await closeNotification(page);
  await expect(page.getByText("DRAFT")).toBeVisible();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await expect(page.getByText("DRAFT")).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully published items!");
  await closeNotification(page);
  await expect(page.getByText("PUBLIC")).toBeVisible();
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByText("Unpublish").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully unpublished items!");
  await closeNotification(page);
  await expect(page.getByText("DRAFT")).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("DRAFT")).toBeVisible();
});

test("Comment CRUD on Content page has succeeded", async ({ page }) => {
  await page
    .locator("li")
    .filter({ hasText: "TextHeading and titles, one-" })
    .locator("div")
    .first()
    .click();
  await handleFieldForm(page, "text");
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);

  await page.getByLabel("Back").click();

  await page.getByRole("button", { name: "0" }).click();
  await expect(page.getByText("CommentsNo comments.Comment")).toBeVisible();
  await crudComment(page);
});

test("Comment CRUD on edit page has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await closeNotification(page);
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByLabel("text").click();
  await page.getByLabel("text").fill("text");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("message").click();
  await expect(page.getByText("CommentsComment")).toBeVisible();
  await crudComment(page);
});
