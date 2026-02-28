import express from 'express';
import {
  getPatientByQRCode,
  getQRCodeForPatient,
  regenerateQRCode
} from '../controllers/qrController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:qrCodeId', getPatientByQRCode);

router.get('/patient/:patientId', authenticate, getQRCodeForPatient);

router.post('/regenerate/:patientId', authenticate, regenerateQRCode);

export default router;
