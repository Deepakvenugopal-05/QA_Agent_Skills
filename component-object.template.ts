import type { Page } from '@playwright/test'

export class ApplicationShellComponent {
  static readonly surfaceId = 'S001'

  constructor(readonly page: Page) {}

  navLink(name: string) {
    return this.page.getByRole('navigation').getByRole('link', { name })
  }
}
