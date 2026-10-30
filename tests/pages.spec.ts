import { expect, test } from "@playwright/test";

test("unknown URLs get the 404 page", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Not found");
  await expect(
    page.getByRole("link", { name: "Back to home" })
  ).toHaveAttribute("href", "/");
});

test("robots.txt allows crawling", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain("User-agent: *");
});

test("web manifest is served", async ({ request }) => {
  const response = await request.get("/site.webmanifest");
  expect(response.ok()).toBe(true);
  expect((await response.json()).name).toBe("Ankit Singh Chouhan");
});
