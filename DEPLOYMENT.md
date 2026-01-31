# Deployment Guide

## Backend Deployment (Render)

### Current Status
✅ Backend URL: https://food-share-bwvx.onrender.com

### Build Configuration Fixed
The following changes were made to fix the build errors:

1. **Updated `package.json`**: Added `npm install` to the build command
2. **Updated `tsconfig.json`**: Added explicit type declarations for Node.js and Express
3. **Created `render.yaml`**: Render deployment configuration

### Environment Variables Required on Render

Set these in your Render dashboard:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Deployment Steps

1. Push the updated code to your repository
2. Render will automatically detect changes and rebuild
3. The build command will now be: `npm install && npm run build`
4. Start command: `npm start`

---

## Frontend Deployment (Vercel)

### Configuration Created

1. **`vercel.json`**: Configured Next.js output directory
2. **`next.config.ts`**: Added backend URL configuration
3. **`.env.production`**: Production environment variables

### Environment Variables Required on Vercel

Set these in your Vercel project settings:

```bash
NEXT_PUBLIC_API_URL=https://food-share-bwvx.onrender.com/api
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=generate-a-secure-random-string
```

### Deployment Steps

1. Connect your repository to Vercel
2. Vercel will auto-detect Next.js
3. Set the environment variables in Vercel dashboard
4. Deploy!

---

## CORS Configuration

Make sure your backend allows requests from your Vercel domain. In your backend's `server.ts`, update the CORS configuration:

```typescript
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://your-vercel-app.vercel.app'
    ],
    methods: ['GET', 'POST'],
  }
});
```

---

## Testing Deployment

### Backend Health Check
```bash
curl https://food-share-bwvx.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-31T..."
}
```

### Frontend
Visit your Vercel URL and test the following:
- Login/Register
- API connectivity
- Real-time features (Socket.IO)

---

## Troubleshooting

### Backend Build Fails
- Ensure all TypeScript dependencies are in `dependencies`, not just `devDependencies`
- Check Render logs for specific errors
- Verify MongoDB connection string is correct

### Frontend Build Fails
- Check that `outputDirectory` in `vercel.json` is set to `.next`
- Ensure all environment variables are set in Vercel
- Check build logs for missing dependencies

### CORS Errors
- Add your Vercel domain to backend's CORS whitelist
- Ensure `FRONTEND_URL` environment variable is set correctly

### Database Connection Issues
- Verify MongoDB Atlas allows connections from Render's IP addresses
- Check connection string format
- Ensure database user has proper permissions
