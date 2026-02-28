import express from 'express';
import {
  updateLocation,
  getLatestLocation,
  getLocationHistory
} from '../controllers/locationController.js';
import { authenticate } from '../middleware/auth.js';
import { validateLocation } from '../middleware/validation.js';

const router = express.Router();

router.post('/update', authenticate, validateLocation, updateLocation);

router.get('/:patientId', authenticate, getLatestLocation);

router.get('/history/:patientId', authenticate, getLocationHistory);

export default router;
