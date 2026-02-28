import express from 'express';
import {
  registerGuardian,
  loginGuardian,
  getGuardianProfile
} from '../controllers/authController.js';
import {
  validateGuardianRegistration,
  validateGuardianLogin
} from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validateGuardianRegistration, registerGuardian);

router.post('/login', validateGuardianLogin, loginGuardian);

router.get('/me', authenticate, getGuardianProfile);

export default router;
