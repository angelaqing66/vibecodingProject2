import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must be at most 20 characters'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export const profileSchema = z.object({
  experienceLevel: z.enum(['Intern', 'New Grad', 'Experienced']),
  interviewTypes: z
    .array(z.string())
    .min(1, 'Select at least one interview type'),
  availability: z.array(z.string()),
  zoomLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type ProfileInput = z.infer<typeof profileSchema>;
