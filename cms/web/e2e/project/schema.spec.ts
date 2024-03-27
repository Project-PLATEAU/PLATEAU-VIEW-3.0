import { Page } from "@playwright/test";

import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { handleFieldForm } from "./utils/field";
import { crudGroup } from "./utils/group";
import { createModel, crudModel } from "./utils/model";
import { createProject, deleteProject } from "./utils/project";

async function deleteField(page: Page, name: string, key = name) {
  await page.getByLabel("delete").locator("svg").click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.locator("body")).toContainText("Successfully deleted field!");
  await closeNotification(page);
  await expect(page.getByText(`${name} #${key}`)).not.toBeVisible();
}

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Model CRUD has succeeded", async ({ page }) => {
  await crudModel(page);
});

test("Model reordering has succeeded", async ({ page }) => {
  await createModel(page, "model1", "model1");
  await createModel(page, "model2", "model2");
  await expect(
    page.getByRole("main").getByRole("menu").first().getByRole("menuitem").nth(0),
  ).toContainText("model1");
  await expect(
    page.getByRole("main").getByRole("menu").first().getByRole("menuitem").nth(1),
  ).toContainText("model2");
  await page
    .getByRole("main")
    .getByRole("menu")
    .first()
    .getByRole("menuitem")
    .nth(1)
    .dragTo(page.getByRole("main").getByRole("menu").first().getByRole("menuitem").nth(0));
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated models order!");
  await closeNotification(page);
  await expect(
    page.getByRole("main").getByRole("menu").first().getByRole("menuitem").nth(0),
  ).toContainText("model2");
  await expect(
    page.getByRole("main").getByRole("menu").first().getByRole("menuitem").nth(1),
  ).toContainText("model1");
  await createModel(page, "model3", "model3");
  await expect(
    page.getByRole("main").getByRole("menu").first().getByRole("menuitem").nth(0),
  ).toContainText("model2");
  await expect(
    page.getByRole("main").getByRole("menu").first().getByRole("menuitem").nth(1),
  ).toContainText("model1");
  await expect(
    page.getByRole("main").getByRole("menu").first().getByRole("menuitem").nth(2),
  ).toContainText("model3");
});

test("Group CRUD has succeeded", async ({ page }) => {
  await crudGroup(page);
});

test("Group creating from adding field has succeeded", async ({ page }) => {
  await createModel(page);
  await page.locator("li").filter({ hasText: "Group" }).locator("div").first().click();
  await page.getByRole("button", { name: "Create Group" }).click();
  await expect(page.getByLabel("New Group")).toContainText("New Group");
  await expect(page.getByRole("button", { name: "OK" })).toBeDisabled();

  await page.getByLabel("New Group").locator("#name").click();
  await page.getByLabel("New Group").locator("#name").fill("e2e group name");
  await page.getByLabel("New Group").locator("#key").click();
  await page.getByLabel("New Group").locator("#key").fill("e2e-group-key");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created group!");
  await closeNotification(page);
  await expect(
    page.getByRole("menuitem", { name: "e2e group name" }).locator("span"),
  ).toBeVisible();
  await expect(page.getByText("e2e group name#e2e-group-key")).toBeVisible();
  await expect(page.getByText("FieldsMeta Data")).not.toBeVisible();
  await expect(
    page.locator("li").filter({ hasText: "Reference" }).locator("div").first(),
  ).not.toBeVisible();
  await expect(
    page.locator("li").filter({ hasText: "Group" }).locator("div").first(),
  ).not.toBeVisible();
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByText("e2e model name").click();
  await page.locator("li").filter({ hasText: "Group" }).locator("div").first().click();
  await expect(page.getByRole("heading", { name: "Create Group" })).toBeVisible();
  await page.getByLabel("Select Group").click();
  await expect(page.getByText("e2e group name #e2e-group-key")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
});

test("Text field CRUD has succeeded", async ({ page }) => {
  await createModel(page);
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await handleFieldForm(page, "text");
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await handleFieldForm(page, "new text", "new-text");
  await deleteField(page, "new text", "new-text");
});

test("Schema reordering has succeeded", async ({ page }) => {
  await createModel(page);
  await page.locator("li").filter({ hasText: /Text/ }).locator("div").first().click();
  await handleFieldForm(page, "text1");
  await page.locator("li").filter({ hasText: /Text/ }).locator("div").first().click();
  await handleFieldForm(page, "text2");
  await expect(page.getByLabel("Fields").locator(".draggable-item").nth(0)).toContainText(
    "text1 #text1",
  );
  await expect(page.getByLabel("Fields").locator(".draggable-item").nth(1)).toContainText(
    "text2 #text2",
  );
  await page
    .getByLabel("Fields")
    .locator(".draggable-item")
    .nth(1)
    .dragTo(page.getByLabel("Fields").locator(".draggable-item").nth(0));
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);
  await expect(page.getByLabel("Fields").locator(".draggable-item").nth(0)).toContainText(
    "text2 #text2",
  );
  await expect(page.getByLabel("Fields").locator(".draggable-item").nth(1)).toContainText(
    "text1 #text1",
  );
});
