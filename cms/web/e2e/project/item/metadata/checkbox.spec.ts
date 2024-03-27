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

test("Checkbox metadata creating and updating has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Check Box" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("checkbox1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("checkbox1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("checkbox1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await expect(page.getByText("checkbox1 #checkbox1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("checkbox1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("checkbox1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue(
    "checkbox1 description",
  );
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).not.toBeEnabled();
  await expect(page.getByLabel("Set field as unique")).not.toBeEnabled();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).not.toBeChecked();
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByText("Content").click();
  await expect(page.getByLabel("edit").locator("svg")).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label").first()).toContainText("checkbox1");
  await expect(page.getByRole("main")).toContainText("checkbox1 description");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.getByLabel("checkbox1")).not.toBeChecked();
  await page.getByLabel("Back").click();
  await expect(page.getByLabel("", { exact: true }).nth(1)).not.toBeChecked();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await page.getByLabel("checkbox1").check();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByLabel("checkbox1")).toBeChecked();
  await page.getByLabel("Back").click();
  await expect(page.getByLabel("", { exact: true }).nth(1)).toBeChecked();
  await page.getByLabel("", { exact: true }).nth(1).uncheck();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByLabel("", { exact: true }).nth(1)).not.toBeChecked();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await expect(page.getByLabel("checkbox1")).not.toBeChecked();
});

test("Checkbox metadata editing has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Check Box" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("checkbox1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("checkbox1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("checkbox1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").check();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("checkbox1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByLabel("checkbox1")).toBeChecked();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.getByLabel("checkbox1")).toBeChecked();
  await page.getByLabel("Back").click();
  await expect(page.getByLabel("", { exact: true }).nth(1)).toBeChecked();

  await page.getByText("Schema").click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new checkbox1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-checkbox1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new checkbox1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("", { exact: true })).toBeChecked();
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByLabel("", { exact: true }).nth(1)).not.toBeChecked();
  await page.getByLabel("", { exact: true }).nth(1).check();
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByLabel("", { exact: true }).nth(2)).not.toBeChecked();
  await page.getByRole("button", { name: "arrow-down" }).nth(1).click();
  await expect(page.getByLabel("", { exact: true }).nth(1)).not.toBeChecked();
  await expect(page.getByLabel("", { exact: true }).nth(2)).toBeChecked();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);

  await expect(page.getByLabel("Meta Data")).toContainText("new checkbox1 #new-checkbox1");
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new checkbox1");
  await expect(page.getByLabel("", { exact: true }).nth(1)).toBeChecked();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label").first()).toContainText("new checkbox1");
  await expect(page.getByText("new checkbox1 description")).toBeVisible();
  await expect(page.getByLabel("", { exact: true }).nth(0)).toBeChecked();
  await expect(page.getByLabel("", { exact: true }).nth(1)).not.toBeChecked();
  await expect(page.getByLabel("", { exact: true }).nth(2)).toBeChecked();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);

  await expect(page.getByLabel("", { exact: true }).nth(0)).toBeChecked();
  await expect(page.getByLabel("", { exact: true }).nth(1)).not.toBeChecked();
  await expect(page.getByLabel("", { exact: true }).nth(2)).toBeChecked();
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(
    page.getByRole("tooltip", { name: "new checkbox1" }).getByLabel("").nth(0),
  ).toBeChecked();
  await expect(
    page.getByRole("tooltip", { name: "new checkbox1" }).getByLabel("").nth(1),
  ).not.toBeChecked();
  await expect(
    page.getByRole("tooltip", { name: "new checkbox1" }).getByLabel("").nth(2),
  ).toBeChecked();
  await page.getByRole("tooltip", { name: "new checkbox1" }).getByLabel("").nth(1).check();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("link", { name: "edit", exact: true }).first().click();
  await expect(page.getByLabel("", { exact: true }).nth(0)).toBeChecked();
  await expect(page.getByLabel("", { exact: true }).nth(1)).toBeChecked();
  await expect(page.getByLabel("", { exact: true }).nth(2)).toBeChecked();
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("", { exact: true }).nth(2).uncheck();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("", { exact: true }).nth(4).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("button", { name: "delete" }).first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByLabel("", { exact: true }).nth(0)).toBeChecked();
  await expect(page.getByLabel("", { exact: true }).nth(1)).not.toBeChecked();
  await expect(page.getByLabel("", { exact: true }).nth(2)).not.toBeChecked();
  await expect(page.getByLabel("", { exact: true }).nth(3)).toBeChecked();
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x4" }).click();
  await expect(
    page.getByRole("tooltip", { name: "new checkbox1" }).getByLabel("").nth(0),
  ).toBeChecked();
  await expect(
    page.getByRole("tooltip", { name: "new checkbox1" }).getByLabel("").nth(1),
  ).not.toBeChecked();
  await expect(
    page.getByRole("tooltip", { name: "new checkbox1" }).getByLabel("").nth(2),
  ).not.toBeChecked();
  await expect(
    page.getByRole("tooltip", { name: "new checkbox1" }).getByLabel("").nth(3),
  ).toBeChecked();
});
