import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.describe("HR dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "hr");
  });

  const hrRoutes: { path: string; name: string }[] = [
    { path: "/hr", name: "dashboard" },
    { path: "/hr/applications", name: "applications" },
    { path: "/hr/interviews", name: "interviews" },
    { path: "/hr/jobs", name: "jobs" },
    { path: "/hr/offers", name: "offers" },
    { path: "/hr/reports", name: "reports" },
    { path: "/hr/settings", name: "settings" },
  ];

  for (const route of hrRoutes) {
    test(`HR ${route.name} page loads`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator("h1, h2, h3").filter({ hasText: /./ })).toBeVisible();
      await expect(page).toHaveURL(route.path);
    });
  }
});
