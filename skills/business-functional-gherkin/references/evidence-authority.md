# Evidence Authority

Never collapse disagreeing sources into one silent “truth.” Tag every rule.

## Tiers

| Tier | Authority | Typical sources | Can override inventory? |
|---|---|---|---|
| 1 | Implemented runtime | Prisma schema/constraints, server services, route guards, authorization functions | Yes |
| 2 | Executable tests | Unit, integration, and component tests that exercise the rule | Yes, if they match current code |
| 3 | Accepted architecture | ADRs, finalized module specs, `CONTEXT.md` ubiquitous language | Only when code is silent |
| 4 | Planned / historical | Draft/planned tickets, stale route docs, older names | No |
| 5 | Generated inventory | `frontend-page-inventory.md` pages/states/interactions/locators | No |

If tier 3 contradicts tier 1, the rule is `conflicted`. Generate the **implemented** scenario and record the desired/spec behavior in the validation report.

## Evidence status

Use exactly:

- `implemented` — code/schema/tests prove it
- `accepted` — ADR/final spec, no contradicting code
- `planned` — documented as future; do not treat as current product behavior
- `conflicted` — two or more tiers disagree
- `inferred` — reasonable but unproven; keep out of happy-path “must” scenarios unless labeled

## Inventory-specific distrust

Treat these inventory claims as untrusted until source-checked:

- `data-testid` values
- “complete” coverage counts
- exact button/toast copy
- role-name-as-permission
- “alias” routes that may be independently implemented
- dialog field sets and confirmation labels
- locator stability/uniqueness

Inventory IDs remain useful as trace anchors.

## Rule record

```text
Rule ID: BR-<DOMAIN>-<SLUG>-###
Statement: one business sentence
Evidence status: implemented | accepted | planned | conflicted | inferred
Authority tier: 1-5
Source path: repo-relative POSIX path
Symbol or heading: function, enum, or markdown heading
Entities: domain nouns
Conflict notes: — or the opposing source
```

Rule IDs are stable across regenerations when the statement is unchanged.

## Permission language

Prefer:

```text
an actor with leave.approve at TEAM scope
```

Do not write “an HR user can approve leave” unless code authorizes by role ID rather than grant/scope.

Hidden UI is not authorization. If a control is hidden, still require a server-rejection scenario when a corresponding action exists.
