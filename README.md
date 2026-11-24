# Aaron Lee — Portfolio

Personal portfolio for Aaron Lee, full-stack developer in Singapore. A Vite + React + TypeScript single-page app, deployed on Vercel at <https://aaron-s-portfolio.vercel.app>.

## Stack

- React 19, TypeScript (strict), Vite 7
- CSS Modules on a shared token file (`src/styles/tokens.css`), light and dark themes
- GSAP ScrollTrigger for scroll animation, Lenis for smooth scrolling
- three.js particle core behind the hero (lazy-loaded, skipped for reduced motion and low-power devices)
- react-icons
- Web3Forms + hCaptcha for the contact form
- Playwright + axe-core for end-to-end and accessibility checks

## Routes

| Path | View |
| --- | --- |
| `/` | Portfolio (Hero, About, Skills, Experience, Projects, Contact). `/#projects` etc. scroll to a section. |
| `/projects` | Index of every project demo |
| `/projects/<slug>` | One project: description, live/repo links, screenshots and recordings |

There is no router library. `src/utils/router.ts` is a ~60-line History API helper (`useLocation`, `navigate`, and a click interceptor for same-origin links). Old `#/projects/demo/<slug>` links are redirected to the new paths on load.

At build time a Vite plugin in `vite.config.ts` writes `dist/projects/<slug>/index.html` for each project with its own title, description, canonical and Open Graph tags, plus `dist/sitemap.xml`. `vercel.json` rewrites every other path to `index.html`.

## Editing content

| What | Where |
| --- | --- |
| Projects (title, summary, highlights, tech, links, `featured`) | `src/data/projects.ts` |
| Project screenshots and videos | `public/assets/<project>/`, `public/videos/`, mapped in `src/data/projectMedia.ts` |
| Experience | `src/data/experience.ts` |
| Skills | `src/data/skills.ts` |
| Hero and About copy | `src/components/sections/Hero/index.tsx`, `src/components/sections/About/index.tsx` |
| Site URL and résumé link | `src/constants/site.ts` |
| Social preview image | `public/og-image.jpg` (1200×630) |

**Résumé button.** Drop the PDF into `public/` (for example `public/aaron-lee-resume.pdf`) and set `RESUME_URL = '/aaron-lee-resume.pdf'` in `src/constants/site.ts`. The Hero shows a "Resume (PDF)" button whenever that value is non-empty.

**Employer names.** The bank, the government agency and the Japanese client are anonymised in `src/data/experience.ts` and in the Hero/About copy. Change those strings to name them.

**Images.** Use WebP. Keep videos at 720p H.264 (`ffmpeg -vf scale=-2:720 -c:v libx264 -crf 30 -preset slow -movflags +faststart`); they are served straight from `public/videos/`.

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
npx playwright install chromium   # once
npm run test:e2e                   # builds must exist: runs against `vite preview`
```

The Playwright suite (`e2e/smoke.spec.ts`) runs on a desktop and a mobile viewport. It checks that every section renders without broken local requests, that every project page and its media load, that the project dialog opens and closes, that legacy hash links redirect, that the first visit follows the OS colour scheme, and that axe finds no serious or critical WCAG 2 AA violations in either theme.

If you already have a Chromium build installed, set `PW_CHROMIUM_PATH=/path/to/chromium` to use it instead.

GitHub Actions (`.github/workflows/ci.yml`) runs lint, build and the Playwright suite on every pull request and on pushes to `main`.

## Environment variables

Copy `.env.example` to `.env`:

```bash
VITE_WEB3FORMS_ACCESS_KEY=
VITE_CONTACT_FROM_NAME=Aaron Lee Portfolio
```

Without the key the form shows a configuration error rather than a false success. Turn on hCaptcha for the form in the Web3Forms dashboard to enforce it server-side.

## Deployment

Vercel builds every push through its GitHub integration: pull requests get a preview URL and `main` goes to production. Build command `npm run build`, output `dist/`. `vercel.json` holds the SPA rewrite and long-lived cache headers for `/assets/*`.
