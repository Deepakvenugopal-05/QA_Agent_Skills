# Gherkin Style

Write specifications a domain expert can read. The POM skill will bind steps to locators later.

## File shape

```gherkin
@domain_leave @capability_leave_request
Feature: Employee leave requests
  As an employee
  I want to submit a Leave Request
  So that working days are reserved pending a decision

  Background:
    Given an employee has an authenticated session
    And the employee has leave.view at SELF scope

  # Scenario-ID: BF-LEAVE-001
  # Inventory-Pages: P015
  # Inventory-States: P015-ST001,P015-ST002
  # Inventory-Interactions: P015-ST001-I001,P015-ST002-I006
  # Semantic-Keys: /$role/leave/my::apply-leave::submit
  # Business-Rules: BR-LEAVE-RESERVATION-001
  # Evidence: implemented
  # Sources:
  # - src/modules/leave/services/request-submission.service.ts#submitLeaveRequest
  # Actor-Grant-Scope: employee | leave.create | SELF
  # Fixture-Profile: employee-with-available-balance
  # Mutation: yes
  # Destructive: no
  @positive @mutation @actor_employee
  Scenario: Reserve balance when an employee submits a valid leave request
    Given the employee has sufficient available balance for a standard Leave Type
    And the requested working dates do not overlap another pending or approved Leave Request
    When the employee submits the Leave Request
    Then the Leave Request is pending
    And the requested amount is reserved from the Employee Leave Balance
```

Required comment keys are listed in [traceability-and-coverage.md](./traceability-and-coverage.md).

## IDs and tags

- Scenario ID: `BF-<DOMAIN>-###` unique across the suite
- Domain tag: `@domain_<name>`
- Path type: `@positive` `@negative` `@authorization` `@lifecycle` `@concurrency` `@planned`
- Actor tag: `@actor_<name>`
- `@mutation` when state changes; `@destructive` when irreversible/hard to isolate

## Step language

Use domain nouns from `CONTEXT.md` or schema names.

Good:

```gherkin
When the employee submits the Leave Request
Then the Leave Request is pending
And the requested amount is reserved
```

Bad:

```gherkin
When I click the Submit button
Then I see a green toast
And getByTestId('leaves-submit-btn') is visible
```

Forbidden in steps:

- Playwright / CSS / XPath / test IDs
- “click”, “type into”, “see the modal” as the business outcome
- “should work” / “is successful” with no state change
- Exact UI copy unless an accepted spec or source string proves it

Opening a dialog may appear in `Given`/`When` only as a precondition (“the apply-leave form is open”), not as the Then.

## Scenario Outline

Use for transition and scope matrices. Placeholders in `<angle>` must match Examples headers. Do not leave `<placeholder>` in ordinary Scenarios.

```gherkin
Scenario Outline: Opening status transitions
  Given an Opening is <from>
  When an authorized actor transitions the Opening to <to>
  Then the outcome is <outcome>

  Examples:
    | from   | to     | outcome |
    | ACTIVE | PAUSED | allowed |
    | CLOSED | ACTIVE | rejected |
```

## Fixtures

Name profiles, not production IDs:

- `employee-with-available-balance`
- `pending-leave-request`
- `active-opening-with-candidates`
- `valid-offer-token`

Never embed live tokens, emails, or passwords.

## Quality lint

Reject or rewrite:

- Scenarios with no Then
- Then that only restates the When click
- Multiple unrelated When mutations in one scenario
- Role-only security without grant/scope
- Happy path that skips unauthorized and invalid-state siblings for a mutation
