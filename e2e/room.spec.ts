import { test, expect as baseExpect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Software WebGL keeps the main thread busy, so give assertions room to settle.
const expect = baseExpect.configure({ timeout: 15_000 })

const room = (page: import('@playwright/test').Page) => page.getByRole('region', { name: '3D room intro' })

test.beforeEach(async ({ page }) => {
  await page.route(/hcaptcha\.com|fonts\.(googleapis|gstatic)\.com/, (route) => route.abort())
  const webgl = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  })
  test.skip(!webgl, 'No WebGL in this browser, so the room never shows')
  // CI renders WebGL on the CPU, so the scene takes longer to come up.
  test.slow()
})

test('first visit opens the room, Skip goes to the site and is remembered', async ({ page }) => {
  await page.goto('/')
  await expect(room(page)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enter portfolio' })).toBeEnabled({ timeout: 20_000 })

  const results = await new AxeBuilder({ page }).include('[aria-label="3D room intro"]').analyze()
  expect(results.violations).toEqual([])

  await page.getByRole('button', { name: 'Skip to site' }).click()
  await expect(room(page)).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1, name: 'Aaron Lee' })).toBeVisible()

  await page.reload()
  await expect(page.locator('#hero')).toBeVisible()
  await expect(room(page)).toHaveCount(0)
})

test('Escape leaves the room; ?room brings it back', async ({ page }) => {
  await page.goto('/')
  await expect(room(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(room(page)).toHaveCount(0)

  await page.goto('/?room')
  await expect(room(page)).toBeVisible()
  await expect(page).toHaveURL(/\/$/)
})

test('the navbar button goes back to the room', async ({ page }) => {
  await page.goto('/')
  await expect(room(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(room(page)).toHaveCount(0)

  await page.getByRole('button', { name: 'Back to the 3D room' }).click()
  await expect(room(page)).toBeVisible()
  await page.getByRole('button', { name: 'Skip to site' }).click()
  await expect(room(page)).toHaveCount(0)
})

test('deep links skip the room', async ({ page }) => {
  await page.goto('/#projects')
  await expect(page.locator('#projects')).toBeAttached()
  await expect(room(page)).toHaveCount(0)
})
