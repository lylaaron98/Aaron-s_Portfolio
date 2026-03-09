# Architecture — Aaron's Portfolio

> Current development stage: **v0.1.0** — Initial release (single-page portfolio)

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Application Entry Points](#application-entry-points)
4. [Component Architecture](#component-architecture)
5. [Styling Architecture](#styling-architecture)
6. [Shared Hook: `useScrollReveal`](#shared-hook-usescrollreveal)
7. [Data Flow & State](#data-flow--state)
8. [Rendering & Animation Strategy](#rendering--animation-strategy)
9. [Build & Tooling](#build--tooling)
10. [Responsive Design](#responsive-design)
11. [Design Tokens](#design-tokens)
12. [Known Gotchas & Decisions](#known-gotchas--decisions)

---

## Tech Stack

| Layer | Tool | Version |
|---|---|---|
| UI Framework | React | 19 |
| Language | TypeScript | ~5.9 |
| Build Tool | Vite | 7 |
| Styling | CSS Modules | (built into Vite) |
| Linting | ESLint + typescript-eslint | 9 |
| Package Manager | npm | — |

No UI libraries, no CSS-in-JS, no router. The site is a single HTML page.

---

## Project Structure

```
Aaron-s_Portfolio/
├── index.html                  # HTML shell — mounts <div id="root">
├── vite.config.ts              # Vite config: React plugin, base: './'
├── tsconfig.json               # Root TS config (references app + node)
├── tsconfig.app.json           # App source config (strict, JSX, ES2022)
├── tsconfig.node.json          # Vite config / tooling config
├── eslint.config.js            # Flat ESLint config
├── package.json
├── public/
│   └── vite.svg                # Favicon (replace with personal logo)
└── src/
    ├── main.tsx                # React DOM entry — mounts <App>
    ├── App.tsx                 # Root component — composes all sections
    ├── index.css               # Global resets, CSS variables, keyframes
    ├── App.css                 # App-level overrides (currently minimal)
    ├── assets/                 # Static assets imported via JS
    ├── hooks/
    │   └── useScrollReveal.ts  # IntersectionObserver scroll-reveal hook
    └── components/
        ├── Navbar.tsx / .module.css
        ├── Hero.tsx   / .module.css
        ├── About.tsx  / .module.css
        ├── Skills.tsx / .module.css
        ├── Projects.tsx / .module.css
        ├── Contact.tsx  / .module.css
        └── Footer.tsx   / .module.css
```

---

## Application Entry Points

### `index.html`
The static HTML shell. Sets `lang`, `charset`, viewport meta, description meta, and page title. Contains a single `<div id="root">` mount point and a `<script type="module">` reference to `src/main.tsx`.

`base: './'` is set in `vite.config.ts` so all asset paths are relative — this is required for GitHub Pages deployment.

### `src/main.tsx`
Calls `createRoot(document.getElementById('root')!).render(...)` inside `<StrictMode>`. Imports global CSS (`index.css`) before mounting.

### `src/App.tsx`
The single top-level component. Renders the full page in document order:

```
<header>  →  Navbar
<main>    →  Hero → About → Skills → Projects → Contact
<footer>  →  Footer
```

No router is used. Smooth-scroll navigation is handled imperatively via `element.scrollIntoView({ behavior: 'smooth' })`.

---

## Component Architecture

Each section is a self-contained component pair: `ComponentName.tsx` + `ComponentName.module.css`.

### Render tree

```
App
├── Navbar          – fixed header, scroll blur, mobile hamburger
├── main
│   ├── Hero        – full-screen landing with typewriter animation
│   ├── About       – bio + avatar placeholder  [scroll-reveal]
│   ├── Skills      – 4×skill-category cards    [scroll-reveal]
│   ├── Projects    – 4×project cards           [scroll-reveal]
│   └── Contact     – info block + contact form [scroll-reveal]
└── Footer          – copyright + social links
```

### Navbar

| Concern | Implementation |
|---|---|
| Blur on scroll | `window.scroll` listener sets `scrolled` state → adds `.scrolled` class (backdrop-filter) |
| Mobile menu | `menuOpen` state toggles `.navOpen` on `<nav>` and renders an overlay `<div>` |
| Smooth scroll | `element.scrollIntoView({ behavior: 'smooth' })` called on link click; `<a href>` default prevented |
| Nav items | Defined as a static array `navLinks[]` → rendered with `index`-based `animationDelay` |

### Hero

| Concern | Implementation |
|---|---|
| Typewriter effect | Local state: `roleIndex`, `displayed`, `isDeleting`, `charIndex`. A single `useEffect` with `setTimeout` advances or retracts `charIndex` to build/erase the current role string. No external library. |
| Entry animations | CSS `@keyframes fadeInUp` defined **inside** `Hero.module.css`; each element has staggered `animation-delay` (0.1s–0.6s) and starts at `opacity: 0`. |
| CTAs | `<button>` elements call `document.getElementById(id)?.scrollIntoView(...)` |
| Social icons | Inline SVG paths (no icon library dependency) |

### About / Skills / Projects / Contact

All four sections use the `useScrollReveal` hook (see below) to animate in when scrolled into view.

**About** — Two-column grid: text block (left) + avatar placeholder card (right). The placeholder uses a layered `position: absolute` border trick for the offset-frame effect.

**Skills** — Data-driven: `skillCategories[]` array → mapped to `<div className={styles.card}>`. Each card has a `transitionDelay` proportional to its index.

**Projects** — Data-driven: `projects[]` array with `featured: boolean` flag. Featured cards get an additional badge class. Tech tags are rendered as `<span>` chips.

**Contact** — Controlled form with `form` state object (`name`, `email`, `message`). `handleSubmit` prevents default, sets `submitted: true` for 4 seconds to show a success banner, then resets. No backend/email service is wired up yet — this is a client-only stub.

### Footer

Stateless. Reads `new Date().getFullYear()` for the copyright year.

---

## Styling Architecture

### CSS Modules

Every component has a co-located `.module.css` file. Vite transforms class names to locally-scoped identifiers at build time (e.g. `.card` → `._card_1ab2c_1`), preventing any cross-component bleed.

```
Component.tsx         → import styles from './Component.module.css'
                        className={styles.card}
```

### Global styles (`src/index.css`)

Imported once in `main.tsx`. Responsibilities:

- Google Fonts `@import` (Inter + Fira Code)
- Universal `box-sizing: border-box` reset
- CSS custom properties (design tokens — see [Design Tokens](#design-tokens))
- Base element resets (`a`, `img`, `ul`, `button`)
- Custom scrollbar styling
- `::selection` colour
- Global `section` padding and `.container` utility class
- `@keyframes fadeInUp` and `@keyframes fadeIn` for reference by **global** contexts only

> ⚠️ **Important:** `@keyframes` used inside CSS Module files **must be re-declared locally** within that module. Vite hashes the `animation:` property value reference at module scope; a keyframe declared only in `index.css` will not match. See `Hero.module.css` for the pattern.

### CSS Module animation reveal pattern

Sections that animate in on scroll use a `data-attribute` pattern (not a class toggle) to avoid CSS Modules scoping issues:

```css
/* In ComponentName.module.css */
.grid {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.grid[data-visible="true"] {
  opacity: 1;
  transform: translateY(0);
}
```

```ts
// In useScrollReveal.ts — sets data-attribute, not a class
el.dataset.visible = 'true'
```

---

## Shared Hook: `useScrollReveal`

**File:** `src/hooks/useScrollReveal.ts`

```ts
export function useScrollReveal<T extends HTMLElement>(): React.RefObject<T>
```

**Behaviour:**

1. Creates a `useRef<T>(null)` and returns it to the caller.
2. In a `useEffect` (runs once on mount), attaches an `IntersectionObserver` to the ref'd element with `threshold: 0.15` (fires when 15% of the element enters the viewport).
3. On first intersection: sets `el.dataset.visible = 'true'` and calls `observer.unobserve(el)` (one-shot — once revealed, never hidden again).
4. Cleanup: `return () => observer.unobserve(el)` — safe if the component unmounts before intersection fires.

**Usage pattern:**

```tsx
const ref = useScrollReveal<HTMLDivElement>()
// ...
<div ref={ref} className={styles.grid}>
```

---

## Data Flow & State

The site has no global state manager, no context, and no server communication (yet).

| Component | State | Description |
|---|---|---|
| `Navbar` | `scrolled: boolean` | Drives backdrop-filter class on scroll |
| `Navbar` | `menuOpen: boolean` | Toggles mobile drawer |
| `Hero` | `roleIndex`, `displayed`, `isDeleting`, `charIndex` | Typewriter effect — all local, derived via `useEffect` timers |
| `Contact` | `form: {name, email, message}` | Controlled form inputs |
| `Contact` | `submitted: boolean` | Success banner visibility (auto-resets after 4s) |
| `About/Skills/Projects/Contact` | `data-visible` (DOM attribute) | Set by `useScrollReveal` hook |

All data (nav links, skill categories, projects) is defined as **static arrays** at the top of each component file. To make content editable, move these arrays to a `src/data/` directory.

---

## Rendering & Animation Strategy

### Hero — CSS keyframe animations (load-time)

Elements in the Hero section are set to `opacity: 0` by default and animate in via `@keyframes fadeInUp` declared locally in `Hero.module.css`. Each element has a staggered `animation-delay`:

| Element | Delay |
|---|---|
| Greeting (`p`) | 0.1s |
| Name (`h1`) | 0.2s |
| Typewriter (`h2`) | 0.3s |
| Description (`p`) | 0.4s |
| CTAs | 0.5s |
| Socials | 0.6s |
| Scroll indicator | 1.2s |

### Sections — IntersectionObserver + CSS transition (scroll-time)

About, Skills, Projects, and Contact sections start at `opacity: 0; transform: translateY(30px)` with a CSS `transition`. When the `useScrollReveal` hook fires, `data-visible="true"` is set on the container, triggering the `[data-visible="true"]` CSS selector which animates to `opacity: 1; transform: translateY(0)`.

Child cards within Skills and Projects have staggered `transition-delay` set via inline `style={{ transitionDelay: \`${i * 0.1}s\` }}`.

---

## Build & Tooling

```bash
npm run dev        # Vite dev server with HMR
npm run build      # tsc -b (type-check) then vite build → dist/
npm run preview    # Serve dist/ locally for production preview
npm run lint       # ESLint (flat config, typescript-eslint, react-hooks plugin)
```

### Build output (`dist/`)

```
dist/
├── index.html
└── assets/
    ├── index-[hash].css    (~17 kB, ~4 kB gzip)
    └── index-[hash].js     (~215 kB, ~67 kB gzip)
```

The `dist/` folder is excluded from git (see `.gitignore`). Deploy it to any static host (GitHub Pages, Netlify, Vercel).

---

## Responsive Design

Breakpoints are defined purely in each component's CSS Module (no shared breakpoint tokens):

| Breakpoint | Width | Notes |
|---|---|---|
| Desktop | > 900px | Two-column layouts, full nav |
| Tablet | ≤ 900px | Single-column About, Skills wraps |
| Mobile | ≤ 768px | Hamburger nav, reduced padding |
| Small mobile | ≤ 480px | Stacked CTAs, smaller padding |

The `Skills` grid uses `repeat(auto-fit, minmax(240px, 1fr))` so it reflows naturally without explicit breakpoints.

---

## Design Tokens

All tokens are CSS custom properties on `:root` in `src/index.css`:

| Token | Value | Usage |
|---|---|---|
| `--navy` | `#0a192f` | Page background |
| `--navy-light` | `#112240` | Card backgrounds, section alternation |
| `--navy-lighter` | `#1d3461` | Borders, dividers |
| `--cyan` | `#64ffda` | Primary accent, highlights, CTAs |
| `--cyan-dim` | `rgba(100,255,218,0.1)` | Hover backgrounds |
| `--white` | `#e6f1ff` | Primary text |
| `--slate` | `#8892b0` | Secondary text, body copy |
| `--slate-light` | `#a8b2d8` | Tertiary text, skill items |
| `--font-sans` | `'Inter', sans-serif` | All body/heading text |
| `--font-mono` | `'Fira Code', monospace` | Nav numbers, code-like labels |
| `--transition` | `all 0.3s cubic-bezier(...)` | Shared hover transitions |
| `--border-radius` | `4px` | All rounded corners |
| `--nav-height` | `70px` | Navbar height, used for `padding-top` offsets |

---

## Known Gotchas & Decisions

### 1. CSS Modules keyframe scoping
`@keyframes` referenced inside a `.module.css` file are locally scoped by Vite. Always declare keyframes in the same file that uses them. Do **not** rely on keyframes declared in `index.css` from within a module file.

### 2. Scroll reveal: `data-attribute` not `classList`
`IntersectionObserver` callbacks set `el.dataset.visible = 'true'` rather than `el.classList.add('visible')`. CSS Modules would scope `.visible` to `._visible_xxx`, making a global class addition invisible to the scoped selector. The `[data-visible="true"]` attribute selector is not scoped by CSS Modules.

### 3. Contact form is client-only
The form currently has no backend. `handleSubmit` prevents default and shows a temporary success message but does **not** send an email. To wire it up, integrate a service such as [EmailJS](https://www.emailjs.com/), [Formspree](https://formspree.io/), or a serverless function.

### 4. Placeholder links
All GitHub and LinkedIn URLs in `Hero.tsx`, `Projects.tsx`, `Contact.tsx`, and `Footer.tsx` point to `https://github.com` / `https://linkedin.com`. Replace with real profile URLs before publishing.

### 5. `base: './'` in vite.config.ts
This makes all built asset references relative (`./assets/...` instead of `/assets/...`). Required for GitHub Pages deployment from a subdirectory. Remove it if deploying to a domain root via Netlify/Vercel.
