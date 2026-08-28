import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import roleRoutes from './routes/role.routes.js';
import sessionRoutes from './routes/session.routes.js';
import userRoutes from './routes/user.routes.js';
import { requestPasswordReset, resetPassword } from './controllers/passwordReset.controller.js';

const app = express();

app.use(cors());
app.use(express.json());

// Base Auth Routes
app.use('/api/auth', authRoutes);

// Password Reset Endpoints
app.post('/api/auth/forgot-password', requestPasswordReset);
app.post('/api/auth/reset-password', resetPassword);

// Phase 2 Protected Service Routes
app.use('/api/rbac', roleRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);

export default app;