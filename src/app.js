import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import roleRoutes from './routes/role.routes.js';
import sessionRoutes from './routes/session.routes.js';
import userRoutes from './routes/user.routes.js';
import auditRoutes from './routes/audit.routes.js';
import { globalLimiter, authLimiter } from './middleware/rateLimiter.middleware.js';
import { requestPasswordReset, resetPassword } from './controllers/passwordReset.controller.js';

const app = express();

// Security Enhancements
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Global Rate Limiting
app.use(globalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'HEALTHY', timestamp: new Date() });
});

// Authentication Routes with Brute-Force Rate Limiting
app.use('/api/auth', authLimiter, authRoutes);
app.post('/api/auth/forgot-password', authLimiter, requestPasswordReset);
app.post('/api/auth/reset-password', authLimiter, resetPassword);

// RBAC, Sessions, User Management, and Security Audits
app.use('/api/rbac', roleRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);

export default app;