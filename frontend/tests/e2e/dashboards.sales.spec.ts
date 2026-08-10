import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.describe("sales dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "sales");
  });

  const salesRoutes: { path: string; name: string }[] = [
    { path: "/sales", name: "dashboard" },
    { path: "/sales/leads", name: "leads" },
    { path: "/sales/meetings", name: "meetings" },
    { path: "/sales/invoices", name: "invoices" },
    { path: "/sales/reports", name: "reports" },
    { path: "/sales/calendar", name: "calendar" },
    { path: "/sales/settings", name: "settings" },
    { path: "/sales/notifications", name: "notifications" },
    { path: "/sales/profile", name: "profile" },
  ];

  for (const route of salesRoutes) {
    test(`sales ${route.name} page loads`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator("h1, h2, h3").filter({ hasText: /./ })).toBeVisible();
      await expect(page).toHaveURL(route.path);
    });
  }
});
