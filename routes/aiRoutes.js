import express from 'express';
import { aiChat, getCareSuggestions } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', authenticate, aiChat);

router.get('/suggestions/:patientId', authenticate, getCareSuggestions);

export default router;
