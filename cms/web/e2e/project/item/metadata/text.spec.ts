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

test("Text metadata creating and updating has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await expect(page.getByText("Item Information")).toBeVisible();
  await expect(page.getByText("Publish Status")).toBeVisible();
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("text1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("text1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);
  await expect(page.getByText("text1 #text1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("text1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue(
    "text1 description",
  );
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Set maximum length")).toBeEmpty();
  await expect(page.getByLabel("Make field required")).not.toBeChecked();
  await expect(page.getByLabel("Set field as unique")).not.toBeChecked();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toBeEmpty();
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByText("Content").click();
  await expect(page.getByLabel("edit").locator("svg")).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("text1");
  await expect(page.getByRole("main")).toContainText("text1 description");
  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("text1");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.getByLabel("text1")).toHaveValue("text1");
  await page.getByLabel("Back").click();
  await expect(page.getByPlaceholder("-")).toHaveValue("text1");
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await page.getByLabel("text1").click();
  await page.getByLabel("text1").fill("new text1");
  await page.getByLabel("Back").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByPlaceholder("-")).toHaveValue("new text1");

  await page.getByPlaceholder("-").click();
  await page.getByPlaceholder("-").fill("text1");
  await page.locator(".ant-table-body").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByPlaceholder("-")).toHaveValue("text1");
  await page.getByRole("link", { name: "edit", exact: true }).click();

  await expect(page.getByLabel("text1")).toHaveValue("text1");
});

test("Text metadata editing has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Text" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("text1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("text1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("text1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByLabel("Set default value").fill("text1 default value");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("text1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.getByLabel("text1")).toHaveValue("text1 default value");
  await page.getByLabel("Back").click();
  await expect(page.getByPlaceholder("-")).toHaveValue("text1 default value");

  await page.getByText("Schema").click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new text1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-text1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new text1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Set maximum length").click();
  await page.getByLabel("Set maximum length").fill("5");
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "plus New" }).click();
  await page.locator("#defaultValue").nth(1).click();
  await page.locator("#defaultValue").nth(1).fill("text2");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "input: updateField value has 19 characters, but it sholud be shorter than 5 characters",
  );
  await closeNotification(page);
  await page.locator("#defaultValue").nth(0).click();
  await page.locator("#defaultValue").nth(0).fill("text1");
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.locator("#defaultValue").nth(0)).toHaveValue("text2");
  await expect(page.locator("#defaultValue").nth(1)).toHaveValue("text1");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);
  await expect(page.getByLabel("Meta Data")).toContainText("new text1 *#new-text1(unique)");
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new text1");
  await expect(page.getByPlaceholder("-")).toHaveValue("text1 default value");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("new text1(unique)");
  await expect(page.getByRole("main")).toContainText("new text1 description");
  await expect(page.getByRole("textbox").nth(0)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text1");

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.getByLabel("new text1(unique)")).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text1");
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByPlaceholder("-").nth(1)).toHaveValue("text2");
  await expect(page.getByPlaceholder("-").nth(2)).toHaveValue("text1");
  await page.getByPlaceholder("-").nth(1).click();
  await page.getByPlaceholder("-").nth(1).fill("new text2");
  await page.getByRole("tooltip").getByText("new text1").click();
  await expect(page.getByRole("alert").last()).toContainText(
    "input: updateItem value has 9 characters, but it sholud be shorter than 5 characters",
  );
  await closeNotification(page);
  await page.getByRole("button", { name: "x2" }).click();
  await page.getByPlaceholder("-").nth(1).click();
  await page.getByPlaceholder("-").nth(1).fill("text3");
  await page.getByRole("tooltip").getByText("new text1").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("link", { name: "edit", exact: true }).first().click();
  await expect(page.getByLabel("new text1(unique)")).toHaveValue("text3");
  await page.getByRole("button", { name: "plus New" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^0 \/ 5$/ })
    .getByRole("textbox")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^0 \/ 5$/ })
    .getByRole("textbox")
    .fill("text2");
  await page.getByRole("button", { name: "arrow-down" }).first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("button", { name: "arrow-down" }).nth(1).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByLabel("new text1(unique)")).toHaveValue("text1");
  await expect(page.getByRole("textbox").nth(1)).toHaveValue("text2");
  await expect(page.getByRole("textbox").nth(2)).toHaveValue("text3");
  await page.getByRole("button", { name: "delete" }).first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByPlaceholder("-").nth(1)).toHaveValue("text2");
  await expect(page.getByPlaceholder("-").nth(2)).toHaveValue("text3");
});
