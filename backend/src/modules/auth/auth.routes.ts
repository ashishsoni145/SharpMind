import { Router } from 'express';
import { AuthController } from './auth.controller';
import { optionalAuth } from '../../middleware/auth';
import { validateBody } from '../../lib/validate';
import { emailAvailabilitySchema } from './auth.schema';

const router = Router();

router.post('/email-availability', validateBody(emailAvailabilitySchema), AuthController.checkEmailAvailability);

// Endpoint for requesting a signup confirmation OTP (rate limited)
router.post('/request-otp', AuthController.requestOtp);

// Endpoint for triggering welcome email after signup
router.post('/welcome-email', AuthController.sendWelcomeEmail);

// Endpoint for triggering verification success email after email confirmation
router.post('/verification-success-email', AuthController.sendVerificationSuccessEmail);

// Webhook for automated Supabase Auth triggers
router.post('/webhook', AuthController.handleAuthWebhook);

// Protected retention cleanup trigger (secret header or admin authenticated)
router.post('/retention-cleanup', optionalAuth, AuthController.triggerRetentionCleanup);

export const authRoutes = router;
export default authRoutes;
