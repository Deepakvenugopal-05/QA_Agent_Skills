import type { Page } from '@playwright/test'

export class ExamplePage {
  static readonly pageId = 'P000'
  readonly route = '/example'

  constructor(readonly page: Page) {}

  async goto(params: Record<string, string> = {}) {
    let path = this.route
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value).replace(`$${key}`, value).replace(`<${key}>`, value)
    }
    await this.page.goto(path)
  }

  row(name: string) {
    return this.page.getByRole('row', { name })
  }
}
