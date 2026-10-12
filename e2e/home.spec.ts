import { test, expect } from '@playwright/test'

test('landing page renders and theme toggle works', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()

  const html = page.locator('html')
  const initialTheme = await html.getAttribute('data-theme')

  const toggle = page.getByRole('button', { name: /toggle theme/i })
  await expect(toggle).toBeVisible()
  await toggle.click()

  const nextTheme = await html.getAttribute('data-theme')
  expect(nextTheme).not.toBe(initialTheme)
})
