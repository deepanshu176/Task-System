# TaskFlow - Task Management Application

A secure, modern task management system built with **Next.js 14**, **TypeScript**, **MongoDB Atlas**, and **Tailwind CSS**. Single unified application with integrated backend API routes and frontend.

## ?? Features

- ? User authentication with JWT
- ? Role-based access control (RBAC)
- ? Project management
- ? Task tracking with assignments
- ? Permission-based authorization
- ? Real-time dashboard statistics
- ? Responsive UI with Tailwind CSS
- ? Production-ready security
- ? Single deployment package for Railway

## ?? Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT with bcrypt

## ??? Project Structure

Everything is now in the **frontend** folder:
- rontend/src/app/api/ - All backend API routes (auth, users, projects, tasks, roles, permissions, dashboard)
- rontend/src/app/dashboard/ - Frontend pages
- rontend/src/components/ - Reusable React components
- rontend/src/lib/ - Utilities (db.ts, jwt-server.ts, auth-server.ts, validation.ts)

## ?? Quick Start

### 1. Install Dependencies
`ash
cd frontend
npm install
`

### 2. Configure Environment
Create rontend/.env.local:
`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
MONGODB_DATABASE=taskmanager
JWT_SECRET=your-32-character-secret-key-minimum
NODE_ENV=development
`

Get MongoDB URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### 3. Run Development Server
`ash
npm run dev
`

Access at: http://localhost:3000

## ?? Authentication Flow

1. Sign up at /signup
2. Login at /login
3. Redirects to /dashboard
4. API token stored in browser

## ?? Deploy on Railway

### One-Click Setup
1. Push to GitHub
2. Go to [Railway.app](https://railway.app)
3. Create new project
4. Connect GitHub repo
5. Select repository
6. Add environment variables:
   - MONGODB_URI - MongoDB Atlas connection
   - JWT_SECRET - 32+ character secret
   - MONGODB_DATABASE - taskmanager
   - NODE_ENV - production
7. Deploy!

The app runs from rontend folder with automatic Next.js production build.

## ?? API Endpoints

All endpoints use Authorization: Bearer <token> header

### Auth
- POST /api/auth/signup - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Current user info

### Resources
- GET /api/users - List users
- GET /api/projects - List projects
- POST /api/projects - Create project
- GET /api/tasks - List tasks
- POST /api/tasks - Create task
- GET /api/roles - List roles
- GET /api/permissions - List permissions
- GET /api/dashboard - Dashboard stats

## ?? Troubleshooting

**Signup fails?**
- Check MongoDB connection string
- Verify JWT_SECRET is 32+ characters
- Check browser console for errors

**API not responding?**
- Ensure dev server is running
- Check MongoDB Atlas connection

## ?? Files Removed
- ackend/ folder - No longer needed
- ercel.json - Deploying to Railway now

## ? Ready to Deploy!
Everything is optimized for easy Railway deployment. Just connect GitHub and go!
