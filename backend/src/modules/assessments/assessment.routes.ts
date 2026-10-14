import { Router } from 'express';
import { AssessmentController } from './assessment.controller';
import { requireAuth } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roles';
import { resolveStudentProfile } from '../../middleware/identity';
import { requireResourceOwner, requireVerifiedEmail } from '../../middleware/authorization';
import { validateBody, validateQuery } from '../../lib/validate';
import {
  listAssessmentsQuerySchema,
  createAssessmentSchema,
  autosaveAnswerSchema,
  submitAssessmentSchema,
} from './assessment.schema';

const router = Router();

router.use(requireAuth);
router.use(resolveStudentProfile);

router.get('/', validateQuery(listAssessmentsQuerySchema), AssessmentController.listAssessments);
router.post('/', requireAdmin, validateBody(createAssessmentSchema), AssessmentController.createAssessment);
router.get('/:id', AssessmentController.getAssessmentById);
router.post('/:id/start', requireVerifiedEmail, AssessmentController.startAttempt);
router.post(
  '/submissions/:submissionId/autosave',
  requireResourceOwner('submission', 'submissionId'),
  validateBody(autosaveAnswerSchema),
  AssessmentController.autosaveAnswer
);
router.get(
  '/submissions/:submissionId/resume',
  requireResourceOwner('submission', 'submissionId'),
  AssessmentController.resumeAttempt
);
router.post(
  '/submissions/:submissionId/submit',
  requireVerifiedEmail,
  requireResourceOwner('submission', 'submissionId'),
  validateBody(submitAssessmentSchema),
  AssessmentController.submitAttempt
);

export const assessmentRoutes = router;
