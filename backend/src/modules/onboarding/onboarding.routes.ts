import { Router } from 'express';
import { OnboardingController } from './onboarding.controller';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../lib/validate';
import {
  saveDraftSchema,
  completeOnboardingSchema,
  completeSignupProfileSchema,
} from './onboarding.schema';

const router = Router();

router.get('/draft', requireAuth, OnboardingController.getDraft);
router.post(
  '/draft',
  requireAuth,
  validateBody(saveDraftSchema),
  OnboardingController.saveDraft
);
router.post(
  '/complete',
  requireAuth,
  validateBody(completeOnboardingSchema),
  OnboardingController.completeOnboarding
);
router.post(
  '/complete-profile',
  requireAuth,
  validateBody(completeSignupProfileSchema),
  OnboardingController.completeSignupProfile
);

export const onboardingRoutes = router;
