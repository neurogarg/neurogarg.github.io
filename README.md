# Pranjal Garg website

Six static pages, shared styling, and publications generated from BibTeX. The existing charcoal design and neural artwork are preserved. No Jekyll or browser framework.

## Quick start

Use Node.js 22 or newer:

```powershell
npm.cmd ci
npm.cmd start
```

Open http://127.0.0.1:8000. Stop with Ctrl+C. After editing source files, run `npm.cmd run build` and refresh. The preview does not rebuild automatically.

The generated root HTML files also work with your existing static server or by opening `index.html` directly.

## What to edit

| Content                                | Source                        |
| -------------------------------------- | ----------------------------- |
| Bio, current position, interests, news | `src/pages/index.html`        |
| Research and internships               | `src/pages/research.html`     |
| Writings page introduction             | `src/pages/writings.html`     |
| Publication records and topics         | `data/publications.bib`       |
| Neuroscience CV PDF                    | `data/Pranjal_Garg_Neuro.pdf` |
| AI Safety CV PDF                       | `data/Pranjal_Garg_AI_Safety.pdf` |
| AI projects and blog posts             | `src/pages/ai.html`           |
| Other interests and past work          | `src/pages/others.html`    |
| Shared page layout                     | `src/layout.html`             |
| Styles                                 | `style.css`                   |
| Artwork and publication interactions   | `assets/*.js`                 |

Edit source pages, then build. Root HTML files are generated; direct changes there will be overwritten.

The CV menu in the navigation and the two homepage CV links open the PDFs directly. Replace either PDF in `data/` and rebuild to update the published copy.

## Writings

Replace the sample entries in `data/publications.bib` with exported BibTeX. Each citation needs a unique key and a title. Use standard author, year, journal/booktitle, DOI, and URL fields as available.

```bibtex
@misc{example-your-paper,
  title = {Sample publication title},
  author = {Example, Author},
  year = {2026},
  keywords = {ML interpretability, Neuroscience}
}
```

Comma-separated `keywords` become topic tags and filter options automatically. New categories require no code changes. Entries without keywords appear under Other. Entries without a year appear as Undated. Citation keys starting with `example-` are visibly marked as samples. Replace the key as well as the content when adding a real record.

The build parses BibTeX with [Citation.js](https://citation.js.org/). Titles and names are escaped before HTML output. HTTP(S) publication links only are allowed. JavaScript enhances filtering; the complete list is available without it.

## Check and publish

```powershell
npm.cmd run check
npm.cmd test
```

Checks cover HTML validity, local links, assets, topic filters, no-JavaScript content, keyboard access, mobile overflow, print, and automated accessibility. Browser tests use installed Microsoft Edge; change `channel` in `playwright.config.mjs` if needed.

Run the following from the website folder:

```powershell
Set-Location -LiteralPath 'C:\Users\pranjal\Desktop\pranjal garg website'
npm.cmd run check
```

The `check` command builds the website and validates it. For a build without validation, use `npm.cmd run build`. Publish the contents of `dist/`. It includes only the static website, both CV PDFs, images, fonts, and bibliography. Keep `.nojekyll` when using GitHub Pages. Do not publish the project directory, dependencies, or backups.

The development server binds to localhost and is intended for preview. Use a static host for production.

## Content still to replace

- The bibliography contains clearly labeled sample entries at your request.
- Confirm the NERF internship status; the supplied CV described it as incoming.
- The Neuroscience CV’s Project Encephalon status may differ from the requested past-work label on the website.
- The existing profile and project images are placeholders, retained to preserve the design.

