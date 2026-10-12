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

  // Verify Dashboard KPI cards matching Image 1
  await expect(page.getByText('Total Partnership Requests')).toBeVisible()
  await expect(page.getByText('Pending Director Review')).toBeVisible()
  await expect(page.getByText('NDA in Progress')).toBeVisible()
  await expect(page.getByText('SLA Breached')).toBeVisible()

  // Verify Partnership Requests table headers
  await expect(page.getByRole('heading', { name: 'Partnership Requests' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Company name' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Vendor Name' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Solution', exact: true })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Focus Area' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Solution Maturity' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: 'Submitted on' })).toBeVisible()

  // Click on MedTech Innovations row to open detailed view matching Image 2
  await page.getByText('MedTech Innovations').click()

  // Verify Overview tab contents (Image 2)
  await expect(page.getByText('Workflow Progress')).toBeVisible()
  await expect(page.getByText('1. Submission')).toBeVisible()
  await expect(page.getByText('2. Intake & Triage')).toBeVisible()
  await expect(page.getByText('3. Screening & Fit')).toBeVisible()
  await expect(page.getByText('Solution Overview')).toBeVisible()
  await expect(page.getByText('Key Information')).toBeVisible()

  // Switch to Partnership Brief Tab (Image 3)
  await page.getByRole('button', { name: /Partnership Brief/i }).click()
  await expect(page.getByRole('button', { name: /Company Information/i })).toBeVisible()
  await expect(page.getByText('1. Company Information')).toBeVisible()
  await expect(page.getByText(/2. Company's Stage of Maturity and Experience/i)).toBeVisible()

  // Test Proceed action via modal
  await page.getByRole('button', { name: /^Proceed$/i }).click()
  await expect(page.getByText('Proceed to Next Stage')).toBeVisible()
  await page.getByRole('button', { name: /Confirm & Proceed/i }).click()

  await expect(
    page.getByText(/Partnership request has been approved to proceed to the next stage/i)
  ).toBeVisible()

  // Back button returns to table
  await page.getByRole('button', { name: 'Back to Partnership Requests' }).click()
  await expect(page.getByRole('heading', { name: 'Partnership Requests' })).toBeVisible()
})
