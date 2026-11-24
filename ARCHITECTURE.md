# Architecture

Last updated November 2026.

## Overview

A client-rendered Vite + React 19 + TypeScript app. Three views share one shell:

```text
ThemeProvider
  Navbar
  main
    /                 Hero, Statement, About, Skills, Experience, Projects, Contact
    /projects         DemoPage (index)
    /projects/<slug>  DemoPage (one project)
  Footer
  ScrollToTop
```

`src/app/App.tsx` picks the view from `useLocation().pathname`, sets `document.title` per route, scrolls to `location.hash` on the home view, and replaces unknown paths with `/`.

## Directory layout

```text
src/
  api/contact.ts          Web3Forms adapter
  app/App.tsx             Shell and view selection
  components/
    layout/               Navbar, Footer
    sections/             Hero, Statement, About, Skills, Experience, Projects (+ DemoPage), Contact
    ui/                   Button, Card, Badge, SectionContainer, ChromaGrid, ...
  constants/
    routes.ts             Path helpers: slugifyProject, projectDemoRoute, demoSlugFromPath, pathFromLegacyHash
    site.ts               SITE_URL, RESUME_URL
  context/ThemeContext    Theme state, mirrored on <html data-theme>
  data/                   projects, projectMedia, experience, skills, navigation
  orbit/                  three.js hero scene, intro loader + load progress, motion hooks (Lenis, budget)
  hooks/                  useGsapReveal, useMediaQuery, useTilt
  styles/                 tokens.css (primitives → semantic tokens), globals.css
  types/project.ts
  utils/                  router.ts, smoothScroll.ts, classNames.ts
e2e/smoke.spec.ts         Playwright + axe suite
```

## Routing

`src/utils/router.ts` wraps the History API:

- `useLocation()` is a `useSyncExternalStore` over `popstate`, `hashchange` and an internal `app:navigate` event.
- `navigate(href, { replace })` pushes or replaces state and fires `app:navigate`.
- `interceptLinkClicks()` turns plain clicks on same-origin `<a>` elements whose pathname differs from the current one into `navigate()` calls. Modified clicks, `target`, `download` and external links are left to the browser.

So components use ordinary `<a href="/projects/otodecks">` links and stay crawlable.

## Prerendered project pages

`vite.config.ts` has a `closeBundle` plugin that, after the client build, copies `dist/index.html` into `dist/projects/index.html` and `dist/projects/<slug>/index.html`, swapping in each project's title, description, canonical URL and Open Graph tags. It also writes `dist/sitemap.xml`. The body is still the client-rendered app; the point is per-page metadata for link previews and search. `tsconfig.node.json` includes the data and constants files the plugin imports.

## Theme

An inline script in `index.html` resolves the theme (saved choice, else `prefers-color-scheme`) and sets `<html data-theme>` before first paint. `ThemeContext` reads that attribute as its initial state and writes `localStorage` only when the user toggles, so an untouched visitor keeps following their OS.

## Styling

`tokens.css` defines raw primitives (the aurora palette, spacing, type scale) and semantic tokens (`--bg`, `--fg`, `--fg-soft`, `--fg-mute`, `--brand`, `--line`, ...) for both themes. Components use CSS Modules and only semantic tokens. Small text colours are chosen to meet WCAG AA (4.5:1) in both themes; the axe test enforces it.

## Motion

- `useGsapReveal` / `useGsapStaggerReveal` animate `transform` only. Content is never hidden with `opacity: 0`, so it stays visible to crawlers, screenshots and users if JavaScript or GSAP is slow.
- `SectionContainer` header reveals use the Web Animations API rather than GSAP.
- `prefers-reduced-motion` and a low-performance heuristic switch off the reveals, the hero shader and the ripple grid.

## Projects UI

- Cards: the title is a `<button>` inside the `<h3>` whose `::after` stretches over the card, so the whole card is clickable without nesting interactive elements. Live/repo links sit above it with `z-index`.
- The dialog (`ProjectCardModal`) animates from the card's rect, traps focus, closes on Escape, and shows the summary, highlights, stills (`getProjectStills`) and links.
- `DemoPage` renders the full media gallery (`buildProjectItems`) with a lightbox.

## Media

Screenshots are WebP under `public/assets/<project>/`. Demo videos are 720p H.264 MP4s under `public/videos/` (no Git LFS). Vercel serves `/assets/*` with immutable cache headers.

## Contact

`src/api/contact.ts` posts to Web3Forms with an hCaptcha token. Without `VITE_WEB3FORMS_ACCESS_KEY` the form reports a configuration error instead of pretending to send.

## Testing and CI

`npm run test:e2e` builds nothing itself: it starts `vite preview` on port 4173 against the existing `dist/`. CI (`.github/workflows/ci.yml`) runs `npm ci`, lint, build (which includes `tsc -b`), installs Chromium and runs the suite.
