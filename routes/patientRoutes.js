import express from 'express';
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js';
import { authenticate } from '../middleware/auth.js';
import { validatePatient } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticate, validatePatient, createPatient);

router.get('/', authenticate, getAllPatients);

router.get('/:id', authenticate, getPatientById);

router.put('/:id', authenticate, updatePatient);

router.delete('/:id', authenticate, deletePatient);

export default router;
