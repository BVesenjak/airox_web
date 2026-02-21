# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WARCHARGE / AIROX is a static landing page and product page for a nutrition/lifestyle brand with Shopify e-commerce integration. Pure HTML/CSS/JS — no build tools, no package manager, no framework compilation.

## Development

**Local development:** Open `index.html` or `product.html` directly in a browser. No server required.

**Deployment:** Static file hosting (GitHub Pages, Netlify, Vercel, or FTP). Push to `main` branch for GitHub Pages.

There are no build steps, linters, test frameworks, or CI/CD pipelines.

## Architecture

### Pages and their file sets

| Page | HTML | CSS | JS |
|------|------|-----|----|
| Landing page | `index.html` | `styles.css` | `script.js` |
| Product page | `product.html` | `styles_product.css` | `script_product.js` |

Both pages also load:
- `progressive-lockin.js` — color selection state machine for LOLO fan bundles
- `ssa.js` — Shopify Storefront API integration (cart, checkout)

### Shopify Integration (`ssa.js`)

Uses Shopify Buy Button SDK with Storefront API. Cart state persists via `localStorage` (`shopify_checkout_id`). Variant IDs for bundles (single/duo/family) are hardcoded in `BUNDLE_VARIANTS`. The cart drawer is custom HTML, not Shopify's default iframe.

### Progressive Lock-In System (`progressive-lockin.js`)

IIFE-wrapped state machine for selecting fan colors across bundle types (single=1, duo=2, family=4 fans). States: SELECTING → COMPLETE. Manages fan chip UI, default color preselection, and builds a session order string (e.g., "1s,2s,3a,4i") for Shopify custom attributes.

### Bilingual Support (EN/DE)

Translations live as `data-en` and `data-de` attributes directly on HTML elements. `script.js` handles language detection (auto-detects DACH region) and toggling. No i18n library — the toggle function iterates elements with `[data-en]` and swaps `textContent`.

### Navigation Behavior

The navbar has conditional visibility logic: visible at hero, hides on scroll through middle sections, reappears from section 7 onward. This is intentional UX, not a bug.

### Design Tokens

- **Primary:** Black `#000000`, grays `#1a1a1a`–`#3a3a3a`
- **Accent:** Cyan `#15ccbe` (current), Red `#e50914` (legacy, still in some CSS vars)
- **CTA pattern:** White background, black text, cyan hover

## Key Conventions

- External dependencies loaded via CDN only (Bootstrap 5.3.0, Font Awesome 6.4.0, Shopify Buy SDK)
- All assets live in `assets/` with subdirectories for `logo/`, `icons/`, `buy-block-thumbnails/`, `tutorial/`
- Image specs documented in `assets/IMAGES.md`
- `placeholder-generator.html` is a dev tool for generating placeholder images, not part of the live site
