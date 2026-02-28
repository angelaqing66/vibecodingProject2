'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signUpUser } from '@/app/actions/auth';

import { signupSchema } from "@/lib/validations";

const formSchema = signupSchema.extend({
    confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormValues) => {
        setServerError(null);
        const result = await signUpUser({
            name: data.name,
            email: data.email,
            password: data.password,
        });

        if (!result.success) {
            setServerError(result.error || "An unexpected error occurred.");
            return;
        }

        // Auto sign-in after successful registration
        const signInResult = await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: false,
        });

        if (signInResult?.error) {
            setServerError('Account created, but failed to log in automatically.');
        } else {
            router.push('/dashboard');
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F4FE] flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
                {/* Left column text */}
                <div className="hidden md:block">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
                        <span>🚀</span> Free for students
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-extrabold text-[#0B1527] leading-tight tracking-tight mb-6">
                        Find your perfect
                        <br />
                        mock interview
                        <br />
                        partner
                    </h1>
                    <p className="text-[#64748B] text-lg lg:text-xl mb-10 max-w-lg leading-relaxed">
                        Practice technical, behavioral, and system design interviews with
                        peers preparing just like you.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm text-sm font-medium text-gray-700">
                            <span className="text-xl">🎯</span> Targeted practice
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm text-sm font-medium text-gray-700">
                            <span className="text-xl">📅</span> Flexible scheduling
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm text-sm font-medium text-gray-700">
                            <span className="text-xl">🏢</span> Company-specific prep
                        </div>
                    </div>
                </div>

                {/* Right column form */}
                <div className="bg-white rounded-3xl shadow-xl w-full max-w-md mx-auto p-8 border border-gray-100">
                    <div className="flex bg-gray-50 rounded-lg mb-8 p-1">
                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="flex-1 py-3 text-sm font-semibold rounded-md text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            className="flex-1 py-3 text-sm font-semibold rounded-md bg-white text-gray-900 shadow-sm transition-colors"
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {serverError && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                                {serverError}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                {...register('name')}
                                type="text"
                                placeholder="Your name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8A2BE2] focus:border-[#8A2BE2] outline-none transition duration-200"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8A2BE2] focus:border-[#8A2BE2] outline-none transition duration-200"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8A2BE2] focus:border-[#8A2BE2] outline-none transition duration-200"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8A2BE2] focus:border-[#8A2BE2] outline-none transition duration-200"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#8A2BE2] hover:bg-[#7924c7] text-white font-semibold py-4 rounded-xl shadow-md transition-all duration-200 mt-4 disabled:opacity-70 flex justify-center items-center"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <a
                            href="/login"
                            className="text-[#8A2BE2] font-semibold hover:underline"
                        >
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
