import { test as setup } from '@playwright/test'
import { e2eEnv } from '../environment/env'
import { authFileFor } from './auth-files'

const roles = (process.env.E2E_ROLES ?? 'employee').split(',').map((role) => role.trim()).filter(Boolean)

for (const role of roles) {
  setup(`authenticate ${role}`, async ({ page }) => {
    const credentials = e2eEnv.role(role)
    if (!credentials.email || !credentials.password) {
      setup.skip(true, `Missing E2E_${role.toUpperCase()}_EMAIL or PASSWORD`)
      return
    }
    await page.goto('/login')
    await page.getByLabel('Email address').fill(credentials.email)
    await page.getByLabel('Password').fill(credentials.password)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL((url) => !url.pathname.startsWith('/login'))
    await page.context().storageState({ path: authFileFor(role) })
  })
}
