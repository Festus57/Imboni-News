import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsOptions } from './config/cors.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { generalLimiter } from './middleware/rateLimitMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports
import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import adRoutes from './routes/adRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import newsTipRoutes from './routes/newsTipRoutes.js';

const app = express();
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

// Security & middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      connectSrc: ["'self'", 'https:', ...(process.env.NODE_ENV === 'development' ? ['ws:', 'http://localhost:*'] : [])],
      mediaSrc: ["'self'", 'https:', 'blob:'],
      frameSrc: ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://player.vimeo.com'],
    },
  },
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(mongoSanitize());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Health check
app.get('/api/health', (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'ok' : 'degraded',
    database: databaseReady ? 'connected' : 'disconnected',
    message: databaseReady ? 'Imboni News API is ready.' : 'Database connection is unavailable.',
    timestamp: new Date().toISOString(),
  });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Apply a baseline request limit to all API endpoints.
app.use('/api', generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/newstips', newsTipRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
