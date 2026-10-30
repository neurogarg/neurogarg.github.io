import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { Cite } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
const records = new Cite(readFileSync("data/publications.bib", "utf8")).data.filter(
  (record) => record.id !== "garg2021telerehabilitation",
);
const recordTopics = records.map((record) =>
  String(record.keyword || "Other")
    .split(/[,;]/)
    .map((topic) => topic.trim())
    .filter(Boolean),
);
const topic = recordTopics[0]?.[0] || "Other";
const countForTopic = recordTopics.filter((topics) =>
  topics.includes(topic),
).length;
const routes = ["index", "neuroscience", "ai", "others", "writings"];
for (const route of routes) {
  test(
    route + ": responsive, accessible, and no failed assets",
    async ({ page }) => {
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("response", (response) => {
        if (response.status() >= 400) errors.push(response.url());
      });
      await page.goto("/" + route + ".html");
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("nav > a")).toHaveCount(5);
      await expect(page.locator("nav .cv-menu summary")).toHaveText("CV");
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("link", { name: "Skip to content" }),
      ).toBeFocused();
      for (const width of [1440, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      expect(errors).toEqual([]);
    },
  );
}
test("publication filters, deep links, empty state, and citations", async ({
  page,
}) => {
  await page.goto("/writings.html?topic=" + encodeURIComponent(topic));
  await expect(page.locator(".publication:visible")).toHaveCount(countForTopic);
  await expect(page.locator("#topic-filter")).toHaveValue(topic);
  await page.locator("#topic-filter").selectOption(topic);
  await expect(page.locator(".publication:visible")).toHaveCount(countForTopic);
  await page.locator(".publication:visible summary").first().click();
  await expect(page.locator(".publication:visible pre").first()).toContainText(
    "@",
  );
  await page.locator("#topic-filter").selectOption("");
  await expect(page.locator(".publication:visible")).toHaveCount(
    records.length,
  );
  await page.goto("/writings.html?topic=__missing_test_topic__");
  await expect(page.locator("#no-publications")).toBeVisible();
  await expect(page.locator(".publication:visible")).toHaveCount(0);
});
test("static content works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:8123/writings.html");
  await expect(page.locator(".publication")).toHaveCount(records.length);
  await expect(page.locator(".publication-filters")).toBeHidden();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Others", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText("Others");
  await context.close();
});
test("navigation, reduced motion, print, and deployment privacy", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Neuroscience", exact: true })
    .click();
  await expect(page).toHaveURL(/neuroscience.html$/);
  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("button", { name: "Neural network", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Neural network", exact: true }),
  ).toHaveAttribute("aria-current", "step");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".neural-backdrop")).toBeHidden();
  for (const route of [
    "/package.json",
    "/backups/before-restructure.zip",
    "/src/layout.html",
    "/visual-work.html",
  ])
    expect((await request.get(route)).status()).toBe(404);
  expect((await request.get("/data/Pranjal_Garg_Neuro.pdf")).status()).toBe(200);
  expect((await request.get("/data/Pranjal_Garg_AI_Safety.pdf")).status()).toBe(200);
  expect((await request.get("/garg_cv_neuro.pdf")).status()).toBe(404);
  expect((await request.get("/pranjal_ai_research_cv_chronological.pdf")).status()).toBe(404);
  expect((await request.get("/cv.html")).status()).toBe(404);
  const researchRedirect = await (await request.get("/research.html")).text();
  expect(researchRedirect).toContain('content="0; url=index.html"');
  expect(researchRedirect).toContain('rel="canonical" href="https://neurogarg.github.io/"');
});

test("CV dropdown and homepage link to both PDFs", async ({ page }) => {
  await page.goto("/index.html");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  await navigation.getByText("CV", { exact: true }).click();
  await expect(navigation.getByRole("link", { name: "Neuroscience CV" })).toHaveAttribute(
    "href",
    "data/Pranjal_Garg_Neuro.pdf",
  );
  await expect(navigation.getByRole("link", { name: "AI Safety CV" })).toHaveAttribute(
    "href",
    "data/Pranjal_Garg_AI_Safety.pdf",
  );
  await expect(page.locator(".intro-links a[href='data/Pranjal_Garg_Neuro.pdf']")).toBeVisible();
  await expect(page.locator(".intro-links a[href='data/Pranjal_Garg_AI_Safety.pdf']")).toBeVisible();
});

test("homepage project buttons lead to relevant work", async ({ page }) => {
  await page.goto("/index.html");
  await page
    .getByRole("link", { name: "Brief overview of my work in neuroscience." })
    .click();
  await expect(page).toHaveURL(/neuroscience.html$/);
  await expect(page.locator("#active-vision .project-tldr")).toBeVisible();
  await page.goto("/index.html");
  await page
    .getByRole("link", { name: "Brief overview of my projects in AI." })
    .click();
  await expect(page).toHaveURL(/ai.html$/);
  await expect(page.locator("#spontaneous-context-restoration .project-tldr")).toBeVisible();
});
