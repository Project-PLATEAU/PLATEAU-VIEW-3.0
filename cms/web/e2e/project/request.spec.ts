import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { crudComment } from "./utils/comment";
import { createRequest } from "./utils/item";
import { createModel } from "./utils/model";
import { createProject, deleteProject } from "./utils/project";
import { createWorkspace, deleteWorkspace } from "./utils/workspace";

const requestTitle = "title";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  const username = await page.locator("a").nth(1).locator("div").nth(2).locator("p").innerText();

  await createWorkspace(page);
  await createProject(page);
  await createModel(page);
  await createRequest(page, username, requestTitle);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
  await deleteWorkspace(page);
});

test("Request creating, searching, updating reviewer, and approving has succeeded", async ({
  page,
}) => {
  await page.getByText("Request", { exact: true }).click();
  await expect(page.getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(page.getByText("WAITING")).toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("no request");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByText(requestTitle, { exact: true })).not.toBeVisible();
  await expect(page.getByText("WAITING")).not.toBeVisible();
  await page.getByPlaceholder("input search text").fill("");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(page.getByText("WAITING")).toBeVisible();

  await page.getByRole("button", { name: "edit" }).click();
  await page.getByRole("button", { name: "Assign to" }).click();
  await page.getByLabel("close-circle").locator("svg").click();
  await page.locator(".ant-select-selection-overflow").click();
  await page.locator(".ant-select-item").click();
  await page.getByRole("heading", { name: "Reviewer" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated request!");
  await closeNotification(page);
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully approved request!");
  await closeNotification(page);
  await expect(page.getByText(requestTitle, { exact: true })).not.toBeVisible();
  await page.getByRole("cell", { name: "State filter" }).getByRole("button").click();
  await page.getByRole("menuitem", { name: "WAITING" }).getByLabel("").uncheck();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByText("title", { exact: true })).toBeVisible();
  await expect(page.locator("tbody").getByText("APPROVED")).toBeVisible();
});

test("Request closing and reopening has succeeded", async ({ page }) => {
  await page.getByText("Request", { exact: true }).click();
  await expect(page.getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(page.getByText("WAITING")).toBeVisible();
  await page.getByRole("button", { name: "edit" }).click();

  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "One or more requests were successfully closed!",
  );
  await closeNotification(page);
  await expect(page.getByText(requestTitle, { exact: true })).not.toBeVisible();
  await expect(page.getByText("WAITING")).not.toBeVisible();

  await page.getByRole("cell", { name: "State filter" }).getByRole("button").click();
  await page.getByRole("menuitem", { name: "WAITING" }).getByLabel("").uncheck();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.locator("tbody").getByText("CLOSED")).toBeVisible();
  await page.getByRole("button", { name: "edit" }).click();
  await expect(page.getByText("CLOSED", { exact: true })).toBeVisible();
  await expect(page.getByText("Closed", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reopen" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated request!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByText("title", { exact: true })).toBeVisible();
  await expect(page.getByText("WAITING")).toBeVisible();
  await page.getByLabel("", { exact: true }).check();
  await page.getByText("Close").click();
  await expect(page.getByRole("alert").last()).toContainText(
    "One or more requests were successfully closed!",
  );
  await closeNotification(page);
  await page.getByRole("cell", { name: "State filter" }).getByRole("button").click();
  await page.getByRole("menuitem", { name: "WAITING" }).getByLabel("").uncheck();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.locator("tbody").getByText("CLOSED")).toBeVisible();
  await page.getByRole("button", { name: "edit" }).click();
  await expect(page.getByText("CLOSED", { exact: true })).toBeVisible();
});

test("Comment CRUD on edit page has succeeded", async ({ page }) => {
  await page.getByText("Request", { exact: true }).click();
  await expect(page.getByText(requestTitle, { exact: true })).toBeVisible();
  await expect(page.getByText("WAITING")).toBeVisible();
  await page.getByRole("button", { name: "edit" }).click();

  await page.locator("#content").click();
  await page.locator("#content").fill("comment");
  await page.getByRole("button", { name: "Comment" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created comment!");
  await closeNotification(page);
  await expect(page.getByText("comment").nth(1)).toBeVisible();
  await page.getByLabel("edit").locator("svg").click();
  await page.locator("textarea").filter({ hasText: "comment" }).click();
  await page.locator("textarea").filter({ hasText: "comment" }).fill("new comment");
  await page.getByLabel("check").locator("svg").first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated comment!");
  await closeNotification(page);
  await expect(page.getByText("new comment").nth(1)).toBeVisible();
  await page.getByLabel("delete").locator("svg").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted comment!");
  await closeNotification(page);
  await expect(page.getByText("new comment").nth(1)).not.toBeVisible();
});

test("Comment CRUD on Request page has succeeded", async ({ page }) => {
  await page.getByText("Request", { exact: true }).click();
  await page.getByRole("button", { name: "0" }).click();
  await expect(page.getByText("CommentsNo comments.Comment")).toBeVisible();

  await crudComment(page);
});

test("Creating a new request and adding to request has succeeded", async ({ page }) => {
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByRole("button", { name: "ellipsis" }).click();
  await page.getByText("Add to Request").click();
  await page.getByLabel("", { exact: true }).check();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Request!");
  await closeNotification(page);
  await page.getByText("Request", { exact: true }).click();
  await page.getByRole("button", { name: "edit" }).click();
  await expect(page.getByRole("button", { name: "right e2e model name" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "right e2e model name" }).nth(1)).toBeVisible();
});
