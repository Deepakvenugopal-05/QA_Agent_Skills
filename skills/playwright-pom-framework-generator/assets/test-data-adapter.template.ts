export type ScenarioDataHandle = {
  profile: string
  ids: Record<string, string>
}

export interface TestDataAdapter {
  createScenarioData(profile: string): Promise<ScenarioDataHandle>
  cleanupScenarioData(handle: ScenarioDataHandle): Promise<void>
}

export class UnconfiguredTestDataAdapter implements TestDataAdapter {
  async createScenarioData(profile: string): Promise<ScenarioDataHandle> {
    throw new Error(
      `Configure a disposable-environment TestDataAdapter before running mutating scenarios (profile: ${profile}).`,
    )
  }

  async cleanupScenarioData(): Promise<void> {
    throw new Error('Configure a disposable-environment TestDataAdapter before cleanup.')
  }
}
