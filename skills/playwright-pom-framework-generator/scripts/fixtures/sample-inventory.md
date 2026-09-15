# Frontend Page Inventory

## Pages

### P000 — Example page

#### States

| State ID | Name | Kind | How to reach | Preconditions | Notes |
| --- | --- | --- | --- | --- | --- |
| P000-ST001 | base | base | Open /example | — | |

#### Interactions

| Interaction ID | State ID | Name | Control type | Action | Preferred Playwright locator | Alternate locator | Locator status | Stability | Preconditions | Input contract | Expected transition | Destructive | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P000-ST001-I001 | P000-ST001 | Submit | button | click | `page.getByRole('button', { name: 'Save' })` | — | proposed | high | — | — | persisted | no | static |
