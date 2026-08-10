# Aaron's Portfolio

Personal portfolio site for Aaron, built as a Vite + React + TypeScript single-page app with a hash-based demo view for project walkthroughs.

## Stack

- React 19
- TypeScript
- Vite 7
- CSS Modules
- GSAP + ScrollTrigger
- react-icons
- Web3Forms for contact delivery
- @react-three/fiber and three for the animated Silk hero background

## Current Features

- Hero section with GSAP entrance animation, rotating role text, and adaptive animated background
- About, Skills, Experience, Projects, and Contact sections rendered in a single-page portfolio flow
- Shared `SectionContainer` wrapper with animated section titles and ripple background accents
- Theme toggle persisted in `localStorage`
- Project cards with GitHub links and a top-right icon that opens the demo view
- Demo page available at `#/projects/demo`
- Contact form wired through Web3Forms when `VITE_WEB3FORMS_ACCESS_KEY` is configured
- Live email validation with `validator.js` and hCaptcha spam protection for contact submissions
- Global scroll-to-top control

## Routing Model

This project does not use `react-router-dom`.

The app uses `window.location.hash` in `src/app/App.tsx` to switch between:

- the main portfolio view
- the project demo view at `#/projects/demo`

Hash links such as `#about`, `#skills`, and `#projects` are still used for in-page scrolling on the main view.

## Project Structure

```text
src/
  app/                App shell and hash-route switching
  api/                External service adapters such as Web3Forms
  components/
    layout/           Navbar and Footer
    sections/         Hero, About, Skills, Experience, Projects, Contact
    ui/               Shared primitives such as Card, Badge, ShinyText, ScrollToTop
  constants/          Shared route constants
  context/            Theme context
  data/               Static portfolio content
  hooks/              GSAP reveal hooks and viewport helpers
  styles/             Global stylesheet
  types/              Shared TypeScript interfaces
  utils/              Helpers such as smooth scrolling and class merging
```

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Production output is written to `dist/`.

## Environment Variables

The contact form can send via Web3Forms if these are defined:

```bash
VITE_WEB3FORMS_ACCESS_KEY=
VITE_CONTACT_FROM_NAME=Aaron Lee Portfolio
```

Copy `.env.example` to `.env` and fill in your Web3Forms access key.

Web3Forms does not require you to maintain a separate email template in the dashboard for this basic setup. The app submits these fields directly:

```text
access_key
from_name
subject
name
email
replyto
message
h-captcha-response
botcheck
```

If the required Web3Forms key is missing, the form shows a clear configuration error instead of reporting a false success.

To enforce captcha on submitted forms, enable `hCaptcha` for your form inside the Web3Forms dashboard settings.

## Deployment Notes

- `vite.config.ts` uses `base: './'` so built assets stay relative for static hosting.
- No `vercel.json` is required for the current setup.
- The app can be deployed to Vercel, GitHub Pages, Netlify, or any other static host that serves `dist/`.

## Maintenance Notes

- Update project cards in `src/data/projects.ts`
- Update skills in `src/data/skills.ts`
- Update experience entries in `src/data/experience.ts`
- Update contact links inside the Hero, Contact, and Footer components if profile URLs change
