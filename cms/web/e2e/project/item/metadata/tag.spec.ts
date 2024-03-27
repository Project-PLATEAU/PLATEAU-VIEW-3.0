import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { expect, test } from "@reearth-cms/e2e/utils";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Tag metadata creating and updating has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Tag" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("tag1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("tag1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("tag1 description");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("div").filter({ hasText: /^Tag$/ }).click();
  await page.getByLabel("Set Tags").fill("Tag1");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("div").filter({ hasText: /^Tag$/ }).click();
  await page.locator("#tags").nth(1).fill("Tag2");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await expect(page.getByText("tag1 #tag1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("tag1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("tag1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue("tag1 description");
  await expect(page.getByText("Tag1", { exact: true })).toBeVisible();
  await expect(page.getByText("Tag2")).toBeVisible();
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).not.toBeChecked();
  await expect(page.getByLabel("Set field as unique")).not.toBeChecked();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeEmpty();
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByText("Content").click();
  await expect(page.getByLabel("edit").locator("svg")).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("tag1");
  await expect(page.getByRole("main")).toContainText("tag1 description");
  await page.getByLabel("tag1").click();
  await page
    .locator("div")
    .filter({ hasText: /^Tag1$/ })
    .nth(1)
    .click();
  await expect(page.locator("#root").getByText("Tag1", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.locator("#root").getByText("Tag1", { exact: true })).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("Tag1", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await page.getByLabel("close-circle").locator("svg").click();
  await page.getByLabel("tag1").click();
  await page
    .locator("div")
    .filter({ hasText: /^Tag2$/ })
    .nth(1)
    .click();
  await page.getByText("tag1", { exact: true }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.locator("#root").getByText("Tag2")).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("Tag2")).toBeVisible();
  await page.getByRole("cell", { name: "Tag2" }).locator("span").nth(1).click();
  await page
    .locator("div")
    .filter({ hasText: /^Tag1$/ })
    .nth(2)
    .click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.locator("tbody").getByText("Tag1").first()).toBeVisible();
  await page.getByRole("cell", { name: "Tag1", exact: true }).locator("svg").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.locator("#root").getByText("Tag1", { exact: true }).first()).not.toBeVisible();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await expect(page.locator("#root").getByText("Tag1", { exact: true })).not.toBeVisible();
});

test("Tag metadata editing has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Tag" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("tag1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("tag1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("tag1 description");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("div").filter({ hasText: /^Tag$/ }).click();
  await page.getByLabel("Set Tags").fill("Tag1");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("div").filter({ hasText: /^Tag$/ }).click();
  await page.locator("#tags").nth(1).fill("Tag2");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page
    .locator("div")
    .filter({ hasText: /^Tag1$/ })
    .nth(3)
    .click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("tag1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.getByText("Tag1", { exact: true })).toBeVisible();
  await page.getByLabel("Back").click();
  await expect(page.getByText("Tag1", { exact: true })).toBeVisible();

  await page.getByText("Schema").click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new tag1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-tag1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new tag1 description");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("div").filter({ hasText: /^Tag$/ }).click();
  await page.locator("#tags").nth(2).fill("Tag3");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Default value", { exact: true }).getByText("Tag1")).toBeVisible();
  await page.locator(".ant-select-selector").click();
  await expect(page.getByText("Tag1").last()).toBeVisible();
  await page.getByText("Tag2").nth(2).click();
  await page.getByText("Tag3").nth(2).click();
  await expect(page.getByLabel("Update Tag").getByText("Tag1Tag2Tag3")).toBeVisible();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByRole("button", { name: "delete" }).first().click();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Update Tag").getByText("Tag2Tag3")).toBeVisible();
  await page.locator(".ant-select-selector").click();
  await expect(page.getByText("Tag1").last()).not.toBeVisible();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);
  await expect(page.getByLabel("Meta Data")).toContainText("new tag1 *#new-tag1(unique)");
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new tag1");
  await expect(page.getByText("Tag1", { exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("new tag1(unique)");
  await expect(page.getByText("Tag2Tag3")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);

  await expect(page.getByText("Tag2Tag3")).toBeVisible();
  await page.getByLabel("Back").click();
  await page.getByRole("cell", { name: "Tag2 Tag3" }).click();
  await page.getByText("Tag2").nth(2).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("link", { name: "edit", exact: true }).first().click();
  await expect(page.getByText("Tag3")).toBeVisible();
  await page.getByLabel("close-circle").locator("svg").click();
  await expect(page.getByText("Please input field!")).toBeVisible();
  await page.locator(".ant-select-selector").click();
  await page.getByText("Tag2").click();
  await page.getByLabel("Back").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByText("Tag2")).toBeVisible();
});
