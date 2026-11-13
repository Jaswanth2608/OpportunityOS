# OpportunityOS

A Student Career & Opportunity Management platform, built with **HTML5, CSS3 and
vanilla JavaScript only** — no frameworks, no CSS libraries, no build step.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Dashboard |
| `explore.html` | Explore Opportunities |
| `applications.html` | My Applications |
| `bookmarks.html` | Bookmarks |
| `analytics.html` | Analytics |

## Running the project

Open `index.html` in any modern browser (Chrome, Edge, Firefox). There is
nothing to install and no server required — the site is plain HTML, CSS and
classic JavaScript, so it also works from a local file.

## Current status

**Milestone 1 complete:** design tokens, CSS reset and base typography.
Layout, components and page logic follow in later milestones.

## Design system

The visual system comes from the approved Stitch wireframes (grayscale
layout, spacing, typography and components) with the final brand palette
applied through CSS custom properties.

| Token | Value | Use |
| --- | --- | --- |
| `--color-canvas` | `#F2F0EA` | Moonlit Grey page background |
| `--color-tint` | `#ADD4E0` | Ethereal Blue highlight surfaces |
| `--color-accent` | `#A47864` | Mocha Mousse fills, borders, icons, charts |
| `--color-accent-strong` | `#7A5644` | Primary button fills and small accent text |

All colour values live in one place: the colour-token section of
`CSS/style.css`. Nothing else in the project declares a colour.

## Project structure

```
index.html            Dashboard
explore.html          Explore Opportunities
applications.html     My Applications
bookmarks.html        Bookmarks
analytics.html        Analytics
CSS/style.css         All styles: tokens, reset, typography, layout, components
js/data.js            Sample opportunity data
js/app.js             Shared helpers and page behaviour
```

## Data

All opportunity data is **sample data** stored in `js/data.js`. Saved items and
applications are kept in the browser's `localStorage`. There is no backend, no
database and no account system, and nothing is fetched from a live service.
