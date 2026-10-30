import { expect, type Page, test } from "@playwright/test";

const VIEWPORTS = [
  { height: 640, width: 320 },
  { height: 844, width: 390 },
  { height: 1024, width: 768 },
  { height: 900, width: 1440 },
];

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

async function scrollToBottom(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForTimeout(900);
}

for (const viewport of VIEWPORTS) {
  test(`renders cleanly at ${viewport.width}px`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.setViewportSize(viewport);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Ankit"
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);

    await scrollToBottom(page);
    await expect
      .poll(
        () =>
          page.$$eval("[data-reveal]", (items) =>
            items
              .filter((item) => getComputedStyle(item).opacity !== "1")
              .map((item) => item.textContent?.trim().slice(0, 40))
          ),
        { timeout: 5000 }
      )
      .toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("theme toggle switches, saves and survives a reload", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const before = await html.getAttribute("data-theme");
  const toggle = page.locator("[data-theme-toggle]");

  await toggle.click();
  const after = before === "dark" ? "light" : "dark";
  await expect(html).toHaveAttribute("data-theme", after);
  await expect(toggle).toHaveAttribute(
    "aria-label",
    after === "dark" ? "Switch to light theme" : "Switch to dark theme"
  );
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(after);

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", after);
});

test("?theme= forces a theme without saving it", async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    await page.goto(`/?theme=${theme}`);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
  }
});

test("live map mounts and takes taps and keys", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.locator("[data-portrait]")).toHaveAttribute(
    "data-ready",
    "true"
  );
  const map = page.locator("[data-lidar]");
  await expect(map).toHaveAttribute("data-ready", "true");
  await map.click({ position: { x: 120, y: 160 } });
  const send = page.getByRole("button", { name: "Send the robot somewhere" });
  const width = () => send.evaluate((el) => el.getBoundingClientRect().width);
  expect(await width()).toBeLessThanOrEqual(1);
  await send.focus();
  expect(await width()).toBeGreaterThan(40);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});

test("in-page links have targets and contact links are present", async ({
  page,
}) => {
  await page.goto("/");
  const missing = await page.$$eval('a[href^="#"]', (links) =>
    links
      .map((link) => link.getAttribute("href") ?? "")
      .filter((href) => !document.querySelector(href))
  );
  expect(missing).toEqual([]);
  await expect(
    page.locator('a[href="mailto:ankitt335407@gmail.com"]').first()
  ).toBeVisible();
  await expect(
    page.locator('a[href="tel:+918191893657"]').first()
  ).toBeAttached();
});

test("skip link moves focus past the navigation", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute("href", "#main");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing is hidden waiting for an animation", async ({ page }) => {
    await page.goto("/");
    const hidden = await page.$$eval(
      "[data-reveal]",
      (items) =>
        items.filter((item) => getComputedStyle(item).opacity !== "1").length
    );
    expect(hidden).toBe(0);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("content and the map fallback still show", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Work" })).toBeVisible();
    await expect(page.locator(".hero-map svg path")).toBeAttached();
    await expect(
      page.getByRole("img", {
        name: "Portrait of Ankit Singh Chouhan, drawn as dots.",
      })
    ).toBeVisible();
  });
});
