import express from 'express';
import {
  addEmergencyContact,
  getEmergencyContacts,
  updateEmergencyContact,
  deleteEmergencyContact
} from '../controllers/emergencyContactController.js';
import { authenticate } from '../middleware/auth.js';
import { validateEmergencyContact } from '../middleware/validation.js';

const router = express.Router();

router.post('/', authenticate, validateEmergencyContact, addEmergencyContact);

router.get('/:patientId', authenticate, getEmergencyContacts);

router.put('/:id', authenticate, updateEmergencyContact);

router.delete('/:id', authenticate, deleteEmergencyContact);

export default router;
