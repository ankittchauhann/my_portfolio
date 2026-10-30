import { expect, type Page, test } from "@playwright/test";

const CASE_STUDIES = ["/work/fleet-app", "/work/robot-app"];
const NEXT_LINK = /Next case study/u;
const FLEET_URL = /\/work\/fleet-app$/u;
const WEBGL_NOTE = /WebGL/u;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  return errors;
}

for (const path of CASE_STUDIES) {
  for (const width of [390, 1440]) {
    test(`${path} renders cleanly at ${width}px`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.setViewportSize({ height: 900, width });
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
      await expect(page.getByRole("link", { name: NEXT_LINK })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
}

test("home panels link to their case studies", async ({ page }) => {
  await page.goto("/");
  const links = page.getByRole("link", { name: "Read the case study" });
  await expect(links).toHaveCount(2);
  await links.first().click();
  await expect(page).toHaveURL(FLEET_URL);
});

test("3D demo mounts and switches camera modes", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/work/robot-app");
  const demo = page.locator("[data-point-cloud]");
  await demo.scrollIntoViewIfNeeded();
  await expect(
    demo.locator("canvas").or(demo.getByText(WEBGL_NOTE))
  ).toBeVisible({ timeout: 15_000 });

  const top = demo.getByRole("button", { name: "Top" });
  await top.click();
  await expect(top).toHaveAttribute("aria-pressed", "true");
  await expect(demo.getByRole("button", { name: "Follow" })).toHaveAttribute(
    "aria-pressed",
    "false"
  );
  await demo.getByRole("button", { name: "Free" }).click();
  await page.waitForTimeout(500);
  expect(errors.filter((error) => !error.includes("WebGL"))).toEqual([]);
});
