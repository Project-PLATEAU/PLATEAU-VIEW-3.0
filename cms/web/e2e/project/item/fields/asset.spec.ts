import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { createModel } from "@reearth-cms/e2e/project/utils/model";
import { createProject, deleteProject } from "@reearth-cms/e2e/project/utils/project";
import { expect, test } from "@reearth-cms/e2e/utils";

const uploadFileUrl_1 =
  "https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/tileset.json";
const uploadFileName_1 = "tileset.json";
const uploadFileUrl_2 =
  "https://assets.cms.plateau.reearth.io/assets/ec/0de34c-889a-459a-b49c-47c89d02ee3e/lowpolycar.gltf";
const uploadFileName_2 = "lowpolycar.gltf";

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await createProject(page);
  await createModel(page);
});

test.afterEach(async ({ page }) => {
  await deleteProject(page);
});

test("Asset field creating and updating has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Asset" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("asset1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("asset1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("asset1 description");
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);

  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText("asset1 #asset1");
  await page.getByText("Content").click();
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("asset1");
  await expect(page.getByRole("main")).toContainText("asset1 description");

  await page.getByRole("button", { name: "Asset" }).click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl_1);
  await page.getByRole("button", { name: "Upload and Link" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully added asset!");
  await closeNotification(page);

  await expect(page.getByRole("button", { name: `folder ${uploadFileName_1}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_1, exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByText("tileset.json")).toBeVisible();
  await page.getByRole("link", { name: "edit", exact: true }).click();
  await page.getByRole("button", { name: `folder ${uploadFileName_1}` }).click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl_2);
  await page.getByRole("button", { name: "Upload and Link" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully added asset!");
  await closeNotification(page);
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_2}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_2, exact: true })).toBeVisible();
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByText("lowpolycar.gltf")).toBeVisible();
});

test("Asset field editing has succeeded", async ({ page }) => {
  await page.locator("li").filter({ hasText: "Asset" }).locator("div").first().click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("asset1");
  await page.getByLabel("Settings").locator("#key").click();
  await page.getByLabel("Settings").locator("#key").fill("asset1");
  await page.getByLabel("Settings").locator("#description").click();
  await page.getByLabel("Settings").locator("#description").fill("asset1 description");
  await page.getByRole("tab", { name: "Default value" }).click();
  await page.getByRole("button", { name: "Asset" }).click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();
  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl_1);
  await page.getByRole("button", { name: "Upload and Link" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully added asset!");
  await closeNotification(page);
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_1}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_1, exact: true })).toBeVisible();
  await page.getByLabel("Default value").getByRole("button").nth(3).click();
  await page.getByRole("button", { name: "Asset" }).click();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("no asset");
  await page.getByRole("button", { name: "search" }).click();
  await expect(page.locator(".ant-table-row").first()).not.toBeVisible();
  await page.getByPlaceholder("input search text").click();
  await page.getByPlaceholder("input search text").fill("");
  await page.getByRole("button", { name: "search" }).click();
  await page.locator(".ant-table-row > td").first().getByRole("button").hover();
  await page.locator(".ant-table-row > td").first().getByRole("button").click();
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_1}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_1, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created field!");
  await closeNotification(page);
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("asset1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_1}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_1, exact: true })).toBeVisible();
  await expect(page.getByText("asset1", { exact: true })).toBeVisible();
  await expect(page.getByText("asset1 description")).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await expect(page.getByText(uploadFileName_1)).toBeVisible();
  await page.getByText("Schema").click();
  await page.getByRole("img", { name: "ellipsis" }).locator("svg").click();
  await page.getByLabel("Display name").click();
  await page.getByLabel("Display name").fill("new asset1");
  await page.getByLabel("Field Key").click();
  await page.getByLabel("Field Key").fill("new-asset1");
  await page.getByLabel("Description(optional)").click();
  await page.getByLabel("Description(optional)").fill("new asset1 description");
  await page.getByLabel("Support multiple values").check();
  await page.getByLabel("Use as title").check();
  await page.getByRole("tab", { name: "Validation" }).click();
  await page.getByLabel("Make field required").check();
  await page.getByLabel("Set field as unique").check();
  await page.getByRole("tab", { name: "Default value" }).click();
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_1}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_1, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("button", { name: "Asset" }).click();
  await page.getByRole("button", { name: "upload Upload Asset" }).click();
  await page.getByRole("tab", { name: "URL" }).click();

  await page.getByPlaceholder("Please input a valid URL").click();
  await page.getByPlaceholder("Please input a valid URL").fill(uploadFileUrl_2);
  await page.getByRole("button", { name: "Upload and Link" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully added asset!");
  await closeNotification(page);
  await expect(page.getByRole("button", { name: `folder ${uploadFileName_2}` })).toBeVisible();
  await expect(page.getByRole("button", { name: uploadFileName_2, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "arrow-up" }).nth(1).click();
  await expect(page.locator(".css-7g0azd").nth(0)).toContainText(uploadFileName_2);
  await expect(page.locator(".css-7g0azd").nth(1)).toContainText(uploadFileName_1);
  await page.getByRole("button", { name: "OK" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated field!");
  await closeNotification(page);
  await expect(page.getByLabel("Fields").getByRole("paragraph")).toContainText(
    "new asset1 *#new-asset1(unique)Title",
  );
  await page.getByText("Content").click();
  await expect(page.locator("thead")).toContainText("new asset1");
  await page.getByRole("button", { name: "plus New Item" }).click();
  await expect(page.locator("label")).toContainText("new asset1(unique)Title");
  await expect(page.getByRole("main")).toContainText("new asset1 description");
  await expect(page.locator(".css-7g0azd").nth(0)).toContainText(uploadFileName_2);
  await expect(page.locator(".css-7g0azd").nth(1)).toContainText(uploadFileName_1);
  await page.getByRole("button", { name: "plus New" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText(
    "input: createItem internal system error",
  );
  await closeNotification(page);
  await page.getByRole("button", { name: "delete" }).nth(2).click();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully created Item!");
  await closeNotification(page);
  await page.getByLabel("Back").click();
  await page.getByRole("button", { name: "x2" }).click();
  await expect(page.getByRole("tooltip")).toContainText("new asset1 lowpolycar.gltf tileset.json");
});
