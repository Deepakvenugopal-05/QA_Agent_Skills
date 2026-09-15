# Gherkin Style & User Flow Architecture

Write behavioral specifications that a business analyst can understand, an end user recognizes as their daily workflow, and an automation agent can reliably bind to Page Objects.

## The 5-Phase User Flow Framework

Every business-functional scenario must model a realistic **User Journey** across UI surfaces, not a headless database transaction. Follow this 5-phase progression:

```text
[Phase 1: Spatial Context & Surface]  -> "Given the employee is logged in and on the 'My Leaves' page"
[Phase 2: Interaction Trigger]        -> "When the employee opens the 'Apply Leave' modal"
[Phase 3: Progressive Input Flow]     -> "And fills the leave application with:"
                                          | Leave Type   | Start Date | End Date   |
                                          | Casual Leave | 2026-04-10 | 2026-04-12 |
[Phase 4: Action Confirmation]        -> "And submits the leave application"
[Phase 5: Dual-Layer Outcome]         -> "Then the 'Apply Leave' modal closes"
                                         "And a new entry appears in the 'Pending Requests' table with badge 'PENDING'"
                                         "And the 'Casual Leave' balance updates to '5 Available' and '3 Reserved'"
```

## Anti-Pattern vs. Best Practice

| Anti-Pattern (Too Imperative / Brittle) | Anti-Pattern (Too Headless / No Flow) | Best Practice (Rich Declarative User Flow) |
| :--- | :--- | :--- |
| `When I click button[data-testid='leaves-apply-btn']` | `When the employee submits the Leave Request` | `Given the employee is on the "My Leaves" page`<br/>`When the employee opens the "Apply Leave" modal` |
| `And I type 'Casual Leave' into input#type` | *(omits user input completely)* | `And selects "Casual Leave" from the leave type selector` |
| `And I click button#submit` | *(hidden inside single step)* | `And submits the leave application` |
| `Then getByTestId('modal').should('not.exist')` | `Then the Leave Request is pending` | `Then the "Apply Leave" modal closes`<br/>`And a new row appears in the "Pending Requests" table with status "PENDING"`<br/>`And the "Casual Leave" balance reflects the reserved days` |

## File Shape & Reference Example

```gherkin
@domain_leave @capability_leave_request
Feature: Employee leave request submission
  As an active employee
  I want to apply for time off through the employee leave portal
  So that working days are reserved and forwarded to my manager for decision

  Background:
    Given an authenticated employee session exists
    And the actor has leave.view and leave.create at SELF scope

  # Scenario-ID: BF-LEAVE-001
  # Inventory-Pages: P015
  # Inventory-States: P015-ST001, P015-ST002
  # Inventory-Interactions: P015-ST001-I001, P015-ST002-I006
  # Semantic-Keys: /$role/leave/my::base::open::apply-leave, /$role/leave/my::dialog-open:apply-leave::submit::apply-leave
  # Business-Rules: BR-LEAVE-RESERVATION-001
  # Evidence: implemented
  # Sources:
  # - src/modules/leave/services/balance.service.ts#reserveBalance
  # - src/modules/leave/components/ApplyLeaveModal.tsx
  # Actor-Grant-Scope: employee | leave.create | SELF
  # Fixture-Profile: employee-with-available-balance
  # Mutation: yes
  # Destructive: no
  @positive @mutation @actor_employee
  Scenario: Employee applies for Casual Leave from the My Leaves portal
    Given the employee is on the "My Leaves" page
    And the "Casual Leave" balance card displays "8 Days Available"
    When the employee opens the "Apply Leave" modal
    And fills the leave application with:
      | Field        | Value                 |
      | Leave Type   | Casual Leave          |
      | Start Date   | Tomorrow              |
      | End Date     | 3 days from tomorrow  |
      | Half Day     | Full Day              |
      | Reason       | Family event          |
    And submits the leave application
    Then the "Apply Leave" modal closes
    And a confirmation toast announces "Leave request submitted successfully"
    And a new entry appears in the "Pending Requests" table with:
      | Column       | Value                 |
      | Type         | Casual Leave          |
      | Duration     | 3 Days                |
      | Status       | PENDING               |
    And the "Casual Leave" balance updates to "5 Available" and "3 Reserved"
```

## Step Vocabulary & Guidelines

### 1. Spatial Context (`Given`)
Always name the user surface or starting route:
- `Given the employee is logged in and navigates to the "Role Dashboard"`
- `Given the manager is on the "Team Leaves" overview page`
- `Given the recruiter accesses the "Opening Kanban Board" for "Senior Backend Engineer"`

### 2. Interaction Sequence (`When / And`)
Model the user's progressive journey without code-level locators:
- **Opening Overlays**: `When the employee opens the "Clock In" dialog` / `When the user opens the "Add Employee" drawer`
- **Selection & Inputs**: `And selects project "Project Titan" from the dropdown` / `And chooses task "API Integration" from the task list`
- **Data Tables**: Use Gherkin tables for forms with 2+ inputs:
  ```gherkin
  And fills the requisition form with:
    | Field          | Value                 |
    | Job Title      | QA Lead               |
    | Department     | Engineering           |
    | Target Headcount| 2                    |
  ```
- **Execution Triggers**: `And confirms the clock-in entry` / `And submits the deactivation confirmation` / `And advances the candidate to "Technical Interview"`

### 3. Observable Feedback & Domain Invariants (`Then / And`)
Always verify both the **visible user interface outcome** and the **underlying domain state**:
- **UI Lifecycle**: `Then the dialog closes` / `And the modal dismisses` / `And the user is redirected to the role dashboard`
- **Visual State**: `And the clock button reflects "Clock Out"` / `And a live timer increments from "00:00:00"` / `And the candidate card moves to the "Technical Interview" column`
- **Table / Ledger State**: `And a new row appears in the "Pending Requests" table with status "PENDING"` / `And the balance updates to "5 Available" and "3 Reserved"`
- **Feedback Alerts**: `And a success toast announces "..."` / `And a field validation error warns "Mandatory task selection required"`

### 4. Forbidden in Steps
- Playwright, CSS, XPath, or test IDs (`getByTestId`, `page.locator`, `data-testid`, `#btn-id`)
- Bare imperative verbs: `click`, `type into` (use declarative actions: `opens`, `selects`, `enters`, `submits`, `confirms`)
- Vacuous assertions: `should work`, `is successful` (specify the concrete state transition)
- Skipping the user journey: jumping straight from a database state to a database assertion without modeling the user interaction.

## Scenario Outline for Matrices

Use for status transition and permission boundary matrices:

```gherkin
Scenario Outline: Opening status lifecycle transitions
  Given the recruiter is on the "Job Openings" management page
  And the opening is currently in "<current_status>" status
  When the recruiter changes the opening status to "<target_status>"
  Then the transition outcome is "<outcome>"
  And the opening status badge displays "<final_badge>"

  Examples:
    | current_status | target_status | outcome  | final_badge |
    | ACTIVE         | PAUSED        | allowed  | PAUSED      |
    | PAUSED         | ACTIVE        | allowed  | ACTIVE      |
    | CLOSED         | ACTIVE        | rejected | CLOSED      |
```

## Fixtures

Name profiles, not production IDs:
- `employee-with-available-balance`
- `pending-leave-request`
- `active-opening-with-candidates`
- `valid-offer-token`

Never embed live tokens, emails, or passwords.

## Quality Lint Checklist

Reject or rewrite:
1. **Headless Scenarios**: When steps skip from precondition to `When the actor submits...` without naming the surface or interaction.
2. **Missing Surface**: Scenarios that do not name the page, route, modal, or drawer where the action happens.
3. **Missing Observable Outcome**: Scenarios whose `Then` steps only check database invariants without checking UI state transitions (e.g. modal closed, table row rendered, badge updated).
4. **Single-Step Form Mutations**: Scenarios that submit complex multi-field entities in one vague sentence without specifying user input values or data tables.
