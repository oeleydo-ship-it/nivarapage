import { test, expect } from "@playwright/test";

test("renderer health endpoint is live", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({ status: "ok" });
});

test("unknown hosts render the not-found page instead of leaking tenant data", async ({ page }) => {
  const response = await page.goto("/", {
    waitUntil: "domcontentloaded",
  });
  expect(response).not.toBeNull();
  const body = await page.locator("body").innerText();
  expect(body.toLowerCase()).not.toContain("workspace");
  expect(body.toLowerCase()).not.toContain("sqlstate");
});
