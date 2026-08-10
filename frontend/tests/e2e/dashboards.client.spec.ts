import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.describe("client portal dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "client");
  });

  const clientRoutes: { path: string; name: string }[] = [
    { path: "/portal", name: "dashboard" },
    { path: "/portal/analytics", name: "analytics" },
    { path: "/portal/leads", name: "leads" },
    { path: "/portal/campaigns", name: "campaigns" },
    { path: "/portal/creatives", name: "creatives" },
    { path: "/portal/projects", name: "projects" },
    { path: "/portal/invoices", name: "invoices" },
    { path: "/portal/payments", name: "payments" },
    { path: "/portal/calendar", name: "calendar" },
    { path: "/portal/documents", name: "documents" },
    { path: "/portal/messages", name: "messages" },
    { path: "/portal/notifications", name: "notifications" },
    { path: "/portal/settings", name: "settings" },
    { path: "/portal/support", name: "support" },
    { path: "/portal/seo", name: "SEO" },
  ];

  for (const route of clientRoutes) {
    test(`client portal ${route.name} page loads`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator("h1, h2, h3").filter({ hasText: /./ })).toBeVisible();
      await expect(page).toHaveURL(route.path);
    });
  }
});
