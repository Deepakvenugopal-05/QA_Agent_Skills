@domain_example
Feature: Bad identifier

  # Scenario-ID: EXAMPLE-1
  # Inventory-Pages: P000
  # Inventory-States: P000-ST001
  # Inventory-Interactions: P000-ST001-I001
  # Semantic-Keys: /example::base::submit
  # Business-Rules: BR-EXAMPLE-001
  # Evidence: implemented
  # Sources:
  # - SKILL.md
  # Actor-Grant-Scope: employee | example.create | SELF
  # Fixture-Profile: example-valid-actor
  # Mutation: no
  # Destructive: no
  Scenario: Invalid scenario identifier format
    Given the actor is allowed to create an Example Record
    When the actor submits the Example Record
    Then the Example Record is persisted
