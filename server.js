import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import emergencyContactRoutes from './routes/emergencyContactRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SmritiCare API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      location: '/api/location',
      schedules: '/api/schedules',
      qr: '/api/qr',
      emergencyContacts: '/api/emergency-contacts',
      ai: '/api/ai'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/emergency-contacts', emergencyContactRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║          SmritiCare API Server Running               ║
  ║                                                       ║
  ║  Environment: ${config.nodeEnv.padEnd(38)} ║
  ║  Port: ${PORT.toString().padEnd(44)} ║
  ║  URL: http://localhost:${PORT.toString().padEnd(31)} ║
  ║                                                       ║
  ║  Health Check: http://localhost:${PORT}/health${' '.padEnd(15)} ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
