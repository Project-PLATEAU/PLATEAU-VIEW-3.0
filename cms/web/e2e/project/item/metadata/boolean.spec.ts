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

test("Boolean metadata creating and updating has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Boolean" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("boolean1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("boolean1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("boolean1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await expect(page.getByText("boolean1 #boolean1")).toBeVisible();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await expect(page.getByLabel("Display name")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("boolean1");
  await expect(page.getByLabel("Settings").locator("#key")).toHaveValue("boolean1");
  await expect(page.getByLabel("Settings").locator("#description")).toHaveValue(
    "boolean1 description",
  );
  await expect(page.getByLabel("Support multiple values")).not.toBeChecked();
  await page.getByRole("tab", { name: "Validation" }).click();
  await expect(page.getByLabel("Make field required")).not.toBeEnabled();
  await expect(page.getByLabel("Set field as unique")).not.toBeEnabled();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByLabel("Set default value")).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByText("Content").click();
  await expect(page.getByLabel("edit").locator("svg")).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("boolean1");
  await expect(page.getByRole("main")).toContainText("boolean1 description");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.getByLabel("boolean1")).not.toHaveAttribute("aria-checked");
  await page.getByLabel("Back").click();
  await expect(page.getByRole("switch", { name: "close" })).toBeVisible();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await page.getByLabel("boolean1").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByLabel("boolean1")).toHaveAttribute("aria-checked", "true");
  await page.getByLabel("Back").click();
  await page.getByRole("switch", { name: "check" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await expect(page.getByRole("switch", { name: "close" })).toBeVisible();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await expect(page.getByLabel("boolean1")).toHaveAttribute("aria-checked", "false");
});

test("Boolean metadata editing has succeeded", async ({ page }) => {
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.locator("li").filter({ hasText: "Boolean" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("boolean1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("boolean1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("boolean1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByLabel("Set default value").click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("boolean1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await expect(page.getByLabel("boolean1")).toHaveAttribute("aria-checked", "true");
  await page.getByLabel("Back").click();
  await expect(page.getByRole("switch", { name: "check" })).toBeVisible();

  await page.getByText("Schema").click();
  await page.getByRole("tab", { name: "Meta Data" }).click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new boolean1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-boolean1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new boolean1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await page.getByRole("switch").nth(1).click();
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "false");
  await page.getByRole("button", { name: "arrow-down" }).nth(1).click();
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);
  await expect(page.getByLabel("Meta Data")).toContainText("new boolean1 #new-boolean1");
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new boolean1");
  await expect(page.getByRole("switch", { name: "check" })).toBeVisible();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("new boolean1");
  await expect(page.getByText("new boolean1 description")).toBeVisible();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);

  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "true");
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x3" }).click();
  await expect(page.getByRole("switch", { name: "check" }).nth(1)).toBeVisible();
  await expect(page.getByRole("switch", { name: "close" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "check" }).nth(2)).toBeVisible();
  await page.getByRole("switch", { name: "check" }).nth(1).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("link", { name: "edit", exact: true }).first().click();
  await expect(page.getByRole("switch").nth(0)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(1)).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("switch").nth(2)).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("switch").nth(2).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("button", { name: "plus New" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("switch").nth(4).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByRole("button", { name: "delete" }).first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x4" }).click();
  await expect(page.getByRole("switch", { name: "close" }).first()).toBeVisible();
  await expect(page.getByRole("switch", { name: "close" }).nth(1)).toBeVisible();
  await expect(page.getByRole("switch", { name: "close" }).nth(2)).toBeVisible();
  await expect(page.getByRole("tooltip").getByRole("switch", { name: "check" })).toBeVisible();
});
