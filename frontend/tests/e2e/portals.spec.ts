import { test, expect } from "@playwright/test";
import { loginAs, DEMO_USERS } from "./helpers/auth";

/**
 * Authenticated portal smoke tests for all role-based dashboards.
 *
 * These hit the live backend (default http://localhost:8000/api/v1) and
 * require demo accounts seeded via the backend seed scripts. Keep the number
 * of auth logins low per run - the backend rate-limits login at 5/min.
 */
test.describe("role portals", () => {
  for (const role of Object.keys(DEMO_USERS) as (keyof typeof DEMO_USERS)[]) {
    test(`${role} portal loads after login`, async ({ page }) => {
      await loginAs(page, role);
      const expectedPath = DEMO_USERS[role].path;
      await expect(page).toHaveURL(new RegExp(`^.*${expectedPath.replace(/\//g, "\\/")}`));
      await expect(page.locator("h1, h2, h3").first()).toBeVisible();
    });
  }
});