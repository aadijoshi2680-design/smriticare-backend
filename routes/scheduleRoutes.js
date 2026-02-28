import express from 'express';
import {
  createSchedule,
  getPatientSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule
} from '../controllers/scheduleController.js';
import { authenticate } from '../middleware/auth.js';
import { validateSchedule } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticate, validateSchedule, createSchedule);

router.get('/:patientId', authenticate, getPatientSchedules);

router.get('/details/:id', authenticate, getScheduleById);

router.put('/:id', authenticate, updateSchedule);

router.delete('/:id', authenticate, deleteSchedule);

export default router;
