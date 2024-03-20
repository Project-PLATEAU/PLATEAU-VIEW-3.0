import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

import { createProject, deleteProject } from "./utils/project";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Update settings on Accesibility page has succeeded", async ({ page }) => {
  await page.getByText("Accessibility").click();
  await page.getByText("Private").click();
  await page.getByText("Public", { exact: true }).click();
  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("new-e2e-project-alias");
  await page.getByRole("switch").click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "Successfully updated publication settings!",
  );
  await closeNotification(page);
  await expect(page.locator("form")).toContainText("Public");
  await expect(page.getByRole("textbox")).toHaveValue("new-e2e-project-alias");
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator("tbody")).toContainText(
    "http://localhost:8080/api/p/new-e2e-project-alias/assets",
  );
});
