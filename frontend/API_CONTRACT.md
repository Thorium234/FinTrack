# FinTrack API Contract

Base URL:

- `http://localhost:5000/api`

Auth:

- Send `Authorization: Bearer <token>` for protected routes.

Endpoints:

1. `POST /auth/register`
   - Body: `name`, `email`, `password`
   - Returns: `user`, `token`
2. `POST /auth/login`
   - Body: `email`, `password`
   - Returns: `user`, `token`
3. `GET /auth/profile`
   - Returns: current token claims as `user`
4. `GET /categories`
   - Returns: `categories`
5. `POST /categories`
   - Body: `name`, optional `color`, optional `icon`
   - Returns: `category`
6. `GET /transactions`
   - Query: optional `type`, `categoryId`, `month`, `fromDate`, `toDate`, `limit`, `offset`
   - Returns: `transactions`
7. `POST /transactions`
   - Body: `amount`, `type`, `transactionDate`, optional `categoryId`, `description`, `receiptUrl`
   - Multipart upload field: `receipt`
   - Returns: `transaction`
8. `GET /transactions/summary`
   - Query: optional `month`
   - Returns: `month`, `summary`, `recentTransactions`, `categoryBreakdown`
9. `GET /budgets`
   - Query: optional `month`
   - Returns: `budgets`
10. `POST /budgets`
    - Body: `categoryId`, `amount`, `month`
    - Returns: `budget`
11. `GET /budgets/summary`
    - Query: optional `month`
    - Returns: `month`, `budgets`, `usage`
12. `GET /dashboard/summary`
    - Query: optional `month`
    - Returns: `month`, `summary`, `recentTransactions`, `categoryBreakdown`, `budgets`, `categories`

Notes:

- Receipt uploads are stored under `/uploads/receipts/...`.
- The UI layer can build against these response envelopes without guessing field names.
