import { test, expect } from '../../fixtures/test'

test.describe('BF-EXAMPLE-001', () => {
  test('Create an example record when inputs are valid', {
    tag: ['@BF-EXAMPLE-001', '@P000', '@mutation'],
    annotation: [
      { type: 'state', description: 'P000-ST001' },
      { type: 'interaction', description: 'P000-ST001-I001' },
      { type: 'fixture', description: 'example-valid-actor' },
    ],
  }, async ({ examplePage, data }) => {
    await test.step('Given the actor is allowed to create an Example Record', async () => {
      await data.createScenarioData('example-valid-actor')
      await examplePage.goto()
    })
    await test.step('When the actor submits the Example Record', async () => {
      // Bind only source-reconciled locators here.
    })
    await test.step('Then the Example Record is persisted', async () => {
      await expect(examplePage.page).toHaveURL(/example/)
    })
  })
})
