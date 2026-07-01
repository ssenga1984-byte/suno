import { expect, test } from "@playwright/test";

const routes = [
  "#/",
  "#/events",
  "#/events?region=kanto-koshinetsu",
  "#/events?stay=day",
  "#/consult",
  "#/consult?type=student",
  "#/voices",
  "#/contact",
  "#/about/staff",
  "#/course",
  "#/faq",
];

test.describe("high risk route smoke checks", () => {
  for (const route of routes) {
    test(`${route} renders without horizontal overflow`, async ({ page }) => {
      await page.goto(`/${route}`);
      await expect(page.locator("main")).toBeVisible();
      await expect(page).toHaveTitle(/JUON/);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} should not horizontally overflow`).toBeLessThanOrEqual(1);
    });
  }
});

test("invalid consult type is normalized without rendering a broken state", async ({ page }) => {
  await page.goto("/#/consult?type=foo");
  await page.waitForFunction(() => window.location.hash === "#/consult");
  await expect(page.locator("main")).toBeVisible();
  await expect(page).toHaveTitle(/JUON/);
});

test("blank target links include a safe rel attribute", async ({ page }) => {
  await page.goto("/#/events");
  const unsafeLinks = await page.locator('a[target="_blank"]').evaluateAll((links) =>
    links
      .map((link) => ({
        href: link.getAttribute("href") ?? "",
        rel: link.getAttribute("rel") ?? "",
        text: link.textContent?.trim() ?? "",
      }))
      .filter((link) => {
        const relTokens = new Set(link.rel.split(/\s+/).filter(Boolean));
        return !relTokens.has("noreferrer") && !relTokens.has("noopener");
      }),
  );

  expect(unsafeLinks, "target=_blank links need rel=noreferrer or rel=noopener").toEqual([]);
});

test("contact and consult do not expose local personal information forms", async ({ page }) => {
  for (const route of ["#/contact", "#/consult"]) {
    await page.goto(`/${route}`);
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.locator("input, textarea, select")).toHaveCount(0);
  }
});

test("voices page keeps PDFs out of the visitor flow", async ({ page }) => {
  await page.goto("/#/voices");
  const pdfLinks = await page.locator('a[href$=".pdf"], a[download]').evaluateAll((links) =>
    links.map((link) => link.getAttribute("href") ?? link.textContent?.trim() ?? ""),
  );

  expect(pdfLinks, "voices page should link to official publication page, not local PDFs").toEqual([]);
});
