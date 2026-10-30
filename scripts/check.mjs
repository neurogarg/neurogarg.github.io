import { readFile, access, readdir } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
const pages = ["index", "neuroscience", "ai", "others", "research", "writings"];
for (const page of pages) {
  const html = await readFile(page + ".html", "utf8");
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, page + ": one h1");
  assert.equal(
    (html.match(/aria-current="page"/g) || []).length,
    1,
    page + ": active navigation",
  );
  assert(!/\{\{\w+\}\}/.test(html), page + ": template remnants");
  assert(!/Blender|visual-work\.html/.test(html), page + ": removed gallery");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, page + ": duplicate IDs");
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = new URL(
      ref.replaceAll("&amp;", "&"),
      "https://local.test/" + page + ".html",
    );
    if (url.origin !== "https://local.test") continue;
    const file = decodeURIComponent(url.pathname.slice(1));
    await access(file);
    if (url.hash && file.endsWith(".html")) {
      const destination = await readFile(file, "utf8");
      assert(
        destination.includes(
          'id="' + decodeURIComponent(url.hash.slice(1)) + '"',
        ),
        page + ": missing anchor " + ref,
      );
    }
  }
}
for (const [, ref] of (await readFile("style.css", "utf8")).matchAll(
  /url\(["']?([^"')]+)["']?\)/g,
))
  await access(ref);
const deployed = await readdir("dist");
for (const excluded of [
  "node_modules",
  "src",
  "backups",
  "scripts",
  "tests",
  "package.json",
  "original-jekyll-source.zip",
  "visual-work.html",
  "cv.html",
])
  assert(!deployed.includes(excluded), "Unexpected deployed file: " + excluded);
assert(
  !(await readdir("dist/images")).includes("portfolio"),
  "Gallery images should not be deployed",
);
console.log(
  "All pages: navigation, IDs, local assets, cross-page anchors, CSS URLs, and deployment boundaries passed.",
);
