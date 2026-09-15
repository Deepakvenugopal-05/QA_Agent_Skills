@domain_example @capability_example
Feature: Example capability user flow
  As an authorized user
  I want to create and manage an example entity through the user interface
  So that domain invariants and business rules are preserved

  Background:
    Given an authenticated session exists
    And the actor has example.view and example.create at SELF scope

  # Scenario-ID: BF-EXAMPLE-001
  # Inventory-Pages: P000
  # Inventory-States: P000-ST001, P000-ST002
  # Inventory-Interactions: P000-ST001-I001, P000-ST002-I001
  # Semantic-Keys: /example::base::open::create-modal, /example::dialog-open:create::submit::create-record
  # Business-Rules: BR-EXAMPLE-001
  # Evidence: implemented
  # Sources:
  # - src/modules/example/services/example.service.ts#createExample
  # - src/modules/example/components/CreateExampleDialog.tsx
  # Actor-Grant-Scope: employee | example.create | SELF
  # Fixture-Profile: example-valid-actor
  # Mutation: yes
  # Destructive: no
  @positive @mutation @actor_employee
  Scenario: Authorized user creates an example record through the creation dialog
    Given the user is on the "Example Management" page
    And the entity list displays existing active items
    When the user opens the "Create Example" modal
    And fills the example form with:
      | Field        | Value                 |
      | Name         | Standard Item Alpha   |
      | Category     | Operations            |
      | Priority     | High                  |
    And confirms the creation form
    Then the "Create Example" modal dismisses
    And a success notification announces "Example record created successfully"
    And a new row appears in the entity table with name "Standard Item Alpha" and status "ACTIVE"
    And the total count indicator increments by 1

  # Scenario-ID: BF-EXAMPLE-002
  # Inventory-Pages: P000
  # Inventory-States: P000-ST001, P000-ST002
  # Inventory-Interactions: P000-ST001-I001, P000-ST002-I001
  # Semantic-Keys: /example::base::open::create-modal, /example::dialog-open:create::submit::create-record
  # Business-Rules: BR-EXAMPLE-VALIDATION-001
  # Evidence: implemented
  # Sources:
  # - src/modules/example/types/example.schema.ts
  # - src/modules/example/components/CreateExampleDialog.tsx
  # Actor-Grant-Scope: employee | example.create | SELF
  # Fixture-Profile: example-invalid-input
  # Mutation: no
  # Destructive: no
  @negative @actor_employee
  Scenario: Reject creation attempt when mandatory name field is missing
    Given the user is on the "Example Management" page
    When the user opens the "Create Example" modal
    And leaves the "Name" field blank
    And confirms the creation form
    Then the "Create Example" modal remains open
    And a field-level validation message displays "Name is required"
    And no new record is added to the entity table
