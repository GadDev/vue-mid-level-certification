# Exercise 10 — Pinia Cart

**Time limit: 40 min** · Skills: Pinia setup stores, getters, actions, `storeToRefs`, cross-component state

> **Before you start:** read [Lesson 10 — Shared state that survives destructuring](../../docs/lessons/10-pinia-cart.md).

## Prompt

Implement the cart store in `src/stores/cart.ts` (a **setup store**: `defineStore('cart', () => { ... })`) and finish `CartSummary.vue`. `ProductList.vue` is already wired and must keep working unchanged — the point is that two sibling components share one store.

### Getters (computed)

| Getter      | Meaning                                                     |
| ----------- | ----------------------------------------------------------- |
| `itemCount` | sum of every line's `qty`                                    |
| `isEmpty`   | no lines                                                     |
| `subtotal`  | Σ `price × qty`, rounded to 2 decimals                       |
| `discount`  | `subtotal × rate` for the applied code, else `0`, rounded    |
| `total`     | `subtotal − discount`, rounded                               |

### Actions

- `add(product, qty = 1)` — merges into the existing line for that product; ignores `qty <= 0`.
- `setQty(id, qty)` — `qty <= 0` removes the line; unknown id is a no-op.
- `remove(id)`.
- `applyDiscount(code)` — trimmed and upper-cased. `VUE10` → 10%, `VUE20` → 20%. An empty code clears the discount. An unknown code sets `discountError`, leaves the total alone and returns `false`.
- `clear()` — lines, code and error.

## DOM contract (CartSummary)

| Selector                            | Meaning                                    |
| ----------------------------------- | ------------------------------------------ |
| `[data-testid="count"]`             | `itemCount`                                 |
| `[data-testid="empty"]`             | only when the cart is empty                 |
| `[data-testid="line"]`              | one per cart line                           |
| `[data-testid="line-name"]`         | product name in the line                    |
| `[data-testid="qty"]`               | number input, changing it calls `setQty`    |
| `[data-testid="remove"]`            | per line                                    |
| `[data-testid="discount-form"]`     | submit applies the code                     |
| `[data-testid="discount"]`          | the code input                              |
| `[data-testid="discount-error"]`    | only when the last code was unknown         |
| `[data-testid="subtotal"]`          | `toFixed(2)`                                |
| `[data-testid="discount-amount"]`   | `toFixed(2)`                                |
| `[data-testid="total"]`             | `toFixed(2)`                                |
| `[data-testid="clear"]`             | clears the cart                             |

## Traps

- **Destructuring a store loses reactivity.** `const { total } = useCartStore()` gives you a snapshot; use `storeToRefs(cart)` for state and getters, and take actions off the store object.
- **Stores are singletons per pinia instance.** The tests call `setActivePinia(createPinia())` / pass a fresh `createPinia()` per test for exactly that reason — never keep cart state in module scope.
- **Float money.** `9.99 × 3` is `29.970000000000002`. Round in the getter, not only in the template.

## Run

```bash
pnpm dev:10
pnpm --filter 10-pinia-cart test      # 28 tests (17 store + 11 component)
pnpm --filter 10-pinia-cart typecheck
```

`tests/cart.store.spec.ts` never mounts a component — a well-shaped store is testable on its own.
