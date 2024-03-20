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

test("Int field creating and updating has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Int" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("int1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("int1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("int1 description");

  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("int1 #int1");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("int1");
  await expect(page.getByRole("main")).toContainText("int1 description");
  await page.getByLabel("int1").click();
  await page.getByLabel("int1").fill("1");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "1", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "edit", exact: true }).click();
  await page.getByLabel("int1").click();
  await page.getByLabel("int1").fill("2");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "2", exact: true })).toBeVisible();
});

test("Int field editing has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Int" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("int1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("int1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("int1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("1");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("int1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "1", exact: true })).toBeVisible();

  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new int1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-int1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new int1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByLabel("Use as title").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set minimum value").click();
  await page.getByLabel("Set minimum value").fill("10");
  await page.getByLabel("Set maximum value").click();
  await page.getByLabel("Set maximum value").fill("2");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "input: updateField max must be larger then min",
  );
  await closeNotification(page);
  await page.getByLabel("Set minimum value").click();
  await page.getByLabel("Set minimum value").fill("2");
  await page.getByLabel("Set maximum value").click();
  await page.getByLabel("Set maximum value").fill("10");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeVisible();
  await expect(page.getByLabel("Set default value")).toHaveValue("1");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "input: updateField value should be larger than 2",
  );
  await closeNotification(page);
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("11");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "input: updateField value should be smaller than 10",
  );
  await closeNotification(page);
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("2");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("3");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);

  await expect(page.getByText("new int1 *#new-int1(unique)")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new int1");
  await expect(page.getByRole("cell", { name: "1", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new int1(unique)Title")).toBeVisible();
  await expect(page.getByRole("spinbutton").nth(0)).toHaveValue("2");
  await expect(page.getByRole("spinbutton").nth(1)).toHaveValue("3");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip")).toContainText("new int123");
});
