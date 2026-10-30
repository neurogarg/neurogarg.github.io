import { rm } from "node:fs/promises";
import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { format } from "prettier";
import { Cite } from "@citation-js/core";
import "@citation-js/plugin-bibtex";

const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
const pages = [
  [
    "index",
    "Home",
    "Pranjal Garg studies learning, neural dynamics, and computation in biological and artificial systems.",
  ],
  [
    "neuroscience",
    "Neuroscience",
    "Projects on intelligence in physical systems, neural circuits, and adaptive learners.",
  ],
  [
    "ai",
    "AI",
    "Research on interpretable, safe, and reliable artificial intelligence.",
  ],
  [
    "others",
    "Others",
    "Earlier projects, scientific perspectives, medical education, and past work.",
  ],
  [
    "research",
    "Research",
    "Research in ML interpretability, neuroscience, and dynamical systems, including research internships.",
  ],
  [
    "writings",
    "Writings",
    "Papers, preprints, and workshop contributions by Pranjal Garg, organized by topic.",
  ],
];
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function safeURL(value) {
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol))
    throw new Error("Publication URL must use HTTP(S): " + value);
  return escapeHTML(url.href);
}
const bib = await readFile("data/publications.bib", "utf8");
const citations = new Cite(bib).data;
const seen = new Set();
const items = citations
  .map((entry) => {
    if (!entry.id || seen.has(entry.id))
      throw new Error("Missing or duplicate citation key: " + entry.id);
    seen.add(entry.id);
    if (!entry.title) throw new Error("Missing publication title: " + entry.id);
    const topics = [
      ...new Set(
        String(entry.keyword || "")
          .split(/[,;]/)
          .map((s) => s.trim())
          .map((s) =>
            s.toLowerCase() === "neuroscience" ? "Neuroscience" : s,
          )
          .filter(Boolean),
      ),
    ];
    const year = entry.issued?.["date-parts"]?.[0]?.[0];
    const sample = entry.id.startsWith("example-");
    return { entry, topics: topics.length ? topics : ["Other"], year, sample };
  })
  .sort(
    (a, b) =>
      Number(a.sample) - Number(b.sample) ||
      (b.year || 0) - (a.year || 0) ||
      a.entry.title.localeCompare(b.entry.title),
  );
// The telerehabilitation piece is presented as a perspective on the Others page.
const publicationItems = items.filter(
  ({ entry }) => entry.id !== "garg2021telerehabilitation",
);
const topics = [
  ...new Set(publicationItems.flatMap((item) => item.topics)),
].sort();
function publication({ entry, topics, year, sample }) {
  const contributors = (
    entry.author?.length ? entry.author : entry.editor || []
  )
    .map((a) => a.literal || [a.given, a.family].filter(Boolean).join(" "))
    .join(", ");
  const contributorLabel = entry.author?.length
    ? ""
    : entry.editor?.length
      ? "Edited by "
      : "";
  const venue = entry["container-title"] || entry.publisher || "";
  const url = entry.DOI ? "https://doi.org/" + entry.DOI : entry.URL;
  const bibtex = new Cite([entry]).format("bibtex");
  return (
    '<article class="publication" id="' +
    escapeHTML(entry.id) +
    '" data-topics="' +
    escapeHTML(JSON.stringify(topics)) +
    '">' +
    '<div class="entry-heading"><h3>' +
    escapeHTML(entry.title) +
    '</h3><span class="entry-date">' +
    escapeHTML(year || "Undated") +
    "</span></div>" +
    (contributors
      ? '<p class="publication-authors">' +
        escapeHTML(contributorLabel + contributors) +
        "</p>"
      : "") +
    (venue ? '<p class="work-meta">' + escapeHTML(venue) + "</p>" : "") +
    (entry.note
      ? '<p class="publication-note">' + escapeHTML(entry.note) + "</p>"
      : "") +
    (sample
      ? '<p class="sample-note">Sample entry — replace with your publication.</p>'
      : "") +
    '<ul class="topic-tags" aria-label="Topics">' +
    topics.map((t) => "<li>" + escapeHTML(t) + "</li>").join("") +
    "</ul>" +
    (url
      ? '<a href="' +
        safeURL(url) +
        '">Read writing <span aria-hidden="true">↗</span></a>'
      : "") +
    "<details><summary>BibTeX</summary><pre><code>" +
    escapeHTML(bibtex) +
    "</code></pre></details></article>"
  );
}
const publications =
  '<div class="publication-filters" hidden><label for="topic-filter">Filter by topic</label><select id="topic-filter"><option value="">All topics</option>' +
  topics
    .map(
      (t) =>
        '<option value="' + escapeHTML(t) + '">' + escapeHTML(t) + "</option>",
    )
    .join("") +
  '</select><p id="publication-count" role="status" aria-live="polite"></p></div>' +
  (publicationItems.some((i) => i.sample)
    ? '<p class="sample-banner">Entries marked “Sample” demonstrate the topic categories and are not actual publications.</p>'
    : "") +
  '<section aria-labelledby="publication-list-title"><h2 id="publication-list-title" class="sr-only">Writing list</h2>' +
  publicationItems.map(publication).join("\n") +
  '</section><p id="no-publications" hidden>No writings match this topic.</p>';
const layout = await readFile("src/layout.html", "utf8");
const navPages = pages.filter(([slug]) =>
  ["index", "neuroscience", "ai", "others", "writings"].includes(
    slug,
  ),
);
await rm("cv.html", { force: true });
await rm("ai-safety.html", { force: true });
for (const [slug, label, description] of pages) {
  const navigation =
    navPages
      .map(
        ([s, l]) =>
          '<a href="' +
          s +
          '.html"' +
          (s === slug || (slug === "research" && s === "others")
            ? ' aria-current="page"'
            : "") +
          ">" +
          l +
          "</a>",
      )
      .join("\n") +
    '\n<details class="cv-menu"><summary>CV</summary><div class="cv-menu-links">' +
    '<a href="data/Pranjal_Garg_Neuro.pdf">Neuroscience CV</a>' +
    '<a href="data/Pranjal_Garg_AI_Safety.pdf">AI Safety CV</a></div></details>';
  const source = await readFile("src/pages/" + slug + ".html", "utf8");
  const content = source
    .replace("{{publications}}", publications)
    .replace(/\{\{yearFromBib:([\w-]+)\}\}/g, (_, key) => {
      const item = items.find(({ entry }) => entry.id === key);
      if (item) {
        return escapeHTML(item.year || "Undated");
      }
      throw new Error("Missing BibTeX entry for " + key);
    })
    .replace(/\{\{([\w-]+)\}\}/g, (token, key) => {
      const item = items.find(({ entry }) => entry.id === key);
      return item ? escapeHTML(new Cite([item.entry]).format("bibtex")) : token;
    });
  const values = {
    title: escapeHTML(
      label === "Home"
        ? "Pranjal Garg — Neuroscience & machine learning"
        : label === "Research"
          ? "Research and papers | Pranjal Garg"
          : label + " — Pranjal Garg",
    ),
    description: escapeHTML(description),
    navigation,
    content,
    scripts:
      slug === "writings"
        ? '<script src="assets/publications.js" defer></script>'
        : "",
  };
  const result = layout
    .replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (!(key in values)) throw new Error("Unknown template token: " + key);
      return values[key];
    })
    .replace(
      "</head>",
      (await readFile("src/metadata/" + slug + ".html", "utf8")) + "</head>",
    );
  const unrendered = result.match(/\{\{[\w-]+\}\}/);
  if (unrendered)
    throw new Error(
      "Unrendered template token " + unrendered[0] + " in " + slug,
    );
  await writeFile(
    slug + ".html",
    await format(result, { parser: "html" }),
    "utf8",
  );
}
const legacyPublicationsRedirect = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0; url=writings.html" />
    <link rel="canonical" href="https://neurogarg.github.io/writings.html" />
    <title>Writings — Pranjal Garg</title>
  </head>
  <body>
    <p>This page has moved to <a href="writings.html">Writings</a>.</p>
  </body>
</html>`;
await writeFile(
  "publications.html",
  await format(legacyPublicationsRedirect, { parser: "html" }),
  "utf8",
);
// Publish only this directory: source files, tools, and backups are never copied.
const output = path.resolve(root, "dist");
if (
  path.dirname(output) !== path.resolve(root) ||
  path.basename(output) !== "dist"
)
  throw new Error("Invalid build output directory");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const [slug] of pages)
  await cp(slug + ".html", path.join("dist", slug + ".html"));
await cp("publications.html", path.join("dist", "publications.html"));
for (const name of [
  "style.css",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "assets",
  "images",
  ".nojekyll",
])
  await cp(name, path.join("dist", name), { recursive: true });
await mkdir("dist/data", { recursive: true });
for (const name of [
  "publications.bib",
  "Pranjal_Garg_Neuro.pdf",
  "Pranjal_Garg_AI_Safety.pdf",
])
  await cp(path.join("data", name), path.join("dist/data", name));
console.log(
  "Built " +
    pages.length +
    " static pages and " +
    publicationItems.length +
    " publications (" +
    topics.length +
    " topics). Publish dist/.",
);
