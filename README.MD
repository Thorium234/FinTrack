# FinTrack — Personal Finance & Expense Tracker

FinTrack is a full-stack personal finance management application designed to help users track income and expenses, establish category-based budgets, visualize spending patterns through interactive analytics, and securely export transaction data. 

This project implements a scalable, secure, decoupled architecture using **Node.js (ES Modules)**, **Express**, **React (Vite)**, and **MySQL**.

---

## 🛠️ Tech Stack & Modern Architecture

### Backend (API Layer)
* **Runtime & Framework**: Node.js (v24+) with Express.js
* **Module System**: Native **ES Modules (`import`/`export`)** matching modern standards
* **Database Driver**: `mysql2/promise` utilizing high-performance connection pooling
* **Security**: `bcryptjs` password hashing, JSON Web Tokens (JWT) for authentication, and strict CORS policies
* **Utilities & Middlewares**: `morgan` for HTTP logging, `multer` for secure receipt uploads, and `dotenv` for configuration insulation

### Frontend (User Interface)
* **Build Tool & View Layer**: Vite + React
* **State Management**: React Context API combined with the `useReducer` pattern
* **Routing**: React Router DOM (with absolute Route Guards for protected views)
* **Network Client**: Axios featuring custom interceptors for synchronized authentication
* **UI & Data Visualization**: Tailwind CSS for responsive layouts and Recharts for interactive analytics

---

## 📁 Repository Directory Structure

This project is organized as a monorepo tracking a decoupled frontend application and a backend API side-by-side.

```text
fintrack/
├── backend/                  # Express API Server Layer
│   ├── src/
│   │   ├── config/           # Database pools & external service configs (e.g., db.js)
│   │   ├── controllers/      # Route request/response orchestrators (e.g., auth.controller.js)
│   │   ├── middlewares/      # Request filters (auth guards, error interceptors)
│   │   ├── models/           # Data access layers & parameterized queries (e.g., User.js)
│   │   ├── routes/           # REST API Endpoint declarations mapping to controllers
│   │   ├── services/         # Core business logic isolated from request/response scopes
│   │   ├── utils/            # Shared structural helpers (JWT signers, response builders)
│   │   ├── app.js            # Express middleware setup & app initializations
│   │   └── server.js         # Server bootstrapper & async database connection checks
│   ├── uploads/              # Local storage sink for uploaded receipts (git-ignored)
│   ├── .env                  # Protected environment variables (git-ignored)
│   └── package.json          # Modern Node configuration ("type": "module")
│
└── frontend/                 # Client UI Application Layer
    ├── public/               # Global static web assets
    ├── src/
    │   ├── api/              # Axios configuration and base clients (axios.js)
    │   ├── assets/           # Client-side static resources (images, SVGs)
    │   ├── components/       # Reusable layout building blocks (Navbar, Sidebar, Tables)
    │   ├── context/          # Global application state scopes (AuthContext, Reducers)
    │   ├── hooks/            # Custom reusable React functional logic (useAuth)
    │   ├── layouts/          # Dashboard structural shells
    │   ├── pages/            # Routable view screens (Dashboard, Login, Budgets)
    │   ├── routes/           # Client-side routing maps & ProtectedRoute guards
    │   ├── services/         # Isolated abstraction layer for API calling logic
    │   ├── App.jsx           # Master application structural router
    │   └── main.jsx          # DOM mounting hook and configuration orchestrator
    └── package.json          # React configuration & tracking
```

---

## 🗺️ Engineering Roadmap (Step-by-Step)

We are building this project methodically using a solo-friendly lifecycle to guarantee clean code and zero debugging deadlocks.

### 🟩 Phase 1: Environment & System Initialization (Current State)
* [x] Scaffold matching directory tree structures for frontend and backend.
* [x] Configure backend project for native Node ES Modules (`"type": "module"`).
* [x] Resolve structural middleware ordering issues (ensuring body parsers fire before routers).
* [x] Bind disjointed local directories into a single unified root Git repository to avoid broken submodules.

### ⬜ Phase 2: Relational Database Modeling & Seeding
* [ ] Write relational schema creation scripts (`schema.sql`) for MySQL.
* [ ] Define foreign key parameters, constraints, and cascading rules across `users`, `transactions`, and `budgets`.
* [ ] Seed the database with mock records to facilitate smooth integration testing.

### ⬜ Phase 3: Secure Authentication System (JWT Setup)
* [ ] Implement secure `bcryptjs` hashing logic inside user registration flows.
* [ ] Develop JWT token issuance utilities and create an incoming `auth.middleware.js` verification handler.
* [ ] Build complete registration and login routes, testing with `curl` and Postman payload configurations.

### ⬜ Phase 4: Core Ledger Logic (Transactions & Budgets CRUD)
* [ ] Write transactional SQL statement methods inside the database models.
* [ ] Build out resource endpoints allowing full creation, reading, updating, and deletion of user records.
* [ ] Implement threshold validation algorithms to dynamically alert users when category spending crosses their monthly budget limits.

### ⬜ Phase 5: Client Layer Integration (React Application Setup)
* [ ] Build out state providers using `AuthContext` alongside the custom `useAuth` hook.
* [ ] Code layout frames, absolute route guards, and functional data forms.
* [ ] Integrate active Axios interceptors to automatically bind JWT headers to processing requests.

### ⬜ Phase 6: Advanced Capabilities, Reporting & Polish
* [ ] Implement `Recharts` graphs to surface spending breakdowns on the master dashboard screen.
* [ ] Mount `multer` file system configurations to process and stream receipt attachment uploads.
* [ ] Build data-formatting engines to generate operational exports of user ledger data.

---

## 🚀 Local Development Startup

### 1. Database Provisioning
Ensure you have a local MySQL instance initialized. Create a database called `fintrack`.

### 2. Environment Configuration
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=            # Leave blank if your local user has no password
DB_NAME=fintrack
JWT_SECRET=your_super_secure_development_secret_key
```

### 3. Execution Protocols
Open two parallel shell streams in your development console.

#### Booting the API Layer:
```bash
cd backend
npm install
npm run dev
```

#### Booting the UI Layer:
```bash
cd frontend
npm install
npm run dev
```
