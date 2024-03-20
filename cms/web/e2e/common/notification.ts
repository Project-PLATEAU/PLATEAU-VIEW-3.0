import { Page } from "@playwright/test";

export async function closeNotification(page: Page) {
  await page
    .locator(".ant-notification-notice")
    .last()
    .locator(".ant-notification-notice-close")
    .click();
}
