import { closeNotification } from "@reearth-cms/e2e/common/notification";
import { expect, test } from "@reearth-cms/e2e/utils";

let originalUsername: string;
let originalEmail: string;

test.beforeEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("Account").click();
  originalUsername = await page.getByLabel(/Account Name|アカウント名/).inputValue();
  originalEmail = await page.getByLabel(/Your Email|メールアドレス/).inputValue();
});

test.afterEach(async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText(/Account|アカウント/).click();
  const username = await page.getByLabel(/Account Name|アカウント名/).inputValue();
  const email = await page.getByLabel(/Your Email|メールアドレス/).inputValue();
  if (username === originalUsername && email === originalEmail) {
    return;
  } else {
    await page.getByLabel(/Account Name|アカウント名/).fill(originalUsername);
    await page.getByLabel(/Your Email|メールアドレス/).fill(originalEmail);
    await page.locator("form").getByRole("button").first().click();
    await expect(page.getByRole("alert").last()).toContainText("Successfully updated user!");
    await closeNotification(page);
  }
});

test("Name and email updating has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("Account").click();

  await page.getByLabel("Account Name").click();
  await page.getByLabel("Account Name").fill("new name");
  await page.getByLabel("Your Email").click();
  await page.getByLabel("Your Email").fill("test@test.com");
  await page.locator("form").getByRole("button").first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated user!");
  await closeNotification(page);

  await page.getByLabel("Account Name").click();
  await page.getByLabel("Account Name").fill(originalUsername);
  await page.getByLabel("Your Email").click();
  await page.getByLabel("Your Email").fill(originalEmail);
  await page.locator("form").getByRole("button").first().click();
  await expect(page.getByRole("alert").last()).toContainText("Successfully updated user!");
  await closeNotification(page);
  await expect(page.locator("header")).toContainText(originalUsername);
});
