# Lumina | High-Performance Work OS

A secure, enterprise-grade task management system built with **Next.js 14**, **TypeScript**, **MongoDB Atlas**, and **Upstash Redis**. Engineered for high-velocity teams with a focus on extreme performance and scalability.

## 🚀 Performance Features

- ⚡ **Advanced Connection Pooling**: Robust MongoDB singleton with optimized pooling for Atlas M0.
- 🏎️ **Multi-Layer Caching**: High-speed caching using Upstash Redis with a secondary in-memory fallback for ultra-low latency.
- 📡 **Parallel API Architecture**: Refactored backend routes using `Promise.all` to eliminate waterfall bottlenecks.
- 🎨 **Skeleton Loading**: Intelligent `loading.tsx` and SWR deduping for an instant, "premium" feel.
- 🔐 **Optimized Auth Guard**: Background token verification and session persistence for seamless transitions.
- 📉 **Scalable Pagination**: Backend-enforced limits and optimized aggregation pipelines for large datasets.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand (with Persistence)
- **Data Fetching**: SWR (Optimized for Deduping & Caching)
- **Database**: MongoDB Atlas (Driver-based for Speed)
- **Caching**: Upstash Redis (Serverless)
- **Authentication**: JWT with High-Performance verification layers

## 📁 Project Structure

Everything is located in the **frontend** directory for a unified deployment:
- `src/app/api/`: Optimized backend routes with caching layers.
- `src/app/dashboard/`: High-performance frontend pages with skeleton states.
- `src/components/`: Modular UI components and the Optimized `AuthGuard`.
- `src/lib/`: Core logic (Unified `db.ts`, Caching `redis.ts`, Auth `auth-server.ts`).

## ⚙️ Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create `frontend/.env.local`:
```env
# Database
MONGODB_URI=your-mongodb-atlas-uri
MONGODB_DATABASE=taskmanager

# Caching (Optional but Recommended)
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Auth
JWT_SECRET=your-32-character-secret-key-minimum
NODE_ENV=development
```

### 3. Run Development Server
```bash
npm run dev
```
Access at: http://localhost:3000

## 🚢 Deploy on Railway

1. **Push to GitHub**: Ensure your `frontend` directory is at the root or correctly configured in `railway.toml`.
2. **Connect to Railway**: Select your repository and connect.
3. **Set Variables**: Add `MONGODB_URI`, `JWT_SECRET`, and `UPSTASH_REDIS_REST_URL`.
4. **Deploy**: Railway will automatically detect the Next.js project and deploy with high availability.

## 📡 API Endpoints

All endpoints are optimized for speed and use `Authorization: Bearer <token>`.

### Auth & User
- `POST /api/auth/login`: Secure login with lockout protection.
- `GET /api/auth/me`: Lightweight user session retrieval.
- `GET /api/users`: Optimized user listing with pagination support.

### Workspace & Productivity
- `GET /api/dashboard`: Aggregated stats with 30s Redis caching.
- `GET /api/projects`: Project management with auto-invalidating cache.
- `GET /api/tasks`: Task tracking with project-specific caching.

## 🛡️ Production Readiness
- **Security Headers**: CSP, XSS protection, and frame denial configured in `next.config.mjs`.
- **Database Security**: Automated index initialization for high-performance queries.
- **Graceful Fallbacks**: The application remains fully functional even if the Redis cache layer is unavailable.

---
**Ready for Deployment!** This version is fine-tuned for production-grade stability and high-concurrency environments.
