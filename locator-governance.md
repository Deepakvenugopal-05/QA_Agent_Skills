# Locator Governance

Fail closed. A locator in the inventory is a **candidate**, not a contract.

## Ranked preference after source reconciliation

1. `getByRole(role, { name })` proven in source or component tests
2. `getByLabel` / associated label proven in source
3. `getByPlaceholder` only if no label
4. `getByTestId` only if the attribute exists in application source
5. Scoped CSS as documented fallback
6. Never prefer XPath, MUI generated classes, coordinate clicks, or `.nth()` / `.first()` used to dodge duplicates

## Reconciliation

For each inventory preferred/alternate locator:

1. Search application source for the test id, aria-label, visible name, or label
2. If found, `source: 'source'`, status stays `proposed` until runtime
3. If not found, `source: 'inventory'`, status `blocked` or `needs-contract`
4. If inventory used `getByTestId('...')` and grep finds zero matches, treat as **fabricated**
5. Keep placeholders like `<employeeName>` as method parameters; never stringify them

## Executable vs skipped

| Condition | Spec |
|---|---|
| Source-proven role/label, unique by construction (dialog-scoped, named row) | May generate **active** code still tagged `proposed` |
| Fabricated test id | **skip** + remediation |
| `needs-contract` / fragile / `.first()` / `.Mui*` | **skip** |
| Runtime unique | may promote to `runtime-validated` |
| Runtime missing / ambiguous | `unreachable` or stay skipped |

Active tests may use proposed **source-proven** locators, but the generation report must not claim the framework is runtime-complete.

## Locator contract shape

```ts
type LocatorContract = {
  interactionId: string
  semanticKey: string
  expression: string
  alternate?: string
  source: 'inventory' | 'source' | 'runtime'
  status: 'proposed' | 'runtime-observed' | 'runtime-validated' | 'needs-contract' | 'blocked' | 'unreachable'
  stability: 'high' | 'medium' | 'low' | 'fragile'
  skipReason?: string
}
```

## Forbidden in generated page objects

- `.MuiButton-root`, `.Mui*`
- `xpath=`
- `page.mouse.click(`
- `waitForTimeout(`
- `.first()` without a documented single-match invariant
- hard-coded emails, tokens, UUIDs
- invented `data-testid` strings
