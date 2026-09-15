@domain_example @capability_example
Feature: Example capability
  As an authorized actor
  I want a business outcome
  So that the domain invariant holds

  Background:
    Given an authenticated session exists
    And the actor has <resource.action> at <scope> scope

  # Scenario-ID: BF-EXAMPLE-001
  # Inventory-Pages: P000
  # Inventory-States: P000-ST001
  # Inventory-Interactions: P000-ST001-I001
  # Semantic-Keys: /example::base::submit::example-record
  # Business-Rules: BR-EXAMPLE-001
  # Evidence: implemented
  # Sources:
  # - src/modules/example/services/example.service.ts#createExample
  # Actor-Grant-Scope: employee | example.create | SELF
  # Fixture-Profile: example-valid-actor
  # Mutation: yes
  # Destructive: no
  @positive @mutation @actor_employee
  Scenario: Create an example record when inputs are valid
    Given the actor is allowed to create an Example Record
    And no conflicting Example Record exists
    When the actor submits the Example Record
    Then the Example Record is persisted
    And the Example Record is in the expected initial status

  # Scenario-ID: BF-EXAMPLE-002
  # Inventory-Pages: P000
  # Inventory-States: P000-ST001
  # Inventory-Interactions: P000-ST001-I001
  # Semantic-Keys: /example::base::submit::example-record
  # Business-Rules: BR-EXAMPLE-VALIDATION-001
  # Evidence: implemented
  # Sources:
  # - src/modules/example/types/example.schema.ts
  # Actor-Grant-Scope: employee | example.create | SELF
  # Fixture-Profile: example-invalid-input
  # Mutation: no
  # Destructive: no
  @negative @actor_employee
  Scenario: Reject an example record when required input is missing
    Given the Example Record is missing a required field
    When the actor submits the Example Record
    Then the Example Record is not persisted
