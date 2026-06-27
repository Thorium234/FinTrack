# FinTrack TODO

Completed in this pass:

1. Backend test harness
   - Added DB-free tests for shared validation helpers, JWT round-tripping, and API route contracts.
2. Receipt uploads
   - Added multipart receipt handling for transactions and static serving for uploaded files.
3. Frontend API contract audit
   - Documented the backend API surface for the eventual frontend integration.

Notes:

- The current frontend is still the default Vite scaffold.
- The backend still needs a real MySQL instance to run end-to-end in this environment.
