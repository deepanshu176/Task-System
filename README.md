# Lumina - Task Management Work OS

Lumina is a task and project management dashboard built with Next.js 14, TypeScript, Tailwind CSS, MongoDB, JWT authentication, SWR, and Zustand.

The app includes authentication, role-based admin access, project management, task Kanban boards, team management, and project-specific analytics.

## Admin Login

Use this admin account after running the project:

```text
Email: admin@lumina.local
Password: Admin@123
```

## Tech Stack

- Next.js 14 with App Router
- React 18
- TypeScript
- Tailwind CSS
- MongoDB Atlas
- JWT authentication
- Zustand for persisted auth state
- SWR for client data fetching
- Local JSON database fallback for development

## Project Structure

```text
task_management/
  src/app/                 Next.js app routes and API routes
  src/app/api/             Backend API endpoints
  src/app/dashboard/       Dashboard, projects, tasks, team, analytics pages
  src/components/          Shared UI and layout components
  src/lib/                 Database, auth, JWT, Redis/cache utilities
  src/store/               Zustand auth store
```

## Setup

Install dependencies:

```bash
cd task_management
npm install
```

Create `task_management/.env.local`:

```env
DATABASE_MODE=mongodb
MONGODB_URI=your-mongodb-atlas-connection-string
MONGODB_DATABASE=taskmanager
JWT_SECRET=your-32-character-secret-key
NODE_ENV=development
```

For offline/local development, use:

```env
DATABASE_MODE=local
JWT_SECRET=your-32-character-secret-key
NODE_ENV=development
```

Local mode stores data in:

```text
task_management/.data/local-db.json
```

## Run The Project

```bash
cd task_management
npm run dev
```

Open:

```text
http://localhost:3000
```

## Main Features

- User signup and login
- Admin account support
- Dashboard overview
- Project CRUD
- Task Kanban board
- Team/member management
- Project-specific analytics
- Analytics filters for project and date range
- Analytics JSON export
- MongoDB mode and local JSON database mode

## API Endpoints

Authentication:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/create-admin`

Workspace:

- `GET /api/dashboard`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/users`
- `GET /api/roles`
- `GET /api/permissions`

## Useful Commands

Run development server:

```bash
npm run dev
```

Type-check:

```bash
npx tsc --noEmit
```

Lint:

```bash
npm run lint
```

## Notes

- MongoDB Atlas must allow your current IP address in Network Access.
- If MongoDB is slow on the first request, wait for the first connection to warm up.
- `DATABASE_MODE=local` is useful for demos when internet or Atlas access is unavailable.
- `.env.local` and `.data/` are ignored by Git.
