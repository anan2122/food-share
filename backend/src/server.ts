import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import connectDB from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import donationRoutes from './routes/donation.routes';
import pickupRoutes from './routes/pickup.routes';
import notificationRoutes from './routes/notification.routes';
import analyticsRoutes from './routes/analytics.routes';
import impactRoutes from './routes/impact.routes';

const app: Application = express();
const httpServer = createServer(app);

// Allowed origins for CORS
const allowedOrigins: string[] = [
  'http://localhost:3000',
  process.env.FRONTEND_URL || '',
].filter((origin): origin is string => Boolean(origin));

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors("*" as cors.CorsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/impact', impactRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join-pickup', (pickupId: string) => {
    socket.join(`pickup-${pickupId}`);
    console.log(`Client joined pickup room: ${pickupId}`);
  });

  socket.on('location-update', (data: { pickupId: string; location: { lat: number; lng: number } }) => {
    io.to(`pickup-${data.pickupId}`).emit('volunteer-location', data.location);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📡 Socket.IO ready for connections`);
});

export { io };
export default app;
