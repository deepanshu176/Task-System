# Deployment Guide

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT SETUP                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (React/Next.js)          Backend (Node/Express)   │
│  └─ Railway                        └─ Vercel/Railway        │
│     │                                  │                     │
│     └─> https://yourdomain.com     └─> https://api...      │
│                                        │                     │
│                                     MongoDB Atlas            │
│                                        │                     │
│                                   Data Storage               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Pre-Deployment Checklist

- [ ] All environment variables are set correctly
- [ ] MongoDB Atlas cluster is created
- [ ] IP whitelist is configured in MongoDB Atlas
- [ ] JWT_SECRET is at least 32 characters
- [ ] FRONTEND_URL is set to your domain
- [ ] All tests pass locally
- [ ] No console.log() statements in production code
- [ ] .env file is in .gitignore
- [ ] SSL/TLS certificate is valid
- [ ] CORS origins are correctly configured

## 🚂 Railway Deployment (Frontend & Backend)

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign in or create account
3. Click "New Project"
4. Connect your GitHub repository

### Step 2: Frontend Deployment (Railway)

1. In Railway project, click "Add Service" > "GitHub Repo"
2. Select the repository
3. Choose `frontend` directory as root
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   NODE_ENV=production
   ```
5. Deploy

### Step 3: Backend Deployment (Vercel)

#### Option A: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." > "Project"
3. Import your repository
4. Set root directory to `backend`
5. Add environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://...`
   - `JWT_SECRET=your_secret`
   - `FRONTEND_URL=https://yourdomain.com`
6. Deploy

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to backend
cd backend

# Deploy
vercel --prod
```

### Step 4: MongoDB Atlas Setup

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user with strong password
4. Add IP addresses to whitelist:
   - For Railway: Add `0.0.0.0/0` or specific IP
   - For Vercel: Add Vercel's IP range
5. Get connection string from "Connect" > "Connect your application"
6. Set `MONGODB_URI` in deployment platform

### Step 5: Configure Custom Domain

#### Railway Frontend:
1. Go to Service Settings > Custom Domain
2. Enter your domain
3. Add CNAME record to your DNS provider
4. Wait for verification (5-10 minutes)

#### Vercel Backend:
1. Go to Deployments > Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for verification

#### Update CORS:
Update `FRONTEND_URL` on backend to your domain:
```
FRONTEND_URL=https://yourdomain.com
```

## 🔐 Security Configuration

### MongoDB Atlas Security

1. **Create Admin User:**
   ```
   Username: admin_user
   Password: [strong password]
   Roles: Atlas admin
   ```

2. **Create App User:**
   ```
   Username: app_user
   Password: [strong password]
   Roles: readWriteAnyDatabase
   Database: taskmanager
   ```

3. **IP Whitelist:**
   - For development: `YOUR_IP/32`
   - For production: Add Vercel & Railway IPs
   - Or use environment IP detection

4. **Encryption:**
   - Enable: Encryption at Rest (HTTPS only)
   - Enable: TLS 1.2+ for connections

### Environment Variables Setup

**Railway Environment Variables:**

Frontend:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NODE_ENV=production
```

Backend:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://app_user:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=taskmanager
JWT_SECRET=your_32_char_secret_key
FRONTEND_URL=https://yourdomain.com
PORT=5000
```

## 🧪 Testing Deployment

### 1. Health Check

```bash
# Backend health
curl https://api.yourdomain.com/health

# Response:
# {"status":"ok","timestamp":"2024-01-15T..."}
```

### 2. API Testing

```bash
# Test signup
curl -X POST https://api.yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Test login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. CORS Test

```bash
# From browser console
fetch('https://api.yourdomain.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'SecurePass123!'
  })
})
.then(r => r.json())
.then(console.log)
```

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend

1. Check CORS configuration
   ```
   // app.ts - verify CORS_ORIGIN includes your frontend URL
   ```

2. Check API URL in frontend
   ```
   // Check .env.local
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   ```

3. Test endpoint directly
   ```bash
   curl -v https://api.yourdomain.com/api/health
   ```

### MongoDB Connection Fails

1. Verify connection string:
   ```bash
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net/taskmanager"
   ```

2. Check IP whitelist in MongoDB Atlas

3. Verify username/password characters (URL encode special chars)

### Rate Limiting Issues

If getting 429 errors:

1. Check rate limit settings in `rateLimiter.middleware.ts`
2. Ensure rate limiting is disabled in development:
   ```typescript
   skip: (req) => process.env.NODE_ENV === 'development',
   ```

### JWT Secret Errors

```bash
# Generate a new JWT_SECRET
openssl rand -base64 32

# Make sure it's at least 32 characters
# Update in all deployment environments
```

## 📈 Monitoring & Logs

### Railway Logs

1. Go to Service > Logs
2. Monitor real-time logs
3. Set up alerts for errors

### Vercel Logs

1. Go to Deployments > Runtime Logs
2. View build and function logs
3. Monitor performance

### MongoDB Logs

1. Go to Atlas > Activity > Log Files
2. Monitor database queries
3. Check connection attempts

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

**Railway & Vercel automatically deploy on:**
- Push to main branch
- Merge pull request
- Manual redeploy from dashboard

### Rollback

**Revert to previous deployment:**

Railway:
1. Go to Service > Deployments
2. Click previous deployment
3. Click "Rollback to this deployment"

Vercel:
1. Go to Deployments
2. Click previous deployment
3. Click "Rollback"

## 📞 Support & Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Express.js Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment/vercel)
