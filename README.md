
# Aaron's Portfolio

A modern, responsive personal portfolio website for Aaron — a Frontend & Fullstack Software Engineer specializing in web and mobile application development.

## Tech Stack

- **Vite** — fast dev server & build tool
- **React 19** + **TypeScript** — component-based UI
- **React Router** — client-side routing for multi-page navigation
- **CSS Modules** — scoped, plain CSS (no Tailwind, no styled-components)


## Sections & Features

- **Hero** — full-screen intro with typewriter role animation
- **About** — personal bio and tech highlights
- **Skills** — categorized cards (Frontend, Backend, Mobile, Tools & Cloud)
- **Projects** — showcase project cards with always-visible tech stack tags and links
	- Cards are uniform in size, with a scrollable, light-grey description area and a subtle, light-grey custom scrollbar
	- Clicking a card navigates to a dedicated demo page (`/demo`)
- **Demo Page** — placeholder for gallery, development process, and video (expandable)
- **Contact** — contact form + direct links (email, LinkedIn, GitHub)
- **Footer** — copyright and social links

## Navigation

- Uses **React Router** for seamless client-side navigation
- Navbar logo always routes to the homepage
- Project cards and folder icon link to the demo page

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The output goes to `dist/`. The site is configured with `base: './'` in `vite.config.ts` for GitHub Pages compatibility.

## Deployment (GitHub Pages)

1. Run `npm run build`
2. Push the `dist/` folder to the `gh-pages` branch, or use a GitHub Actions workflow.

## Customization

- Update personal info, project details, and contact links in the component files under `src/components/`
- Swap the avatar placeholder in `About.tsx` with a real `<img>` tag
- Replace `href` placeholders in `Contact.tsx` and `Footer.tsx` with real URLs
- Colors and fonts are defined as CSS custom properties in `src/index.css`
- Project card layout, scrollable description, and tech stack display can be adjusted in `Projects.module.css`
