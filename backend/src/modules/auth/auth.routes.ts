import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

// Endpoint for triggering welcome email after signup
router.post('/welcome-email', AuthController.sendWelcomeEmail);

// Endpoint for triggering verification success email after email confirmation
router.post('/verification-success-email', AuthController.sendVerificationSuccessEmail);

// Webhook for automated Supabase Auth triggers
router.post('/webhook', AuthController.handleAuthWebhook);

export const authRoutes = router;
export default authRoutes;
