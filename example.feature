@domain_example @capability_example
Feature: Example capability
  As an authorized actor
  I want a business outcome
  So that the domain invariant holds

  # Scenario-ID: BF-EXAMPLE-001
  # Inventory-Pages: P000
  # Inventory-States: P000-ST001
  # Inventory-Interactions: P000-ST001-I001
  # Semantic-Keys: /example::base::submit::example-record
  # Business-Rules: BR-EXAMPLE-001
  # Evidence: implemented
  # Sources:
  # - SKILL.md
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
