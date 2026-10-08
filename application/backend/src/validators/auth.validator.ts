import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password must not exceed 100 characters'),
    phone: z.string().optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  }),
};

export const refreshSchema = {
  body: z.object({
    refreshToken: z.string().optional(),
  }),
};
