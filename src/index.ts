import express, { Application } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import { ResponseHelper } from './utils/response';

// Import routes
import userRoutes from './routes/user.routes';
import taskRoutes from './modules/employee-task-manager/routes/task.routes';
import taskMasterRoutes from './modules/employee-task-manager/routes/task-master.routes';
import taskInstanceRoutes from './modules/employee-task-manager/routes/task-instance.routes';
import plantRoutes from './modules/shared/routes/plant.routes';
import appSettingsRoutes from './modules/shared/routes/app-settings.routes';
import productionRoutes from './modules/pms/routes/production.routes';
import employeeRoutes from './modules/human-resource/routes/employee.routes';
import maintenanceRoutes from './modules/maintenance/routes/maintenance.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
// Cloud Run sets PORT automatically, default to 8080 for Cloud Run, 3000 for local dev
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 8080 : 3000);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/employee-task-manager/tasks', taskRoutes);
app.use('/api/v1/employee-task-manager/task-masters', taskMasterRoutes);
app.use('/api/v1/employee-task-manager/task-instances', taskInstanceRoutes);
app.use('/api/v1/plants', plantRoutes);
app.use('/api/v1/app-settings', appSettingsRoutes);
app.use('/api/v1/pms/productions', productionRoutes);
app.use('/api/v1/human-resource/employees', employeeRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);

// Catch-all handler for unmatched API routes
app.use('/api/*', (req, res) => {
  logger.warn(`Unmatched API route: ${req.method} ${req.path}`);
  ResponseHelper.error(res, 'NOT_FOUND', `API route not found: ${req.method} ${req.path}`, 404);
});

// SPA fallback: serve index.html for all non-API GET routes
// This allows React Router to handle client-side routing
// Must be before error handler but after all API routes
app.get('*', (req, res, next) => {
  // Only serve index.html for GET requests that aren't API routes or static files
  if (!req.path.startsWith('/api') && !req.path.startsWith('/assets')) {
    const indexPath = path.join(__dirname, '../public/index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        logger.error('Error sending index.html:', err);
        next(err);
      }
    });
  } else {
    next();
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
