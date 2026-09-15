@domain_example
Feature: Unresolved placeholder

  # Scenario-ID: BF-EXAMPLE-099
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
  Scenario: Placeholder used outside an outline
    Given the actor has <grant>
    When the actor submits the Example Record
    Then the Example Record is persisted
