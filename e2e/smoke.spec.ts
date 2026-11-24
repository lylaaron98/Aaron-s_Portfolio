import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Third-party hosts the tests should not depend on (captcha, fonts).
const EXTERNAL = /hcaptcha\.com|fonts\.(googleapis|gstatic)\.com/

async function trackFailures(page: Page) {
  const failures: string[] = []
  await page.route(EXTERNAL, (route) => route.abort())
  page.on('response', (response) => {
    const url = new URL(response.url())
    if (url.hostname === 'localhost' && response.status() >= 400) {
      failures.push(`${response.status()} ${url.pathname}`)
    }
  })
  page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`))
  return failures
}

test('home page renders every section with no broken local requests', async ({ page }) => {
  const failures = await trackFailures(page)
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1, name: 'Aaron Lee' })).toBeVisible()
  for (const id of ['about', 'skills', 'experience', 'projects', 'contact']) {
    await expect(page.locator(`#${id}`)).toBeAttached()
  }

  // Content must be visible without scrolling into it (no hidden reveals).
  await expect(page.locator('#experience h3').first()).toBeVisible()

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForLoadState('networkidle')
  expect(failures).toEqual([])
})

test('every referenced image on project pages loads', async ({ page }) => {
  const failures = await trackFailures(page)
  await page.goto('/projects')
  await expect(page.locator('a[href^="/projects/"]').first()).toBeVisible()
  const links = await page.locator('a[href^="/projects/"]').evaluateAll((anchors) =>
    [...new Set(anchors.map((a) => a.getAttribute('href')!))],
  )
  expect(links.length).toBeGreaterThan(5)

  for (const href of links) {
    await page.goto(href)
    await expect(page.locator('h1')).toBeVisible()
    await page.waitForLoadState('networkidle')
  }
  expect(failures).toEqual([])
})

test('project card opens its dialog and Escape closes it', async ({ page }) => {
  await trackFailures(page)
  await page.goto('/#projects')
  const opener = page.getByRole('button', { name: 'AI Architectural Drawing Platform' })
  await opener.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('img').first()).toBeVisible()
  // The open animation must finish: focus moves to the close button and the
  // panel ends at full size and full opacity, not stuck at the card's rect.
  await expect(dialog.getByRole('button', { name: /close/i }).first()).toBeFocused()
  await expect(dialog.getByRole('heading', { level: 2 }).first()).toBeInViewport()
  await expect
    .poll(() =>
      dialog.evaluate((shell) => {
        const content = shell.querySelector('[class*="modalContent"]')
        return {
          wide: shell.getBoundingClientRect().width > window.innerWidth * 0.6,
          shellOpacity: getComputedStyle(shell).opacity,
          contentOpacity: content ? getComputedStyle(content).opacity : 'missing',
        }
      }),
    )
    .toEqual({ wide: true, shellOpacity: '1', contentOpacity: '1' })
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('intro loader counts to 100 and gets out of the way', async ({ page }) => {
  await trackFailures(page)
  await page.goto('/')
  const loader = page.getByRole('progressbar', { name: 'Loading portfolio' })
  await expect(loader).toBeAttached()
  await expect(loader).toBeHidden({ timeout: 12_000 })
  await expect(page.getByRole('heading', { level: 1, name: 'Aaron Lee' })).toBeVisible()
})

test('legacy hash links redirect to real project URLs', async ({ page }) => {
  await trackFailures(page)
  await page.goto('/#/projects/demo/otodecks')
  await expect(page).toHaveURL(/\/projects\/otodecks$/)
  await expect(page.locator('h1')).toHaveText('Otodecks')
})

test('first visit follows the OS colour scheme', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light' })
  const page = await context.newPage()
  await page.route(EXTERNAL, (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await context.close()
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`no serious accessibility violations (${colorScheme})`, async ({ page }) => {
    await trackFailures(page)
    // Reduced motion so axe measures the settled page, not a header caught
    // mid-fade by its scroll reveal.
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' })
    await page.goto('/')
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('iframe')
      .analyze()
    const serious = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.nodes.length} node(s) e.g. ${v.nodes[0]?.target.join(' ')}`)
    expect(serious).toEqual([])
  })
}

test('résumé button links to a PDF that is served', async ({ page, request }) => {
  await page.goto('/')
  const href = await page.getByRole('link', { name: /resume/i }).getAttribute('href')
  expect(href).toBeTruthy()
  const response = await request.get(href!)
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('pdf')
})
