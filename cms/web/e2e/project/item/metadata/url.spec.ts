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

test("Url metadata creating and updating has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await expect(page.getByText("Item Information")).toBeVisible();
  await expect(page.getByText("Publish Status")).toBeVisible();
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
  await expect(page.getByText("url1 #url1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("url1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("url1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue("url1 description");
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
  await expect(page.locator("label")).toContainText("url1");
  await expect(page.getByRole("main")).toContainText("url1 description");
  await page.getByLabel("url1").click();
  await page.getByLabel("url1").fill("http://test1.com");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.getByLabel("url1")).toHaveValue("http://test1.com");
  await page.getByLabel("Back").click();
  await expect(page.getByRole("link", { name: "http://test1.com" })).toBeVisible();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await page.getByLabel("url1").click();
  await page.getByLabel("url1").fill("http://test2.com");
  await page.getByLabel("Back").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByRole("link", { name: "http://test2.com" })).toBeVisible();

  await page.getByRole("link", { name: "http://test2.com" }).hover();
  await page.getByRole("tooltip", { name: "edit" }).locator("svg").click();
  await page.getByPlaceholder("-").fill("http://test3.com");
  await page.locator(".ant-table-body").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByRole("link", { name: "http://test3.com" })).toBeVisible();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await expect(page.getByLabel("url1")).toHaveValue("http://test3.com");
});

test("Url metadata editing has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Url" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("url1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("url1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("url1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("http://default1.com");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("url1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByLabel("url1")).toHaveValue("http://default1.com");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.getByLabel("url1")).toHaveValue("http://default1.com");
  await page.getByLabel("Back").click();
  await expect(page.getByRole("link", { name: "http://default1.com" })).toBeVisible();

  await page.getByText("Schema").click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new url1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-url1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new url1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("http://default1.com");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("http://default2.com");
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.locator("#defaultValue").nth(0)).toHaveValue("http://default2.com");
  await expect(page.locator("#defaultValue").nth(1)).toHaveValue("http://default1.com");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);
  await expect(page.getByLabel("Meta Data")).toContainText("new url1 *#new-url1(unique)");

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new url1");
  await expect(page.getByRole("link", { name: "http://default1.com" })).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByText("url1(unique)")).toBeVisible();
  await expect(page.getByText("url1 description")).toBeVisible();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("http://default2.com");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("http://default1.com");

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("http://default2.com");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("http://default1.com");
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await page.waitForTimeout(100);
  await expect(page.getByRole("tooltip").getByRole("link").nth(0)).toContainText(
    "http://default2.com",
  );
  await expect(page.getByRole("tooltip").getByRole("link").nth(1)).toContainText(
    "http://default1.com",
  );

  await page.getByRole("link", { name: "http://default2.com" }).hover();
  await page.getByRole("tooltip", { name: "edit" }).locator("svg").click();
  await page.getByPlaceholder("-").fill("http://new-default2.com");
  await page.getByRole("tooltip").getByText("new url1").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("link", { name: "edit", exact: true }).first().click();
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("http://new-default2.com");
  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^0 \/ 500$/ })
    .getByRole("textbox")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^0 \/ 500$/ })
    .getByRole("textbox")
    .fill("http://default3.com");
  await page.getByText("url1 description").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("button", { name: "delete" }).first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("button", { name: "arrow-up" }).nth(1).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip").getByRole("link").nth(0)).toContainText(
    "http://default3.com",
  );
  await expect(page.getByRole("tooltip").getByRole("link").nth(1)).toContainText(
    "http://default1.com",
  );
});
