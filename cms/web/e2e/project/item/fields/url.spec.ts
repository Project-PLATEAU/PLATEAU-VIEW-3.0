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

test("URL field creating and updating has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "URL" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("url1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("url1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("url1 description");

  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("url1 #url1");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("url1");
  await expect(page.getByRole("main")).toContainText("url1 description");
  await page.getByLabel("url1").click();
  await page.getByLabel("url1").fill("http://test1.com");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "http://test1.com", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "edit", exact: true }).click();
  await page.getByLabel("url1").click();
  await page.getByLabel("url1").fill("http://test2.com");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "http://test2.com", exact: true })).toBeVisible();
});

test("URL field editing has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "URL" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("url1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("url1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("url1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("http://test1.com");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("url1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByRole("cell", { name: "http://test1.com", exact: true })).toBeVisible();

  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new url1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-url1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new url1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByLabel("Use as title").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("http://test1.com");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("http://test2.com");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);

  await expect(page.getByText("new url1 *#new-url1(unique)")).toBeVisible();
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new url1");
  await expect(page.getByRole("cell", { name: "http://test1.com", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("new url1(unique)Title")).toBeVisible();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("http://test1.com");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("http://test2.com");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip")).toContainText("http://test1.comhttp://test2.com");

  await expect(page.getByRole("tooltip")).toContainText("new url1http://test1.comhttp://test2.com");
});
