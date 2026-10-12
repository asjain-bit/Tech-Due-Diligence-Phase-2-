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

test('director flow: views partnership requests table, opens detailed view, and interacts with tabs', async ({
  page,
}) => {
  await page.goto('/')

  // SSO login
  await page.getByRole('button', { name: /sign in with sso/i }).click()
  await page.getByText('Director', { exact: true }).click()

  // Verify Dashboard and Partnership Requests table
  await expect(page.getByText('Partnership Requests')).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Company name' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Vendor Name' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Solution', exact: true })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Focus Area' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Solution Maturity' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Submitted on' })).toBeVisible()

  // Click on AlphaHealth row to open detailed view
  await page.getByText('AlphaHealth BioTech').click()

  // Verify Overview tab contents
  await expect(page.getByText('Partnership Request Workflow')).toBeVisible()
  await expect(page.getByText('Submission')).toBeVisible()
  await expect(page.getByText('Intake & Triage')).toBeVisible()
  await expect(page.getByText('Screening & Fit')).toBeVisible()

  // 4 Cards from Image 2
  await expect(page.getByText('EVIDENCE')).toBeVisible()
  await expect(page.getByText('DEPLOYMENT')).toBeVisible()
  await expect(page.getByText('REGULATORY')).toBeVisible()
  await expect(page.getByText('DUPLICATE CHECK')).toBeVisible()

  // SOW Details & Documents from Image 3
  await expect(page.getByText('SOW Details')).toBeVisible()
  await expect(page.getByText('Uploaded Documents')).toBeVisible()

  // Switch to Brief Tab
  await page.getByRole('button', { name: 'Brief' }).click()
  await expect(page.getByText('Company Information')).toBeVisible()
  await expect(page.getByText('Key Assessment Areas')).toBeVisible()
  await expect(page.getByText('Director Evaluation & Decision')).toBeVisible()

  // Test Proceed action
  await page.getByRole('button', { name: /Proceed/i }).click()
  await expect(
    page.getByText(/Partnership request has been approved to proceed to the next stage/i)
  ).toBeVisible()

  // Back button returns to table
  await page.getByRole('button', { name: 'Back to Partnership Requests' }).click()
  await expect(page.getByText('Partnership Requests')).toBeVisible()
})
