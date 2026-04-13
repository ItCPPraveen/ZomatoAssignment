# TaskFlow — Frontend Implementation

## 1. Overview

I have created TaskFlow project to manage tasks and projects where it allows users to register, login, create projects, assign tasks to projects and manage within those projects. I have implemented the Frontend alone and used MSW for mocking the API requests.
- **Framework**: React 18 with **Vite**.
- **Language**: TypeScript for strict typing and improved Developer Experience.
- **Data Fetching/Caching**: `@tanstack/react-query`.
- **Components & Styling**: Component architecture by **MUI (Material-UI)** with **styled-components**.
- **Forms**: Managed using `react-hook-form`.
- **Mocking**: Full local request interception spanning all expected endpoints provided via **MSW (Mock Service Worker)**.

## 2. Architecture Decisions
- **Feature-Sliced Design**: The `/src` architecture is organized by domains (`/features/auth`, `/features/projects`, `/features/tasks`) rather than blindly separating by file type. This natively scales better.
- **React Query**: TanStack Query handles automatically at the component level. Iteration gets so much faster.
- **MUI**: MUI is highly used .It allows rapid construction of premium layouts natively saving extensive hours.
- **styled-components**: Used for styling components.


## 3. Running Locally
Given I have fulfilled the **Frontend-only** specification natively bypassing Docker (since no Go / PostgreSQL instance is actively required for review):

```bash
# Clone the repository
git clone https://github.com/your-name/taskflow
cd taskflow/frontend

# Install standard dependencies
npm install

# Initialize the mock service worker into the local public registry 
# (Critical for API mocking over localhost!)
npx msw init public/ --save

# Boot up the local developmental server
npm run dev
# The application will natively open at http://localhost:5173
```

## 4. Running Migrations
Because this relies on the Mock API specification outlined in Appendix A, there is no PostgreSQL database physically attached. Standard SQL migrations are **Not Applicable**. Instead, `MSW` intercepts API requests to the nonexistent `http://localhost:4000` namespace and handles standard CRUD logic inside an isolated.

## 5. Test Credentials
A heavily mocked active "seed" profile is instantly loaded into MSW memory upon server initialization to allow frictionless log in.
```text
Email:    test@example.com
Password: password123
```
*Note: Any additional Registration completed within the local UI accurately tracks and allows immediate login across individual sessions.*

### Authentication
- `POST /auth/register` — expects `{ name, email, password }`
- `POST /auth/login` — expects `{ email, password }`. Returns a hardcoded mock JWT with basic user metadata.

### Projects
- `GET /projects` — returns all projects from MSW state.
- `POST /projects` — creates a new project tied to the current `owner_id`.
- `GET /projects/:id` — fetches a single project and includes its tasks.
- `PATCH /projects/:id` — updates the fields you pass in.
- `DELETE /projects/:id` — removes the project and its tasks. Returns 204.

### Tasks
- `GET /projects/:id/tasks` — supports `?status=` query param, filtered in memory.
- `POST /projects/:id/tasks` — creates a task under the given project.
- `PATCH /tasks/:id` — applies partial updates to a task.
- `DELETE /tasks/:id` — deletes the task.