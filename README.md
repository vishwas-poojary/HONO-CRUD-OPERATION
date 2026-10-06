# Hono Enterprise CRUD REST API

A production-grade REST API built using **Hono**, **TypeScript**, and **Node.js**, designed by analyzing and adopting the architecture, middleware pipeline, and code patterns from the reference enterprise project (`rohan-corporation-bk-service-cost-estimation`).

---

## 📑 Table of Contents

1. [Architecture Overview & Flow Analysis](#architecture-overview--flow-analysis)
2. [What is Husky & Git Hooks?](#what-is-husky--git-hooks)
3. [CRUD REST API Endpoints](#crud-rest-api-endpoints)
4. [Request / Response Lifecycle](#request--response-lifecycle)
5. [Error Handling & Validation](#error-handling--validation)
6. [Postman Collection & Testing](#postman-collection--testing)
7. [Running the Project](#running-the-project)

---

## 🏛 Architecture Overview & Flow Analysis

By analyzing the reference project (`rohan-corporation-bk-service-cost-estimation`), we identified several key enterprise design patterns and faithfully implemented them into this Hono application:

```
Request ➡️ entryPoint ➡️ attachLogger ➡️ Route / ZodValidator ➡️ Controller ➡️ Service Layer ➡️ exitPoint ➡️ Response
```

### 1. Layered Folder Structure
```
c:\Exelon\Hono\
├── .husky/                   # Git hooks (pre-commit automation)
├── src/
│   ├── config/v1/            # Environment and application configuration
│   ├── controller/v1/        # Request handling and response dispatching
│   ├── exceptions/v1/        # Custom exception classes (HttpException)
│   ├── middleware/           # Pipeline middlewares (entryPoint, exitPoint, zodValidator)
│   ├── routes/v1/            # Route declarations and modular router groups
│   ├── schemas/v1/           # Zod validation schemas
│   ├── services/v1/          # Business logic and data store access
│   ├── utils/v1/             # Loggers (Pino), constants, types, helpers
│   └── index.ts              # Application bootstrap & server initialization
├── .env                      # Environment variables
├── .prettierrc               # Prettier code formatting rules
├── eslint.config.js          # ESLint flat config with TypeScript rules
├── package.json              # Dependencies and lint-staged scripts
├── postman_collection.json   # Exported Postman collection for API testing
└── tsconfig.json             # TypeScript configuration
```

### 2. Standardized Envelope Response
Every API response strictly follows the reference format:
```json
{
  "status": 200,
  "message": "success",
  "data": { ... },
  "toastMessage": "Item retrieved successfully"
}
```

### 3. Traceability Headers
Every response includes correlation and performance headers:
- `X-Transaction-Id`: Unique transaction ID generated at `entryPoint` (`tx_...`)
- `X-Response-Time`: End-to-end execution duration (e.g. `2ms`)
- `X-Environment`: Runtime environment (e.g. `development`, `production`)

---

## 🐶 What is Husky & Git Hooks?

### What is Husky?
**Husky** is a tool that manages **Git Hooks** easily in modern JavaScript/TypeScript projects. Git natively provides hooks—scripts that run automatically when specific Git events happen (such as `pre-commit`, `pre-push`, `commit-msg`).

Without Husky, Git hooks must be manually copied into the local `.git/hooks/` folder on every developer's machine (and `.git/hooks/` cannot be tracked by git).

Husky solves this by:
1. Storing hooks in a version-controlled `.husky/` directory.
2. Automatically installing and linking hooks when developers run `npm install` via the `"prepare": "husky"` npm script.

### Why Do We Use Husky?
- **Prevents Bad Code from Being Committed**: Runs formatters (`prettier`), linters (`eslint`), and type checkers (`tsc`) before code gets committed.
- **Enforces Code Consistency**: Ensures every developer adheres to identical code formatting and linting rules.
- **Saves CI/CD Time**: Catches syntax errors, lint issues, and broken builds locally before pushing to remote pipelines.

### Pre-commit Workflow in this Project
When you run `git commit -m "..."`, Husky triggers `.husky/pre-commit`:
1. **lint-staged**: Inspects only the files staged for the commit (`git diff --cached`).
2. **ESLint (`eslint --fix`)**: Automatically lints and fixes code issues.
3. **Prettier (`prettier --write`)**: Formats staged code according to `.prettierrc`.
4. **TypeScript Build (`npm run build`)**: Compiles the project using `tsc` to ensure zero type errors.
5. If any check fails, the commit is **blocked** and aborted until fixed.

---

## 📡 CRUD REST API Endpoints

Base URL: `http://localhost:3000`

| Operation | Method | Route | Description | Validation |
| :--- | :--- | :--- | :--- | :--- |
| **System Info** | `GET` | `/` | Root info & service status | None |
| **Health Check** | `GET` | `/v1/generic/health` | Uptime & memory usage | None |
| **Constants** | `GET` | `/v1/generic/constants` | Categories & status enums | None |
| **Create Item** | `POST` | `/v1/items` | Create a new item | `createItemSchema` |
| **Read All** | `GET` | `/v1/items` | List items with search/filter/pagination/sort | `queryItemsSchema` |
| **Read By ID** | `GET` | `/v1/items/:id` | Get item by ID | `itemIdParamSchema` |
| **Update Item** | `PUT` | `/v1/items/:id` | Update item attributes | `updateItemSchema` |
| **Delete Item** | `DELETE` | `/v1/items/:id` | Soft-delete item | `itemIdParamSchema` |

---

## 🛡 Error Handling & Validation

When validation fails (using Zod), the API returns a structured `400 Bad Request` with:
- An array of `issues` detailing each invalid field.
- A user-friendly `toastMessage` summarizing the first error.

Example:
```json
{
  "status": 400,
  "message": "Validation failed",
  "data": {
    "issues": [
      { "field": "name", "message": "Item name must be at least 2 characters", "code": "too_small" },
      { "field": "price", "message": "Price is required", "code": "invalid_type" }
    ]
  },
  "toastMessage": "Item name must be at least 2 characters"
}
```

---

## 📬 Postman Collection & Testing

A complete Postman Collection is provided in `postman_collection.json`.

### How to Import and Test:
1. Open **Postman**.
2. Click **Import** (top left).
3. Select or drag-and-drop `c:\Exelon\Hono\postman_collection.json`.
4. The imported collection contains:
   - **System & Health**: Root info, Health Check, Constants
   - **CRUD - Items**: Create, Read All, Read by ID, Update, Delete (with automated variable chaining saving `itemId`)
   - **Validation & Error Handling**: Missing fields test, invalid enum test, 404 nonexistent ID test, unknown route test.

---

## 🚀 Running the Project

### Install dependencies
```bash
npm install
```

### Start in development mode (hot-reloading)
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Start production build
```bash
npm start
```

### Linting & Formatting
```bash
npm run lint
npm run format
```
