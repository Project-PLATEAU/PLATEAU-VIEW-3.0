import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

test("MyIntegration CRUD has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("My Integrations").click();

  await page.locator("div").filter({ hasText: "Create new integration" }).nth(4).click();
  await page.getByLabel("Integration Name").click();
  await page.getByLabel("Integration Name").fill("name");
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("description");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created integration!");
  await closeNotification(page);

  await page.getByText("namedescription", { exact: true }).first().click();
  await page.getByLabel("Integration Name").click();
  await page.getByLabel("Integration Name").fill("newName");
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("newDescription");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated integration!");
  await closeNotification(page);

  await expect(page.locator("#root")).toContainText("newName");
  await page.getByLabel("Back").click();
  await expect(page.getByRole("main")).toContainText("newNamenewDescription");
  await page.getByText("newNamenewDescription").click();
  await page.getByRole("button", { name: "Remove Integration" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted integration!");
  await closeNotification(page);
  await expect(page.getByRole("main")).not.toContainText("newNamenewDescription");
});

test("Webhook CRUD has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("My Integrations").click();

  await page.locator("div").filter({ hasText: "Create new integration" }).nth(4).click();
  await page.getByLabel("Integration Name").click();
  await page.getByLabel("Integration Name").fill("name");
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("description");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByText("namedescription", { exact: true }).first().click();

  await page.getByRole("tab", { name: "Webhook" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^New Webhook$/ })
    .getByRole("button")
    .click();
  await page.getByLabel("Webhook").locator("#name").click();
  await page.getByLabel("Webhook").locator("#name").fill("webhook name");
  await page.getByLabel("Url").click();
  await page.getByLabel("Url").fill("http://test.com");
  await page.getByLabel("Secret").click();
  await page.getByLabel("Secret").fill("secret");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created webhook!");
  await closeNotification(page);
  await expect(page.getByLabel("Webhook")).toContainText("webhook name");
  await expect(page.getByLabel("Webhook")).toContainText("http://test.com");

  await page.getByLabel("Webhook").getByLabel("setting").locator("svg").click();
  await page.getByLabel("Webhook").locator("#name").click();
  await page.getByLabel("Webhook").locator("#name").fill("new webhook name");
  await page.getByLabel("Url").click();
  await page.getByLabel("Url").fill("http://new.com");
  await page.getByLabel("Secret").click();
  await page.getByLabel("Secret").fill("new secret");
  await page.getByLabel("Create").check();
  await expect(page.getByLabel("Create")).toBeChecked();
  await page.getByLabel("Upload").check();
  await expect(page.getByLabel("Upload")).toBeChecked();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated webhook!");
  await closeNotification(page);
  await expect(page.getByLabel("Webhook")).toContainText("new webhook name");
  await expect(page.getByLabel("Webhook")).toContainText("http://new.com");
  await page.getByLabel("Webhook").getByLabel("setting").locator("svg").click();
  await expect(page.getByLabel("Secret")).toHaveValue("new secret");
  await expect(page.getByLabel("Create")).toBeChecked();
  await expect(page.getByLabel("Upload")).toBeChecked();
  await page.getByLabel("Webhook").locator("svg").click();
  await page.getByRole("switch", { name: "OFF" }).click();
  await expect(page.getByRole("switch")).toContainText("ON");
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated webhook!");
  await closeNotification(page);
  await page.getByLabel("delete").locator("svg").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted webhook!");
  await closeNotification(page);
  await expect(page.getByLabel("Webhook")).not.toContainText("new webhook name");

  await page
    .locator("p")
    .filter({ hasText: "Create a new New Webhook" })
    .getByRole("button")
    .click();
  await page.getByLabel("Webhook").locator("#name").click();
  await page.getByLabel("Webhook").locator("#name").fill("webhook name");
  await page.getByLabel("Url").click();
  await page.getByLabel("Url").fill("http://test.com");
  await page.getByLabel("Secret").click();
  await page.getByLabel("Secret").fill("secret");
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByLabel("delete").locator("svg").click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted webhook!");
  await closeNotification(page);

  await page.getByRole("tab", { name: "General" }).click();
  await page.getByRole("button", { name: "Remove Integration" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted integration!");
  await closeNotification(page);
});
