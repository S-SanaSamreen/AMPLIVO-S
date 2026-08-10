import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.describe("CRM dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "crm");
  });

  const crmRoutes: { path: string; name: string }[] = [
    { path: "/crm", name: "dashboard" },
    { path: "/crm/clients", name: "clients" },
    { path: "/crm/leads", name: "leads" },
    { path: "/crm/projects", name: "projects" },
    { path: "/crm/invoices", name: "invoices" },
    { path: "/crm/payments", name: "payments" },
    { path: "/crm/reports", name: "reports" },
    { path: "/crm/settings", name: "settings" },
    { path: "/crm/notifications", name: "notifications" },
    { path: "/crm/submissions", name: "submissions" },
    { path: "/crm/employees", name: "employees" },
  ];

  for (const route of crmRoutes) {
    test(`CRM ${route.name} page loads`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator("h1, h2, h3").filter({ hasText: /./ })).toBeVisible();
      await expect(page).toHaveURL(route.path);
    });
  }
});
