'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/app/actions/profile';

const profileSchema = z.object({
  experienceLevel: z.enum(['Intern', 'New Grad', 'Experienced'], {
    message: 'Please select an experience level',
  }),
  interviewTypes: z
    .array(z.string())
    .min(1, 'Please select at least one interview type'),
});

type FormValues = z.infer<typeof profileSchema>;

const EXPERIENCE_LEVELS = ['Intern', 'New Grad', 'Experienced'];
const INTERVIEW_TYPES = ['Behavioral', 'Coding', 'System Design'];

export default function ProfileSetupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      interviewTypes: [],
    },
  });

  const selectedInterviewTypes = watch('interviewTypes');

  const toggleInterviewType = (type: string) => {
    const current = selectedInterviewTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setValue('interviewTypes', updated, { shouldValidate: true });
  };

  const onSubmit = async (data: FormValues) => {
    setServerError(null);

    const result = await updateProfile(data);

    if (!result.success) {
      setServerError(result.error || 'An error occurred');
    } else {
      router.push('/search');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4FE] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#0B1527] mb-4">
            Complete Your Profile
          </h1>
          <p className="text-[#64748B] text-lg">
            Tell us about yourself so we can find your perfect mock interview
            partners.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {serverError && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 text-center font-medium">
              {serverError}
            </div>
          )}

          {/* Experience Level Selection */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-4">
              1. What is your experience level?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {EXPERIENCE_LEVELS.map((level) => (
                <label
                  key={level}
                  className={`
                                        cursor-pointer flex items-center justify-center py-4 px-6 rounded-xl border-2 transition-all duration-200
                                        ${
                                          watch('experienceLevel') === level
                                            ? 'border-[#8A2BE2] bg-purple-50 text-[#8A2BE2] font-semibold shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700 font-medium'
                                        }
                                    `}
                >
                  <input
                    type="radio"
                    value={level}
                    {...register('experienceLevel')}
                    className="sr-only"
                  />
                  {level}
                </label>
              ))}
            </div>
            {errors.experienceLevel && (
              <p className="mt-2 text-sm text-red-500 font-medium">
                {errors.experienceLevel.message}
              </p>
            )}
          </div>

          {/* Interview Types Selection */}
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-4">
              2. What types of interviews do you want to practice?
            </label>
            <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
            <div className="flex flex-wrap gap-3">
              {INTERVIEW_TYPES.map((type) => {
                const isSelected = selectedInterviewTypes?.includes(type);
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => toggleInterviewType(type)}
                    className={`
                                            px-6 py-3 rounded-full border-2 transition-all duration-200 font-medium
                                            ${
                                              isSelected
                                                ? 'border-[#8A2BE2] bg-[#8A2BE2] text-white shadow-md'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            {errors.interviewTypes && (
              <p className="mt-2 text-sm text-red-500 font-medium">
                {errors.interviewTypes.message}
              </p>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8A2BE2] hover:bg-[#7924c7] text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-transform duration-200 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
            >
              {isSubmitting ? 'Saving...' : 'Start Finding Partners'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
