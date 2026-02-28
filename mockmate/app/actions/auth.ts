'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signupSchema, type SignupInput } from '@/lib/validations';

export async function signUpUser(data: SignupInput) {
  try {
    const validatedData = signupSchema.safeParse(data);

    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.issues[0]?.message || 'Invalid input data',
      };
    }

    const { name, email, password } = validatedData.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during signup',
    };
  }
}
