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

**Milestone 2 complete:** shared application shell on all five pages — a 240px
fixed sidebar at 1024px and above, and an accessible off-canvas navigation
drawer with a compact header below that.

**Milestone 3 complete:** reusable UI component styles in `CSS/style.css` —
buttons, badges, filter chips, form controls, cards and panels, tables, empty
states, placeholder boxes and the modal. Page content and data follow in later
milestones.

## Navigation

All five pages share one shell. Above 1024px the sidebar is always visible.
Below 1024px the menu button in the header opens the drawer, which can be
closed with its close button, the dimmed backdrop, the Escape key, or by
resizing the window to desktop width. While open, keyboard focus stays inside
the drawer and the current page is marked with `aria-current="page"`.

## Component guide

Every component is a plain HTML class in `CSS/style.css` (section 10). No
component requires JavaScript yet, and none of them declares a colour of its
own — they all read the tokens.

| Component | Class | Example |
| --- | --- | --- |
| Button, primary | `.btn.btn--primary` | `<button class="btn btn--primary" type="button">Save</button>` |
| Button, secondary | `.btn.btn--secondary` | `<button class="btn btn--secondary" type="button">Cancel</button>` |
| Button, tertiary | `.btn.btn--tertiary` | `<button class="btn btn--tertiary" type="button">Clear</button>` |
| Button, disabled | `disabled` attribute | `<button class="btn btn--primary" type="button" disabled>Save</button>` |
| Button, destructive | `.btn.btn--danger` | `<button class="btn btn--danger" type="button">Remove</button>` |
| Button row | `.btn-group` | `<div class="btn-group">…</div>` |
| Status badge | `.badge` + `.badge--neutral` / `--info` / `--accent` / `--strong` | `<span class="badge badge--info">Closing soon</span>` |
| Filter chips | `.chip-group` + `.chip` | `<button class="chip" type="button" aria-pressed="true">Internships</button>` |
| Text input | `.field` + `.field__label` + `.input` | `<input class="input" id="search" type="search" />` |
| Select | `.select` | `<select class="select" id="type">…</select>` |
| Checkbox / radio | `.choice` + `.choice__input` + `.choice__label` | `<label class="choice"><input class="choice__input" type="checkbox" /> <span class="choice__label">Remote</span></label>` |
| Field layout | `.form-grid` | one column on phones, two from 768px |
| Card | `.card` + `__header` / `__title` / `__meta` / `__body` / `__footer` | `<article class="card">…</article>` |
| Panel | `.panel` / `.panel--tint` | `<div class="panel">…</div>` |
| Table | `.table-wrap` + `.table` (+ `.table--compact`, `.table__num`) | `<div class="table-wrap"><table class="table">…</table></div>` |
| Empty state | `.empty` + `__title` / `__text` | `<div class="empty">…</div>` |
| Placeholder (X) | `.placeholder.placeholder--x` | `<div class="placeholder placeholder--x"></div>` |
| Placeholder (hatch) | `.placeholder.placeholder--hatch` | `<div class="placeholder placeholder--hatch"></div>` |
| Modal | `.modal` + `__backdrop` / `__dialog` / `__header` / `__title` / `__close` / `__text` / `__footer` | see the commented example in section 10.9 |

### Notes on the components

* **Chips use `aria-pressed`, not a class.** The selected state lives in the
  HTML, so screen readers announce it and JavaScript only flips the attribute.
* **The modal is styled only.** Its `hidden` attribute controls visibility;
  open/close behaviour and focus handling arrive with the page scripts.
* **Checkbox and radio keep the native control** with `accent-color`, so the
  tick and dot are always drawn correctly by the browser while taking the
  brand colour and the 16×16 size from the design system.
* **Disabled buttons and inputs are still readable** (about 4.9:1) but use the
  muted ink and the alternating surface, plus `cursor: not-allowed`.
* **Tables scroll inside `.table-wrap`,** so a wide table never creates a
  horizontal scrollbar on the page itself.

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
