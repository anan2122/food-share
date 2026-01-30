# FoodShare - Food Redistribution & Waste Reduction Platform

A comprehensive platform connecting food donors with NGOs and volunteers to reduce food waste and fight hunger.

## 🏗️ Architecture

This project uses a **separate frontend/backend architecture**:

```
food-redistribution/
├── frontend/           # Next.js 16 frontend application
│   ├── src/
│   │   ├── app/       # Next.js App Router pages
│   │   ├── components/ # React components
│   │   ├── contexts/  # React contexts (Auth)
│   │   └── lib/       # Utilities & API client
│   └── package.json
├── backend/            # Express.js API server
│   ├── src/
│   │   ├── config/    # Database configuration
│   │   ├── middleware/ # Auth, error handling
│   │   ├── models/    # Mongoose models
│   │   ├── routes/    # API routes
│   │   └── server.ts  # Entry point
│   └── package.json
└── package.json        # Root package with workspace scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd food-redistribution
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Configure environment variables:

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/food-redistribution
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the Application

**Development mode (both servers):**
```bash
npm run dev
```

**Or run separately:**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 👥 User Roles

| Role | Description |
|------|-------------|
| **Admin** | Full platform control, user verification, analytics |
| **Donor** | Restaurants, hotels, caterers - report surplus food |
| **NGO** | Shelters, community kitchens - claim food donations |
| **Volunteer** | Pickup and delivery coordination |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Donations
- `GET /api/donations` - List donations
- `POST /api/donations` - Create donation
- `GET /api/donations/:id` - Get donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation
- `POST /api/donations/:id/claim` - Claim donation (NGO)
- `PUT /api/donations/:id/verify` - Verify donation (Admin)

### Users
- `GET /api/users` - List users (Admin)
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)
- `PUT /api/users/:id/verify` - Verify user (Admin)

### Pickups
- `GET /api/pickups` - List pickups
- `POST /api/pickups` - Create pickup assignment
- `PUT /api/pickups/:id/status` - Update status
- `PUT /api/pickups/:id/complete` - Complete pickup

### Analytics & Impact
- `GET /api/analytics` - Platform analytics (Admin)
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/impact` - User impact metrics
- `GET /api/impact/leaderboard` - Leaderboards

### Notifications
- `GET /api/notifications` - User notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## 🛠️ Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide Icons
- Recharts (analytics)
- Socket.io Client (real-time)
- Zustand (state management)

### Backend
- Node.js / Express.js
- TypeScript
- MongoDB / Mongoose
- JWT Authentication
- Socket.io (real-time)
- Express Validator

## 📄 License

MIT
