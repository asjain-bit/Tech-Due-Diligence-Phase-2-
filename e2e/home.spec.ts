import { test, expect } from '@playwright/test'

test('landing page renders with light theme and profile selection', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()

  const html = page.locator('html')
  const theme = await html.getAttribute('data-theme')
  expect(theme).toBe('light')

  // Click Sign in with SSO to open profile options
  const ssoButton = page.getByRole('button', { name: /sign in with sso/i })
  await expect(ssoButton).toBeVisible()
  await ssoButton.click()

  // Verify profile options
  await expect(page.getByText('Director', { exact: true })).toBeVisible()
  await expect(page.getByText('Evaluator', { exact: true })).toBeVisible()
  await expect(page.getByText('Stragety Fit', { exact: true })).toBeVisible()
  await expect(page.getByText('Sponsor', { exact: true })).toBeVisible()
  await expect(page.getByText('Legal & Partnership Director', { exact: true })).toBeVisible()
})
