import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.describe("employee dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "employee");
  });

  const employeeRoutes: { path: string; name: string }[] = [
    { path: "/employee", name: "dashboard" },
    { path: "/employee/tasks", name: "tasks" },
    { path: "/employee/projects", name: "projects" },
    { path: "/employee/notifications", name: "notifications" },
    { path: "/employee/settings", name: "settings" },
    { path: "/employee/profile", name: "profile" },
    { path: "/employee/submit", name: "task submission" },
  ];

  for (const route of employeeRoutes) {
    test(`employee ${route.name} page loads`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.locator("h1, h2, h3").filter({ hasText: /./ })).toBeVisible();
      await expect(page).toHaveURL(route.path);
    });
  }
});
