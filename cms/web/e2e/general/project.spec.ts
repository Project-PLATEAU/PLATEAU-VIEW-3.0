import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

test.afterEach(async ({ page }) => {
  await page.getByText("Settings").click();
  await page.getByRole("button", { name: "Delete Project" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully deleted project!");
  await closeNotification(page);
  await expect(page.getByText("new project name", { exact: true })).not.toBeVisible();
});

test("Project CRUD and searching has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "plus New Project" }).click();
  await page.getByLabel("Project name").click();
  await page.getByLabel("Project name").fill("project name");
  await page.getByLabel("Project alias").click();
  await page.getByLabel("Project alias").fill("project alias");
  await page.getByLabel("Project description").click();
  await page.getByLabel("Project description").fill("project description");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("input: createProject invalid alias");
  await closeNotification(page);
  await page.getByLabel("Project alias").click();
  await page.getByLabel("Project alias").fill("project-alias");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created project!");
  await closeNotification(page);

  await expect(page.getByText("project name", { exact: true })).toBeVisible();
  await expect(page.getByText("project description", { exact: true })).toBeVisible();
  await page.locator(".ant-input-affix-wrapper").click();
  await page.getByPlaceholder("search projects").fill("no project");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.getByText("project name", { exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: "close-circle" }).click();
  await expect(page.getByText("project name", { exact: true })).toBeVisible();
  await page.getByText("project name", { exact: true }).click();
  await expect(page.getByText("project name").nth(1)).toBeVisible();
  await expect(page.getByText("project description")).toBeVisible();

  await page.getByText("Settings").click();
  await page.getByLabel("Name").click();
  await page.getByLabel("Name").fill("new project name");
  await page.getByLabel("Description").click();
  await page.getByLabel("Description").fill("new project description");
  await page.locator("form").getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated project!");
  await closeNotification(page);

  await expect(page.locator("#root")).toContainText("Project Settings / new project name");
  await expect(page.locator("header")).toContainText("new project name");
  await page.getByRole("row", { name: "Owner" }).getByRole("switch").click();
  await page.getByRole("button", { name: "Save changes" }).nth(1).click();
  await expect(page.getByRole("row", { name: "Owner" }).getByRole("switch")).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated request roles!");
  await closeNotification(page);

  await page.getByText("Overview").click();
  await expect(page.locator("#root")).toContainText("new project name");
  await expect(page.locator("#root")).toContainText("new project description");
});
