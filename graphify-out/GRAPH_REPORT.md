# Graph Report - mind  (2026-10-29)

## Corpus Check
- 524 files · ~423,967 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 165 file(s) not represented in the graph (top: .css 104, (none) 59, .example 2)

## Summary
- 3323 nodes · 7056 edges · 196 communities (153 shown, 43 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 91 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `addbd4d7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Icon
- student-model.service.ts
- ref_next
- notification.service.ts
- LocalAuthAdapter
- assessment.service.ts
- db/client.ts
- TutorSession
- useAuth
- UnauthorizedError
- devDependencies
- material.service.ts
- backend/src/packages/types/onboarding.ts
- material.service.ts
- desktop/package.json
- web/src/packages/api-client/index.ts
- BadRequestError
- StudentProfile
- focus.service.ts
- zod
- model-router.ts
- backend/src/packages/types/assessment.ts
- signup/page.tsx
- graph.routes.ts
- SectionHeading
- landing/src/packages/types/student-model.ts
- src/student-model.ts
- web/src/packages/types/student-model.ts
- landing/package.json
- curriculum.routes.ts
- types.ts
- web/src/app/layout.tsx
- Button
- landing/src/app/page.tsx
- useAuth
- api-client/src/index.ts
- backend/src/packages/types/assessment.ts
- AuthResult
- tutor.controller.ts
- backend/src/packages/types/index.ts
- TopicDetailView.tsx
- local-settings-adapter.ts
- Canonical Relational Persistence and RLS Security Model on Supabase
- json
- classroom/page.tsx
- EmailService
- landing/package.json
- mistake.service.ts
- onboarding.service.ts
- web/src/components/ui/Button.tsx
- web/src/app/contact/page.tsx
- static-curriculum-adapter.ts
- assessment.service.ts
- backend/src/packages/types/curriculum.ts
- 20260916000001_initial_academic_os_schema.sql
- landing/src/app/contact/page.tsx
- landing/src/packages/types/assessment.ts
- AssessmentController
- src/assessment.ts
- src/curriculum.ts
- with
- AiResponse
- readiness.service.ts
- question-gen.agent.ts
- AssessmentController
- diagnostic.service.ts
- backend/package.json
- landing/src/packages/types/phase7.ts
- web/src/packages/types/tutor.ts
- student-model.service.ts
- UserSettings
- public.profiles
- public.questions
- planner.service.ts
- student-model.rules.ts
- web/src/packages/types/phase7.ts
- compilerOptions
- landing/src/packages/types/tutor.ts
- backend/src/packages/types/auth.ts
- getSupabaseClient
- backend/src/packages/types/index.ts
- tutor/page.tsx
- library/page.tsx
- main.cjs
- backend/src/packages/types/phase7.ts
- search.routes.ts
- api-client/package.json
- compilerOptions
- security.cjs
- Toast/index.ts
- supabase-auth-adapter.ts
- backend/src/packages/types/student-model.ts
- landing/src/components/ui/SectionHeading.tsx
- Tri-Project Monorepo
- dev.cjs
- curriculum.routes.ts
- 20260918000002_curriculum_knowledge_graph_and_pyq.sql
- landing/src/packages/types/onboarding.ts
- types/package.json
- src/onboarding.ts
- build-web.cjs
- backend/src/packages/types/auth.ts
- landing/src/packages/types/auth.ts
- landing/src/packages/types/index.ts
- src/auth.ts
- types/src/index.ts
- AiResponse
- getSupabaseClient
- security.cjs
- analytics.service.ts
- public.tutor_sessions
- 20260918000001_file_subsystem_and_search.sql
- smoke.cjs
- landing/src/app/layout.tsx
- SharpMind Backlog & Future Phase Milestone Register
- web/public/manifest.json
- backend/src/packages/types/api.ts
- AnalyticsService
- .completeSession
- signup/page.tsx
- dependencies
- web/src/packages/types/index.ts
- Welcome and Account Verification Email Template
- AuthResult
- backend/src/packages/types/graph.ts
- landing/src/packages/types/graph.ts
- src/graph.ts
- IconName
- ToastContext.tsx
- SharpMind for Windows Desktop Client
- NotFoundError
- web/src/packages/types/onboarding.ts
- backend/src/packages/types/api.ts
- backend/src/packages/types/files.ts
- backend/src/packages/types/files.ts
- vercel.json
- 20261014000002_otp_rate_limiting.sql
- Evidence, Provenance, and Student Privacy
- make-icon.cjs
- SharpMind Vercel Deployability Rules
- landing/src/components/ui/Icon.tsx
- src/forms.ts
- backend/package.json
- ADR 0012: Persistent Workspace Navigation and App Entry
- preload.cjs
- Next Checkpoint
- desktop/package.json
- scripts
- express.d.ts
- Study Material Intelligence, Visual Learning, Focus, Analytics, and Notifications
- Three Project Vercel Deployment Topology
- SharpMind Project Map
- Windows Desktop Client
- 512px Landing Page Icon
- App icon with a layered violet and blue diamond on a dark rounded-square background
- SharpMind App Icon
- Minimum Profile Setup Gate
- OTP and Availability Feedback
- Incremental Tailwind Adoption
- Persistent Workspace Navigation and App Entry
- Required Profile Flow and Backend Compatibility
- web/src/packages/types/index.ts
- 192px App Icon
- SharpMind System Architecture
- SharpMind Changelog
- Legacy Onboarding UI Retirement
- Monochrome Whole-App UI Refresh
- SharpMind Development Rules
- SharpMind Backlog
- Completed Work
- SharpMind Project Context
- SharpMind AI Academic OS
- SharpMind Risks
- Repository Status
- SharpMind TODO
- AcademicSettingsForm.tsx
- seed_authentic_curriculum_and_pyqs.ts
- scripts
- ActionToast.tsx
- FailingProvider
- compression
- @types/compression@^1.7.5

## God Nodes (most connected - your core abstractions)
1. `BadRequestError` - 110 edges
2. `Icon()` - 97 edges
3. `sendSuccess()` - 57 edges
4. `express` - 55 edges
5. `NotFoundError` - 53 edges
6. `Button()` - 48 edges
7. `UnauthorizedError` - 46 edges
8. `getSupabaseClient()` - 44 edges
9. `supabase` - 38 edges
10. `useToast()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `idx_curriculum_nodes_fts` --indexes--> `public.curriculum_nodes`  [EXTRACTED]
  infra/supabase/migrations/20260918000001_file_subsystem_and_search.sql → infra/supabase/migrations/20260916000001_initial_academic_os_schema.sql
- `idx_questions_fts` --indexes--> `public.questions`  [EXTRACTED]
  infra/supabase/migrations/20260918000001_file_subsystem_and_search.sql → infra/supabase/migrations/20260916000001_initial_academic_os_schema.sql
- `idx_materials_fts` --indexes--> `public.materials`  [EXTRACTED]
  infra/supabase/migrations/20260918000001_file_subsystem_and_search.sql → infra/supabase/migrations/20260916000001_initial_academic_os_schema.sql
- `PdfViewerModalProps` --references--> `CurriculumMaterial`  [EXTRACTED]
  web/src/components/library/PdfViewerModal.tsx → web/src/packages/types/curriculum.ts
- `AcademicSettingsFormProps` --references--> `AcademicSettings`  [EXTRACTED]
  web/src/components/settings/AcademicSettingsForm.tsx → web/src/packages/types/settings.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Adaptive Academic Learning Loop** — docs_architecture_adr_0004_academic_knowledge_graph_and_curriculum_engine_knowledge_graph_dag, docs_architecture_adr_0005_student_model_and_intelligence_layer_observed_evidence_vs_inferred_state, docs_architecture_adr_0006_assessment_engine_mistakes_and_exam_readiness_secure_deterministic_assessment, docs_architecture_adr_0005_student_model_and_intelligence_layer_adaptive_planner_and_revision [EXTRACTED 1.00]
- **SharpMind Monorepo Deployment Projects** — readme_public_landing, readme_student_web_application, readme_backend_api [EXTRACTED 1.00]
- **SharpMind Adaptive Learning Loop** — ai_project_context_adaptive_academic_os, ai_project_context_student_model, ai_architecture_supabase_postgresql [EXTRACTED 1.00]

## Communities (196 total, 43 thin omitted)

### Community 0 - "Icon"
Cohesion: 0.08
Nodes (42): ProfileForm(), ProfileFormProps, SecuritySettingsForm(), SecuritySettingsFormProps, SubscriptionStatusCard(), Icon(), IconProps, BohrAtomSimulation() (+34 more)

### Community 1 - "student-model.service.ts"
Cohesion: 0.12
Nodes (15): StudentModelController, GetStatesQueryInput, getStatesQuerySchema, nodeIdParamSchema, RecalculateInput, recalculateSchema, RecordEvidenceInput, recordEvidenceSchema (+7 more)

### Community 2 - "ref_next"
Cohesion: 0.05
Nodes (10): metadata, metadata, dynamic, dynamic, metadata, metadata, metadata, dynamic (+2 more)

### Community 3 - "notification.service.ts"
Cohesion: 0.12
Nodes (13): NotificationController, NotificationRules, CreateNotificationInput, createNotificationSchema, ListNotificationsQueryInput, listNotificationsQuerySchema, notificationTypeSchema, UpdateNotificationPreferencesInput (+5 more)

### Community 5 - "assessment.service.ts"
Cohesion: 0.10
Nodes (26): DownloadPage(), metadata, platforms, featureCategories, FeaturesPage(), metadata, GetStartedPage(), metadata (+18 more)

### Community 6 - "db/client.ts"
Cohesion: 0.11
Nodes (16): config, supabase, EmailSendResult, VerificationSuccessEmailParams, WelcomeEmailParams, logger, OtpRateLimitCheckResult, RetentionCleanupOptions (+8 more)

### Community 7 - "TutorSession"
Cohesion: 0.10
Nodes (24): TutorMessageThreadProps, TutorModeSelectorProps, TutorSessionSidebarProps, createTutorAdapter(), tutorAdapter, LocalAITutorAdapter, SupabaseAITutorAdapter, TutorAdapter (+16 more)

### Community 8 - "useAuth"
Cohesion: 0.08
Nodes (30): AppLayout(), WorkspaceLoading(), DashboardBacklogItem, DashboardRevisionItem, DashboardTask, SUBJECT_CATALOG, WorkspaceDashboard(), BOARD_OPTIONS (+22 more)

### Community 9 - "UnauthorizedError"
Cohesion: 0.10
Nodes (14): AppError, ConflictError, InternalError, ValidationError, UserController, router, userRoutes, UpdateProfileInput (+6 more)

### Community 10 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, pino-pretty@^13.0.0, supertest@^7.0.0, tsx@^4.19.3, @types/cors@^2.8.17, @types/express@^4.17.21, @types/supertest@^6.0.2, typescript@^5.7.0 (+6 more)

### Community 11 - "material.service.ts"
Cohesion: 0.08
Nodes (34): app, createApp(), sendError(), errorHandler(), notFoundHandler(), httpLogger, extractToken(), optionalAuth() (+26 more)

### Community 12 - "backend/src/packages/types/onboarding.ts"
Cohesion: 0.06
Nodes (26): destDir, fs, path, srcDir, nextConfig, fs, path, path (+18 more)

### Community 13 - "material.service.ts"
Cohesion: 0.17
Nodes (11): MaterialController, CreateMaterialInput, createMaterialSchema, ListMaterialsQueryInput, listMaterialsQuerySchema, ProcessMaterialInput, processMaterialSchema, MaterialService (+3 more)

### Community 14 - "desktop/package.json"
Cohesion: 0.08
Nodes (24): build, appId, artifactName, directories, extraResources, files, msi, nsis (+16 more)

### Community 15 - "web/src/packages/api-client/index.ts"
Cohesion: 0.05
Nodes (42): ApiClientConfig, ApiClientError, ApiResponse, DbHealthResponse, HealthCheckResponse, SearchResponse, SearchResultItem, ActiveTestSession (+34 more)

### Community 16 - "BadRequestError"
Cohesion: 0.12
Nodes (22): RevisionController, computeRetentionDecay(), computeRevisionUrgency(), RevisionUrgencyInput, selectRevisionType(), SM2_INITIAL_EASE, SM2_INITIAL_INTERVAL, SM2_MAX_EASE (+14 more)

### Community 17 - "StudentProfile"
Cohesion: 0.18
Nodes (7): TopBarProps, createStudentProfileAdapter(), LocalStudentProfileAdapter, StudentProfileAdapter, SupabaseStudentProfileAdapter, OnboardingDraft, StudentProfile

### Community 18 - "focus.service.ts"
Cohesion: 0.17
Nodes (11): FocusRules, CompleteSessionInput, completeSessionSchema, ListSessionsQueryInput, listSessionsQuerySchema, LogInterruptionInput, logInterruptionSchema, StartSessionInput (+3 more)

### Community 19 - "zod"
Cohesion: 0.07
Nodes (33): Env, envSchema, RequestValidationSchema, SchemaType, validateBody(), validateParams(), validateQuery(), validateRequest() (+25 more)

### Community 20 - "model-router.ts"
Cohesion: 0.15
Nodes (11): GeminiAiAdapter, GroqAiAdapter, MockAiAdapter, OpenRouterAiAdapter, AiProviderAdapter, ModelRouterAuditLog, ModelRoutingConfig, AiProviderName (+3 more)

### Community 21 - "backend/src/packages/types/assessment.ts"
Cohesion: 0.13
Nodes (11): ApiResponse, sendCreated(), sendPaginated(), sendSuccess(), router, QuestionController, sanitizeQuestionForClient(), CreateQuestionInput (+3 more)

### Community 22 - "signup/page.tsx"
Cohesion: 0.08
Nodes (33): dependencies, next@^15.1.0, react@^19.0.0, react-dom@^19.0.0, @supabase/supabase-js@^2.116.0, devDependencies, autoprefixer@^10.6.1, postcss@^8.4.31 (+25 more)

### Community 23 - "graph.routes.ts"
Cohesion: 0.10
Nodes (14): BadRequestError, AutosaveAnswerInput, GraphController, graphRoutes, router, CreateConceptInput, createConceptSchema, CreateEdgeInput (+6 more)

### Community 24 - "SectionHeading"
Cohesion: 0.13
Nodes (21): DownloadPage(), metadata, platforms, featureCategories, FeaturesPage(), metadata, curricula, differentiators (+13 more)

### Community 25 - "landing/src/packages/types/student-model.ts"
Cohesion: 0.06
Nodes (32): BacklogClassification, BacklogItem, BacklogSummary, DailyPlan, DashboardIntelligence, DiagnosticAnswer, DiagnosticQuestion, DiagnosticResult (+24 more)

### Community 26 - "src/student-model.ts"
Cohesion: 0.06
Nodes (32): BacklogClassification, BacklogItem, BacklogSummary, DailyPlan, DashboardIntelligence, DiagnosticAnswer, DiagnosticQuestion, DiagnosticResult (+24 more)

### Community 27 - "web/src/packages/types/student-model.ts"
Cohesion: 0.06
Nodes (32): BacklogClassification, BacklogItem, BacklogSummary, DailyPlan, DashboardIntelligence, DiagnosticAnswer, DiagnosticQuestion, DiagnosticResult (+24 more)

### Community 28 - "landing/package.json"
Cohesion: 0.08
Nodes (31): dependencies, next@^15.1.0, react@^19.0.0, react-dom@^19.0.0, devDependencies, autoprefixer@^10.6.1, postcss@^8.4.31, tailwindcss@^3.4.17 (+23 more)

### Community 29 - "curriculum.routes.ts"
Cohesion: 0.11
Nodes (10): CurriculumController, curriculumRoutes, router, CreateCurriculumNodeInput, createCurriculumNodeSchema, ImportCurriculumInput, importCurriculumSchema, ListChaptersQueryInput (+2 more)

### Community 30 - "types.ts"
Cohesion: 0.14
Nodes (14): EvalSuiteReport, EvaluationRunner, EvalFixture, EVALUATION_FIXTURES, InputGuardrail, OutputGuardrail, getTutorPrompt(), MODE_SPECIFIC_PROMPTS (+6 more)

### Community 31 - "web/src/app/layout.tsx"
Cohesion: 0.11
Nodes (17): metadata, RootLayout(), viewport, sharedMetadata, siteConfig, Header(), navLinks, Layout() (+9 more)

### Community 32 - "Button"
Cohesion: 0.10
Nodes (17): LearningFlowPage(), loopSteps, metadata, NotFound(), Footer(), footerSections, Header(), navLinks (+9 more)

### Community 33 - "landing/src/app/page.tsx"
Cohesion: 0.11
Nodes (16): HomePage(), metadata, CtaBanner(), FAQSection(), questions, HeroSection(), KnowledgeModel(), phrases (+8 more)

### Community 34 - "useAuth"
Cohesion: 0.09
Nodes (22): ApiClientConfig, ApiClientError, SharpMindApiClient, ApiResponse, DbHealthResponse, HealthCheckResponse, SearchResponse, SearchResultItem (+14 more)

### Community 35 - "api-client/src/index.ts"
Cohesion: 0.09
Nodes (22): ApiClientConfig, ApiClientError, SharpMindApiClient, ApiResponse, DbHealthResponse, HealthCheckResponse, SearchResponse, SearchResultItem (+14 more)

### Community 36 - "backend/src/packages/types/assessment.ts"
Cohesion: 0.09
Nodes (25): analyzePostTestIntelligence(), PostTestAnalysisInput, AdaptiveSelectionContext, AnswerValidationInput, AnswerValidationResult, selectAdaptiveQuestions(), validateAnswer(), AssessmentType (+17 more)

### Community 37 - "AuthResult"
Cohesion: 0.13
Nodes (26): idx_evidence_logs_student, idx_knowledge_states_student, idx_student_profiles_user, public.evidence_logs, public.student_knowledge_states, public.student_profiles, idx_backlog_items_student_classification, idx_backlog_items_student_node (+18 more)

### Community 38 - "tutor.controller.ts"
Cohesion: 0.16
Nodes (11): TutorController, CreateSessionInput, createSessionSchema, ListSessionsQueryInput, listSessionsQuerySchema, SendMessageInput, sendMessageSchema, TUTOR_MODES (+3 more)

### Community 39 - "backend/src/packages/types/index.ts"
Cohesion: 0.09
Nodes (22): description, name, private, scripts, build, build:backend, build:landing, build:web (+14 more)

### Community 40 - "TopicDetailView.tsx"
Cohesion: 0.20
Nodes (10): TopicDetailView(), TopicTab, extractBraceGroup(), FormulaCard(), FormulaCardProps, GREEK_MAP, MathFormula(), MathFormulaProps (+2 more)

### Community 41 - "local-settings-adapter.ts"
Cohesion: 0.19
Nodes (9): PreferencesForm(), PreferencesFormProps, hashPassword(), verifyPassword(), SettingsAdapter, useTheme(), AcademicSettings, NotificationSettings (+1 more)

### Community 42 - "Canonical Relational Persistence and RLS Security Model on Supabase"
Cohesion: 0.08
Nodes (23): Cloud-First Unified Foundation, Managed Supabase and Modular TypeScript Backend, Canonical Academic Relational Schema, Canonical Relational Persistence and RLS Security Model on Supabase, RLS Student Data Isolation, Backend Foundation, File Subsystem, and Shared Packages Architecture, Modular Express Backend, Shared Types and API Client Packages (+15 more)

### Community 44 - "classroom/page.tsx"
Cohesion: 0.09
Nodes (15): ClassroomHierarchyContent(), ClassroomPage(), ChapterListView(), ChapterListViewProps, BreadcrumbItem, ClassroomBreadcrumbs(), ClassroomBreadcrumbsProps, ClassroomFilterBar() (+7 more)

### Community 45 - "EmailService"
Cohesion: 0.17
Nodes (3): EmailService, AuthController, OtpRateLimitService

### Community 46 - "landing/package.json"
Cohesion: 0.15
Nodes (9): FileController, fileRoutes, router, ALLOWED_MIME_TYPES, CreateUploadUrlInput, createUploadUrlSchema, ListFilesQueryInput, listFilesQuerySchema (+1 more)

### Community 47 - "mistake.service.ts"
Cohesion: 0.21
Nodes (14): calculateNextRetry(), inferMistakeRootCause(), MISTAKE_SPACED_INTERVALS, processMistakeRetry(), ListMistakesQueryInput, listMistakesQuerySchema, RetryMistakeInput, retryMistakeSchema (+6 more)

### Community 48 - "onboarding.service.ts"
Cohesion: 0.14
Nodes (12): OnboardingController, onboardingRoutes, router, CompleteOnboardingInput, completeOnboardingSchema, CompleteSignupProfileInput, completeSignupProfileSchema, SaveDraftInput (+4 more)

### Community 49 - "web/src/components/ui/Button.tsx"
Cohesion: 0.07
Nodes (23): AboutPage(), metadata, values, AiAcademicOsPage(), metadata, principles, UpgradePage(), LearningFlowPage() (+15 more)

### Community 50 - "web/src/app/contact/page.tsx"
Cohesion: 0.11
Nodes (22): ContactForm(), ContactPage(), FeedbackForm(), ForgotPasswordForm(), ForgotPasswordPage(), ResetPasswordForm(), ResetPasswordPage(), Footer() (+14 more)

### Community 51 - "static-curriculum-adapter.ts"
Cohesion: 0.05
Nodes (37): TopicDetailViewProps, ImageViewerModalProps, MaterialCardProps, CurriculumAdapter, createCurriculumAdapter(), ACADEMIC_YEARS, BOARDS, GRADES (+29 more)

### Community 52 - "assessment.service.ts"
Cohesion: 0.14
Nodes (21): calculateAssessmentScore(), calculateRemainingSeconds(), ScoreAssessmentInput, ScoreAssessmentResult, assessmentTypeEnum, autosaveAnswerSchema, CreateAssessmentInput, createAssessmentSchema (+13 more)

### Community 53 - "backend/src/packages/types/curriculum.ts"
Cohesion: 0.09
Nodes (22): Board, ChapterNode, ConceptItem, CurriculumMaterial, CurriculumNode, CurriculumQuestion, DocumentCallout, DocumentPage (+14 more)

### Community 54 - "20260916000001_initial_academic_os_schema.sql"
Cohesion: 0.18
Nodes (20): idx_assessment_submissions_student, idx_curriculum_nodes_lookup, idx_planner_tasks_student_date, idx_revision_items_due, public.assessment_answers, public.assessment_questions, public.assessment_submissions, public.assessments (+12 more)

### Community 55 - "landing/src/app/contact/page.tsx"
Cohesion: 0.16
Nodes (14): ContactForm(), ContactPage(), FeedbackForm(), Input(), InputProps, Textarea(), TextareaProps, delay() (+6 more)

### Community 56 - "landing/src/packages/types/assessment.ts"
Cohesion: 0.09
Nodes (22): AssessmentAnswerItem, AssessmentType, DifficultyDistribution, ExamReadinessResult, GenerationProvenance, MarkingScheme, MistakeCorrectionState, MistakeItem (+14 more)

### Community 57 - "AssessmentController"
Cohesion: 0.09
Nodes (22): Board, ChapterNode, ConceptItem, CurriculumMaterial, CurriculumNode, CurriculumQuestion, DocumentCallout, DocumentPage (+14 more)

### Community 58 - "src/assessment.ts"
Cohesion: 0.09
Nodes (22): AssessmentAnswerItem, AssessmentType, DifficultyDistribution, ExamReadinessResult, GenerationProvenance, MarkingScheme, MistakeCorrectionState, MistakeItem (+14 more)

### Community 59 - "src/curriculum.ts"
Cohesion: 0.09
Nodes (22): Board, ChapterNode, ConceptItem, CurriculumMaterial, CurriculumNode, CurriculumQuestion, DocumentCallout, DocumentPage (+14 more)

### Community 60 - "with"
Cohesion: 0.07
Nodes (29): name, runs-on, steps, timeout-minutes, SHARPMIND_DESKTOP_API_URL, SHARPMIND_DESKTOP_SUPABASE_ANON_KEY, SHARPMIND_DESKTOP_SUPABASE_URL, jobs (+21 more)

### Community 61 - "AiResponse"
Cohesion: 0.24
Nodes (3): aiOrchestrator, AiServiceUnavailableError, modelRouter

### Community 62 - "readiness.service.ts"
Cohesion: 0.21
Nodes (16): calculateProjectedScoreRange(), calculateReadinessFactors(), computeCompositeReadiness(), FACTOR_WEIGHTS, generateRecommendedInterventions(), generateSimulationScenarios(), getStatus(), ReadinessComputationInput (+8 more)

### Community 63 - "question-gen.agent.ts"
Cohesion: 0.08
Nodes (19): MistakeAnalysisAgent, MistakeAnalysisOutput, mistakeAnalysisOutputSchema, MistakeDiagnosticInput, GeneratedQuestion, generatedQuestionSchema, GenerateQuestionsInput, GenerateQuestionsOutput (+11 more)

### Community 65 - "diagnostic.service.ts"
Cohesion: 0.17
Nodes (11): DiagnosticController, CreateDiagnosticInput, createDiagnosticSchema, sessionIdParamSchema, SubmitDiagnosticInput, submitDiagnosticSchema, DiagnosticService, mapDiagnosticSessionRow() (+3 more)

### Community 66 - "backend/package.json"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 67 - "landing/src/packages/types/phase7.ts"
Cohesion: 0.10
Nodes (19): ActionToastItem, ExtractedConcept, Flashcard, HealthDimension, HealthDimensionStatus, MaterialProcessingStatus, MaterialQuizQuestion, MaterialSourceType (+11 more)

### Community 68 - "web/src/packages/types/tutor.ts"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 69 - "student-model.service.ts"
Cohesion: 0.10
Nodes (19): ActionToastItem, ExtractedConcept, Flashcard, HealthDimension, HealthDimensionStatus, MaterialProcessingStatus, MaterialQuizQuestion, MaterialSourceType (+11 more)

### Community 70 - "UserSettings"
Cohesion: 0.32
Nodes (4): createSettingsAdapter(), LocalSettingsAdapter, SupabaseSettingsAdapter, UserSettings

### Community 71 - "public.profiles"
Cohesion: 0.15
Nodes (16): on_auth_user_created, public.handle_new_user(), public.onboarding_drafts, public.parent_student_links, public.profiles, public.teacher_student_links, idx_academic_reviews_student, idx_notifications_student (+8 more)

### Community 72 - "public.questions"
Cohesion: 0.14
Nodes (17): idx_mistakes_student, idx_questions_lookup, idx_questions_pyq, public.mistakes, public.question_options, public.questions, idx_questions_concept, idx_questions_important (+9 more)

### Community 73 - "planner.service.ts"
Cohesion: 0.06
Nodes (42): BacklogController, ClassificationInput, classifyBacklogItem(), computePriorityScore(), DEFAULT_PRIORITY_WEIGHTS, MAX_BACKLOG_ITEMS, PriorityInput, PriorityResult (+34 more)

### Community 74 - "student-model.rules.ts"
Cohesion: 0.16
Nodes (24): classifyStatus(), computeConfidence(), computeMasteryFromEvidence(), computeNextReviewDate(), computePForget(), computeRetention(), computeUncertainty(), EvidenceRecord (+16 more)

### Community 75 - "web/src/packages/types/phase7.ts"
Cohesion: 0.10
Nodes (19): AnalyticsPage(), AcademicHealthScore, DailyDebrief, ExtractedConcept, Flashcard, HealthDimension, HealthDimensionStatus, MaterialProcessingStatus (+11 more)

### Community 76 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, baseUrl, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+8 more)

### Community 77 - "landing/src/packages/types/tutor.ts"
Cohesion: 0.12
Nodes (16): AiMessage, AiProviderName, AiRequest, AiResponse, AiTaskType, AiTokenUsage, AssembledContext, ContextSlice (+8 more)

### Community 78 - "backend/src/packages/types/auth.ts"
Cohesion: 0.12
Nodes (16): AiMessage, AiProviderName, AiRequest, AiResponse, AiTaskType, AiTokenUsage, AssembledContext, ContextSlice (+8 more)

### Community 79 - "getSupabaseClient"
Cohesion: 0.22
Nodes (7): AuthCallbackPage(), createAuthAdapter(), mapSupabaseError(), mapSupabaseSession(), mapSupabaseUser(), SupabaseAuthAdapter, getSupabaseClient()

### Community 80 - "backend/src/packages/types/index.ts"
Cohesion: 0.19
Nodes (13): ContactFormData, FeedbackFormData, FormResult, NewsletterData, AcademicSettings, NotificationSettings, SecuritySettings, SubscriptionInfo (+5 more)

### Community 81 - "tutor/page.tsx"
Cohesion: 0.15
Nodes (10): TutorPage(), TutorPageContent(), TutorInputArea(), TutorInputAreaProps, EMPTY_SUGGESTIONS, TutorMessageThread(), ModeOption, TUTOR_MODES (+2 more)

### Community 82 - "library/page.tsx"
Cohesion: 0.12
Nodes (12): LibraryPage(), LibraryPageContent(), ImageViewerModal(), LibraryFilterBar(), LibraryFilterBarProps, LibraryFilters, SUBJECT_OPTIONS, TYPE_OPTIONS (+4 more)

### Community 83 - "main.cjs"
Cohesion: 0.17
Nodes (13): { app, BrowserWindow, dialog, ipcMain, protocol, safeStorage, session, shell }, authFile, createWindow(), fs, hasLock, isSmokeTest, openExternal(), path (+5 more)

### Community 84 - "backend/src/packages/types/phase7.ts"
Cohesion: 0.15
Nodes (12): DocumentChunk, MaterialRules, ActionToastItem, Flashcard, HealthDimension, HealthDimensionStatus, MaterialProcessingStatus, MaterialQuizQuestion (+4 more)

### Community 85 - "search.routes.ts"
Cohesion: 0.22
Nodes (8): SearchController, router, searchRoutes, SearchQueryInput, searchQuerySchema, SearchResultItem, SearchResults, SearchService

### Community 86 - "api-client/package.json"
Cohesion: 0.15
Nodes (14): dependencies, @sharpmind/types@*, devDependencies, typescript@^5.7.0, typescript, main, name, private (+6 more)

### Community 87 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, outDir, rootDir (+6 more)

### Community 88 - "security.cjs"
Cohesion: 0.13
Nodes (14): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, module, outDir, rootDir (+6 more)

### Community 89 - "Toast/index.ts"
Cohesion: 0.14
Nodes (8): DailyPlanData, PlannerPage(), PlanSessionItem, PlanTaskItem, WeeklyPlanData, ActionToastContext, NotificationsDrawerProps, apiClient

### Community 90 - "supabase-auth-adapter.ts"
Cohesion: 0.28
Nodes (12): authAdapter, DEFAULT_USERS, StoredUser, AuthContextValue, AuthError, AuthErrorCode, PasswordResetRequest, PasswordUpdateCredentials (+4 more)

### Community 91 - "backend/src/packages/types/student-model.ts"
Cohesion: 0.12
Nodes (16): SM2Input, BacklogClassification, DashboardIntelligence, DiagnosticAnswer, DiagnosticStatus, EvidenceLogCreate, EvidenceType, KnowledgeStateUpdate (+8 more)

### Community 92 - "landing/src/components/ui/SectionHeading.tsx"
Cohesion: 0.15
Nodes (7): AboutPage(), metadata, values, AiAcademicOsPage(), metadata, principles, SectionHeadingProps

### Community 93 - "Tri-Project Monorepo"
Cohesion: 0.20
Nodes (11): Backend API, Graphify Agent Memory Integration, Landing Site, OTP Rate Limiting, Required Student Profile Setup, SharpMind Current State, Supabase Auth, Tri-Project Monorepo (+3 more)

### Community 94 - "dev.cjs"
Cohesion: 0.12
Nodes (14): electron, path, root, choosePort(), net, { spawn }, webScript, electron (+6 more)

### Community 95 - "curriculum.routes.ts"
Cohesion: 0.17
Nodes (11): AcademicProfile, KnowledgeModelAttachment, LearningStyle, OnboardingDraft, OnboardingStatus, PreparationLevel, ReadinessBaseline, StudentProfile (+3 more)

### Community 96 - "20260918000002_curriculum_knowledge_graph_and_pyq.sql"
Cohesion: 0.33
Nodes (11): idx_concept_curr_concept, idx_concept_curr_node, idx_concepts_code, idx_concepts_subject, idx_kg_source, idx_kg_target, public.concept_curriculum_mappings, public.concepts (+3 more)

### Community 97 - "landing/src/packages/types/onboarding.ts"
Cohesion: 0.17
Nodes (11): AcademicProfile, KnowledgeModelAttachment, LearningStyle, OnboardingDraft, OnboardingStatus, PreparationLevel, ReadinessBaseline, StudentProfile (+3 more)

### Community 98 - "types/package.json"
Cohesion: 0.18
Nodes (11): devDependencies, typescript@^5.7.0, typescript, main, name, private, scripts, build (+3 more)

### Community 99 - "src/onboarding.ts"
Cohesion: 0.17
Nodes (11): AcademicProfile, KnowledgeModelAttachment, LearningStyle, OnboardingDraft, OnboardingStatus, PreparationLevel, ReadinessBaseline, StudentProfile (+3 more)

### Community 100 - "build-web.cjs"
Cohesion: 0.19
Nodes (10): contextAssembler, ContextRetrievalOptions, AiMessage, AiTokenUsage, AssembledContext, ContextSlice, TutorCitation, TutorContext (+2 more)

### Community 101 - "backend/src/packages/types/auth.ts"
Cohesion: 0.18
Nodes (10): AuthError, AuthErrorCode, AuthResult, AuthSession, PasswordResetRequest, PasswordUpdateCredentials, SignInCredentials, SignUpCredentials (+2 more)

### Community 102 - "landing/src/packages/types/auth.ts"
Cohesion: 0.18
Nodes (10): AuthError, AuthErrorCode, AuthResult, AuthSession, PasswordResetRequest, PasswordUpdateCredentials, SignInCredentials, SignUpCredentials (+2 more)

### Community 103 - "landing/src/packages/types/index.ts"
Cohesion: 0.33
Nodes (9): AcademicSettings, NotificationSettings, SecuritySettings, SubscriptionInfo, SubscriptionStatus, SubscriptionTier, UserPreferences, UserRole (+1 more)

### Community 104 - "src/auth.ts"
Cohesion: 0.18
Nodes (10): AuthError, AuthErrorCode, AuthResult, AuthSession, PasswordResetRequest, PasswordUpdateCredentials, SignInCredentials, SignUpCredentials (+2 more)

### Community 105 - "types/src/index.ts"
Cohesion: 0.33
Nodes (9): AcademicSettings, NotificationSettings, SecuritySettings, SubscriptionInfo, SubscriptionStatus, SubscriptionTier, UserPreferences, UserRole (+1 more)

### Community 106 - "AiResponse"
Cohesion: 0.22
Nodes (7): TestsPage(), handleAutoSubmit(), handleMarkForReview(), handleNextQuestion(), handleStartTest(), handleSubmitTest(), loadAssessments()

### Community 108 - "security.cjs"
Cohesion: 0.10
Nodes (18): handleDeepLink(), registerAppProtocol(), apiParsed, path, result, { spawnSync }, supabaseParsed, webDirectory (+10 more)

### Community 109 - "analytics.service.ts"
Cohesion: 0.23
Nodes (8): DebriefInsights, debriefInsightsSchema, ReviewAnalyticsAgent, WeeklyReviewInsights, weeklyReviewInsightsSchema, AnalyticsRules, RawTelemetryMetrics, AcademicHealthScore

### Community 110 - "public.tutor_sessions"
Cohesion: 0.31
Nodes (8): idx_tutor_messages_session, public.tutor_messages, public.tutor_sessions, idx_ai_audit_logs_student, idx_ai_audit_logs_task, idx_tutor_messages_session, idx_tutor_sessions_student, public.ai_audit_logs

### Community 111 - "20260918000001_file_subsystem_and_search.sql"
Cohesion: 0.33
Nodes (8): idx_curriculum_nodes_fts, idx_file_assets_status, idx_file_assets_type, idx_file_assets_user, idx_materials_fts, idx_questions_fts, public.file_assets, trg_file_assets_updated_at

### Community 112 - "smoke.cjs"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 113 - "landing/src/app/layout.tsx"
Cohesion: 0.28
Nodes (6): metadata, RootLayout(), viewport, sharedMetadata, siteConfig, Layout()

### Community 114 - "SharpMind Backlog & Future Phase Milestone Register"
Cohesion: 0.31
Nodes (7): extractBraceGroup(), FormulaCard(), FormulaCardProps, GREEK_MAP, MathFormula(), MathFormulaProps, renderMathFormulaNodes()

### Community 115 - "web/public/manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 116 - "backend/src/packages/types/api.ts"
Cohesion: 0.28
Nodes (4): stats, StatsSection(), AnimatedCounter(), AnimatedCounterProps

### Community 117 - "AnalyticsService"
Cohesion: 0.24
Nodes (4): AnalyticsController, AnalyticsService, DailyDebrief, WeeklyReview

### Community 118 - ".completeSession"
Cohesion: 0.29
Nodes (3): FocusController, FocusService, StudySession

### Community 119 - "signup/page.tsx"
Cohesion: 0.22
Nodes (9): SignupForm(), SignupPage(), VerifyEmailContent(), VerifyEmailPage(), api, getApiBaseUrl(), getApiClient(), createVerificationPageUrl() (+1 more)

### Community 120 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, cors@^2.8.5, express@^4.21.2, helmet@^8.0.0, pino@^9.6.0, pino-http@^10.4.0, @supabase/supabase-js@^2.116.0, zod@^3.24.2 (+5 more)

### Community 121 - "web/src/packages/types/index.ts"
Cohesion: 0.18
Nodes (12): SubscriptionStatusCardProps, Concept, ConceptMisconception, ConceptRelationshipType, ConceptWithGraph, KnowledgeGraphEdge, PrerequisiteNode, SecuritySettings (+4 more)

### Community 122 - "Welcome and Account Verification Email Template"
Cohesion: 0.29
Nodes (7): Account Activation After Email Verification, Email Verification Success Email Template, Syllabus-Aligned Practice and Spaced Revision, Email Verification Requirement, Seven-Day Verification Deadline, SharpMind Verification Screen, Welcome and Account Verification Email Template

### Community 124 - "backend/src/packages/types/graph.ts"
Cohesion: 0.33
Nodes (6): Concept, ConceptMisconception, ConceptRelationshipType, ConceptWithGraph, KnowledgeGraphEdge, PrerequisiteNode

### Community 125 - "landing/src/packages/types/graph.ts"
Cohesion: 0.33
Nodes (6): Concept, ConceptMisconception, ConceptRelationshipType, ConceptWithGraph, KnowledgeGraphEdge, PrerequisiteNode

### Community 126 - "src/graph.ts"
Cohesion: 0.33
Nodes (6): Concept, ConceptMisconception, ConceptRelationshipType, ConceptWithGraph, KnowledgeGraphEdge, PrerequisiteNode

### Community 127 - "IconName"
Cohesion: 0.12
Nodes (13): SubjectInfo, SETTINGS_TABS, SettingsNav(), SettingsNavProps, SettingsTab, TabItem, IconName, CommandItem (+5 more)

### Community 128 - "ToastContext.tsx"
Cohesion: 0.27
Nodes (8): ToastAction, ToastContext, ToastContextValue, ToastItem, ToastProvider(), ToastVariant, ToastMessage(), ToastMessageProps

### Community 129 - "SharpMind for Windows Desktop Client"
Cohesion: 0.33
Nodes (5): Encrypted Auth Storage, Existing Web Production Export, Shared Public API, Shared Supabase Project, SharpMind for Windows Desktop Client

### Community 130 - "NotFoundError"
Cohesion: 0.09
Nodes (20): ForbiddenError, NotFoundError, UnauthorizedError, ProtectedResourceType, requireResourceOwner(), requireStudentOrMentor(), requireVerifiedEmail(), requireRole() (+12 more)

### Community 131 - "web/src/packages/types/onboarding.ts"
Cohesion: 0.20
Nodes (9): AcademicProfile, KnowledgeModelAttachment, LearningStyle, OnboardingStatus, PreparationLevel, ReadinessBaseline, StudyPreferences, StudyTimeOfDay (+1 more)

### Community 132 - "backend/src/packages/types/api.ts"
Cohesion: 0.33
Nodes (5): ApiResponse, DbHealthResponse, HealthCheckResponse, SearchResponse, SearchResultItem

### Community 133 - "backend/src/packages/types/files.ts"
Cohesion: 0.33
Nodes (5): DownloadUrlResponse, FileAsset, FileAssetType, FileProcessingStatus, UploadUrlResponse

### Community 134 - "backend/src/packages/types/files.ts"
Cohesion: 0.53
Nodes (4): getSimulationById(), getSimulationsBySubject(), VISUAL_SIMULATIONS_REGISTRY, VisualSimulationMetadata

### Community 135 - "vercel.json"
Cohesion: 0.33
Nodes (5): maxDuration, functions, api/index.ts, rewrites, version

### Community 136 - "20261014000002_otp_rate_limiting.sql"
Cohesion: 0.53
Nodes (4): idx_otp_send_logs_email_window, idx_otp_send_logs_retention, public.cleanup_expired_otp_logs(), public.otp_send_logs

### Community 137 - "Evidence, Provenance, and Student Privacy"
Cohesion: 0.40
Nodes (4): SharpMind Conventions, SharpMind Product Rules, Adaptive AI Academic OS, Student Model

### Community 139 - "SharpMind Vercel Deployability Rules"
Cohesion: 0.22
Nodes (9): SharpMind Vercel Deployability Rules, Independent Deployment Targets, SharpMind Deployment Architecture, SharpMind Vercel Deployability Rules, Backend API, Independent Multi-Project Monorepo, Public Landing, SharpMind AI Academic Operating System (+1 more)

### Community 141 - "src/forms.ts"
Cohesion: 0.40
Nodes (4): ContactFormData, FeedbackFormData, FormResult, NewsletterData

### Community 142 - "backend/package.json"
Cohesion: 0.22
Nodes (8): resend@^6.32.1, @types/node@^22.0.0, @types/node, main, name, private, version, resend

### Community 143 - "ADR 0012: Persistent Workspace Navigation and App Entry"
Cohesion: 0.50
Nodes (4): Blocked Work, Graphify CLI Workaround, Windows Installer Validation, Production OTP Confirmation

### Community 144 - "preload.cjs"
Cohesion: 0.50
Nodes (4): Current Progress, Graphify Agent Memory Integration, Production OTP 503 Investigation, Phase 03 Curriculum and Knowledge Graph

### Community 145 - "Next Checkpoint"
Cohesion: 0.50
Nodes (4): Graphify Shared Agent Memory Setup, Next Checkpoint, Phase 02 Knowledge Engine and Vector Ingestion, Windows Desktop Release Checkpoint

### Community 146 - "desktop/package.json"
Cohesion: 0.14
Nodes (15): author, description, devDependencies, electron@44.9.1, electron-builder@26.17.0, png-to-ico@^3.0.1, main, name (+7 more)

### Community 147 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build:web, dev, package:dir, package:win, smoke:dev, test, typecheck

### Community 148 - "express.d.ts"
Cohesion: 0.50
Nodes (3): AuthenticatedUser, Express, Request

### Community 149 - "Study Material Intelligence, Visual Learning, Focus, Analytics, and Notifications"
Cohesion: 0.50
Nodes (4): Explainable Academic Health Score, Calibrated Focus Telemetry, Study Material Provenance and AI Synthesis, Study Material Intelligence, Visual Learning, Focus, Analytics, and Notifications

### Community 150 - "Three Project Vercel Deployment Topology"
Cohesion: 0.67
Nodes (3): Supabase and PostgreSQL, Three Project Vercel Deployment Topology, SharpMind Decisions

### Community 151 - "SharpMind Project Map"
Cohesion: 0.67
Nodes (3): Classroom Collaboration and Mentorship, SharpMind Project Map, Roles, Admin, and Billing Workflows

### Community 152 - "Windows Desktop Client"
Cohesion: 0.67
Nodes (3): Electron Desktop Packaging, Secure Desktop Authentication Storage and Redirects, Windows Desktop Client

### Community 153 - "512px Landing Page Icon"
Cohesion: 0.67
Nodes (3): Dark Rounded-square Backdrop, 512px Landing Page Icon, Layered Diamond Mark

### Community 155 - "App icon with a layered violet and blue diamond on a dark rounded-square background"
Cohesion: 0.67
Nodes (3): App icon with a layered violet and blue diamond on a dark rounded-square background, Layered diamond mark, Violet glow against a dark field

### Community 156 - "SharpMind App Icon"
Cohesion: 0.67
Nodes (3): SharpMind App Icon, Focus and Learning, Layered Diamond Symbol

### Community 189 - "AcademicSettingsForm.tsx"
Cohesion: 0.25
Nodes (6): AcademicSettingsForm(), AcademicSettingsFormProps, BOARDS, GRADES, STREAMS, TARGET_EXAMS_OPTIONS

### Community 190 - "seed_authentic_curriculum_and_pyqs.ts"
Cohesion: 0.33
Nodes (3): dotenv@^16.4.7, dotenv, supabase

### Community 191 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, start, test, typecheck

### Community 192 - "ActionToast.tsx"
Cohesion: 0.40
Nodes (4): ActionToast(), ActionToastProps, ActionToastContextValue, ActionToastItem

## Knowledge Gaps
- **86 isolated node(s):** `Account Activation After Email Verification`, `Syllabus-Aligned Practice and Spaced Revision`, `Email Verification Requirement`, `Seven-Day Verification Deadline`, `SharpMind Verification Screen` (+81 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1316 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `material.service.ts` to `NotFoundError`, `notification.service.ts`, `db/client.ts`, `backend/src/packages/types/files.ts`, `devDependencies`, `backend/package.json`, `BadRequestError`, `focus.service.ts`, `model-router.ts`, `types.ts`, `backend/src/packages/types/assessment.ts`, `mistake.service.ts`, `assessment.service.ts`, `readiness.service.ts`, `question-gen.agent.ts`, `diagnostic.service.ts`, `planner.service.ts`, `student-model.rules.ts`, `backend/src/packages/types/phase7.ts`, `build-web.cjs`, `analytics.service.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `Account Activation After Email Verification`, `Syllabus-Aligned Practice and Spaced Revision`, `Email Verification Requirement` to the rest of the system?**
  _86 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.07587382779198636 - nodes in this community are weakly interconnected._
- **Why does `BadRequestError` connect `graph.routes.ts` to `student-model.service.ts`, `NotFoundError`, `db/client.ts`, `UnauthorizedError`, `material.service.ts`, `BadRequestError`, `focus.service.ts`, `backend/src/packages/types/assessment.ts`, `curriculum.routes.ts`, `tutor.controller.ts`, `EmailService`, `landing/package.json`, `mistake.service.ts`, `onboarding.service.ts`, `assessment.service.ts`, `readiness.service.ts`, `AssessmentController`, `diagnostic.service.ts`, `planner.service.ts`, `search.routes.ts`, `.completeSession`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `student-model.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11942959001782531 - nodes in this community are weakly interconnected._
- **Why does `createVerificationPageUrl()` connect `signup/page.tsx` to `material.service.ts`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `ref_next` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._