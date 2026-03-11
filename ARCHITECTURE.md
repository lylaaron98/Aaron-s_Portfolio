# Architecture - Aaron's Portfolio

This document describes the current application structure as of March 12, 2026.

## Overview

The portfolio is a client-rendered Vite application built with React and TypeScript. It has two UI states:

- the main single-page portfolio
- a project demo view selected through the hash route `#/projects/demo`

There is no router library in the current implementation. Route selection is handled directly in `src/app/App.tsx` by reading `window.location.hash`.

## Runtime Composition

Main view:

```text
ThemeProvider
  CursorOverlay
  Navbar
  main
    Hero
    About
    Skills
    Experience
    Projects
    Contact
  Footer
  ScrollToTop
```

Demo view:

```text
ThemeProvider
  CursorOverlay
  Navbar
  main
    DemoPage
  ScrollToTop
```

## Directory Layout

```text
src/
  api/
    contact.ts              EmailJS adapter
  app/
    App.tsx                 Root composition and hash-route switching
  components/
    layout/
      Navbar/
      Footer/
    sections/
      Hero/
      About/
      Skills/
      Experience/
      Projects/
        DemoPage.tsx
        Galaxy.tsx
        ProjectSections.tsx
    ui/
      Badge/
      Button/
      Card/
      ScrollToTop/
      SectionContainer/
      ShinyText/
      CursorOverlay.tsx
  constants/
    routes.ts               Shared hash-route constants
  context/
    ThemeContext.tsx
  data/
    navigation.ts
    skills.ts
    experience.ts
    projects.ts
  hooks/
    useGsapReveal.ts
    useMediaQuery.ts
    useMousePosition.ts
    useScrollProgress.ts
  styles/
    globals.css
  utils/
    classNames.ts
    smoothScroll.ts
```

## State and Data Flow

Most content is static and data-driven.

- `src/data/projects.ts` drives the Projects grid and DemoPage content
- `src/data/skills.ts` drives the Skills categories
- `src/data/experience.ts` drives the Experience timeline

Local state is used for interactive behavior:

- `App.tsx`: tracks the current hash and whether the demo route is active
- `ThemeContext.tsx`: stores dark/light theme and persists it to `localStorage`
- `Hero/index.tsx`: manages the rotating role text
- `Contact/index.tsx`: manages form inputs, success state, and submit errors
- `Navbar/index.tsx`: tracks scroll direction and condensed header styling

## Navigation Model

Navigation is split across two patterns:

- In-page navigation uses anchor hashes such as `#hero`, `#about`, and `#projects`
- Cross-view navigation uses the hash route constant in `src/constants/routes.ts`

`App.tsx` handles both concerns:

- if the hash starts with `#/`, the app treats it as a view switch
- otherwise it uses `smoothScrollTo()` to scroll to the matching section in the main view

This keeps deployment simple on static hosts and avoids server rewrite requirements.

## Styling System

The styling model is split into:

- `src/styles/globals.css` for tokens, reset rules, and global utilities
- co-located CSS Modules for component-specific styling

Shared visual primitives:

- `Card` provides optional hover lift, gradient overlay, and pointer-based tilt
- `Badge` is used for tech chips and labels
- `ShinyText` handles animated gradient text
- `SectionContainer` standardizes spacing, title layout, and section backgrounds

The current UI also supports dark/light theme switching via the `data-theme` attribute on `document.documentElement`.

## Animation Strategy

Animation is primarily GSAP-based.

- `Hero` uses a GSAP timeline for staged entrance animation
- `Navbar` uses GSAP for hide-on-scroll transitions
- `useGsapReveal()` reveals a single element on first viewport entry
- `useGsapStaggerReveal()` reveals child collections with staggered timing
- `SectionContainer` animates section titles with `ScrollTrigger`

Motion is reduced when `prefers-reduced-motion` is detected, and some heavier background effects are disabled on compact viewports.

## Contact Flow

The contact form submits through `src/api/contact.ts`, which wraps EmailJS.

Required variables:

```text
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY
```

If those variables are missing, the app warns and safely avoids attempting delivery.

## Build and Deployment

Build command:

```bash
npm run build
```

This runs:

```bash
tsc -b && vite build
```

Key deployment characteristics:

- `vite.config.ts` uses `base: './'`
- output is emitted to `dist/`
- the app is static-host friendly because route switching is hash-based
- no custom Vercel config is required in the current setup

## Current Constraints

- `DemoPage.tsx` is still placeholder-heavy for gallery and video content
- the app includes a large `three-stack` chunk because of Three.js-related dependencies
- the hash-route approach is intentionally lightweight, but it is not a replacement for a full router if nested views or richer navigation are added later
