import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.describe("admin dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  const adminRoutes: { path: string; name: string }[] = [
    { path: "/admin", name: "dashboard" },
    { path: "/admin/analytics", name: "analytics" },
    { path: "/admin/leads", name: "leads" },
    { path: "/admin/crm", name: "CRM" },
    { path: "/admin/projects", name: "projects" },
    { path: "/admin/campaigns", name: "campaigns" },
    { path: "/admin/influencers", name: "influencers" },
    { path: "/admin/creatives", name: "creatives" },
    { path: "/admin/clients", name: "clients" },
    { path: "/admin/reports", name: "reports" },
    { path: "/admin/team", name: "team" },
    { path: "/admin/roles", name: "roles" },
    { path: "/admin/settings", name: "settings" },
    { path: "/admin/tasks", name: "tasks" },
    { path: "/admin/notifications", name: "notifications" },
  ];

  for (const route of adminRoutes) {
    test(`admin ${route.name} page loads`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator("h1, h2, h3").filter({ hasText: /./ })).toBeVisible();
      await expect(page).toHaveURL(route.path);
    });
  }
});
