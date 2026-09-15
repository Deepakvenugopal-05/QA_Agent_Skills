import { test as base } from '@playwright/test'
import { ExamplePage } from '../pages/example.page'
import { ApplicationShellComponent } from '../components/application-shell.component'
import { UnconfiguredTestDataAdapter, type TestDataAdapter } from '../data/test-data-adapter'

type Fixtures = {
  examplePage: ExamplePage
  shell: ApplicationShellComponent
  data: TestDataAdapter
}

export const test = base.extend<Fixtures>({
  examplePage: async ({ page }, use) => {
    await use(new ExamplePage(page))
  },
  shell: async ({ page }, use) => {
    await use(new ApplicationShellComponent(page))
  },
  data: async ({}, use) => {
    await use(new UnconfiguredTestDataAdapter())
  },
})

export { expect } from '@playwright/test'
