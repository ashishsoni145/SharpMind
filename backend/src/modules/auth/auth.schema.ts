import { z } from 'zod';

export const emailAvailabilitySchema = z.object({
  email: z
    .string()
    .trim()
    .max(320)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address.'),
});
