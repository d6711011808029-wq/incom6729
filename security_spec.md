# Security Specification: Income & Expense Tracker (incom6729)

## 1. Data Invariants
- Each transaction record MUST belong to the authenticated owner (`userId == request.auth.uid`).
- Transaction types are strictly `'income'` or `'expense'`.
- Amounts must be positive numbers within legitimate bounds (0 to 1,000,000,000 THB).
- Creation timestamp (`createdAt`) and owner identity (`userId`) are immutable once written.
- All list queries MUST enforce filtering by the authenticated user's `userId`.
- Budget documents are constrained per user and specific month (`YYYY-MM`).

## 2. Protected Collections
- `/transactions/{transactionId}`
- `/budgets/{budgetId}`
- Catch-all default denial on all other paths.

## 3. Operations & Validation Gates
- `create`: Enforces required keys, permitted fields, regex document ID, and authentic user matching.
- `update`: Enforces immutable user ID and creation timestamps, plus validation of updated values.
- `delete`: Requires authentic ownership matching `resource.data.userId == request.auth.uid`.
- `list`: Strictly evaluates `resource.data.userId == request.auth.uid`.
