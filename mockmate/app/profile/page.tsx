'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileInput } from '@/lib/validations';
import { getProfile, updateProfile } from '@/app/actions/profile';

const EXPERIENCE_LEVELS = ['Intern', 'New Grad', 'Experienced'];
const INTERVIEW_TYPES = ['Behavioral', 'Coding', 'System Design'];

export default function ProfilePage() {
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProfileInput>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            interviewTypes: [],
            availability: [],
            zoomLink: '',
        },
    });

    const selectedInterviewTypes = watch('interviewTypes');
    const availabilityList = watch('availability');

    const [newAvailabilityTime, setNewAvailabilityTime] = useState('');

    useEffect(() => {
        async function fetchProfile() {
            const res = await getProfile();
            if (res.success && res.user) {
                setValue('experienceLevel', res.user.experienceLevel as 'Intern' | 'New Grad' | 'Experienced');
                setValue('interviewTypes', res.user.interviewTypes || []);
                setValue('availability', res.user.availability || []);
                setValue('zoomLink', res.user.zoomLink || '');
            } else {
                setServerError(res.error || 'Failed to load profile');
            }
            setIsLoadingData(false);
        }
        fetchProfile();
    }, [setValue]);

    const toggleInterviewType = (type: string) => {
        const current = selectedInterviewTypes || [];
        const updated = current.includes(type)
            ? current.filter((t) => t !== type)
            : [...current, type];
        setValue('interviewTypes', updated, { shouldValidate: true });
    };

    const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
        const hours = Math.floor(i / 2);
        const minutes = i % 2 === 0 ? '00' : '30';
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    });

    const [newAvailabilityDate, setNewAvailabilityDate] = useState('');

    const addAvailability = () => {
        if (!newAvailabilityDate || !newAvailabilityTime) return;
        const current = availabilityList || [];
        try {
            const [year, month, day] = newAvailabilityDate.split('-');
            const [hours, minutes] = newAvailabilityTime.split(':');

            const dateObj = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));

            if (!isNaN(dateObj.getTime())) {
                const isoString = dateObj.toISOString();
                if (!current.includes(isoString)) {
                    setValue('availability', [...current, isoString], { shouldValidate: true });
                }
            }
        } catch {
            console.error('Invalid date format');
        }
        setNewAvailabilityTime('');
    };

    const removeAvailability = (isoString: string) => {
        const current = availabilityList || [];
        setValue('availability', current.filter((time) => time !== isoString), { shouldValidate: true });
    };

    const onSubmit = async (data: ProfileInput) => {
        setServerError(null);
        setSuccessMessage(null);

        const result = await updateProfile(data);

        if (!result.success) {
            setServerError(result.error || 'An error occurred while saving.');
        } else {
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen bg-[#F3F4FE] flex flex-col items-center justify-center p-4">
                <p className="text-xl font-medium text-gray-500">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F4FE] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-[#8A2BE2] py-8 px-6 sm:px-10 text-center">
                    <h1 className="text-3xl font-extrabold text-white mb-2">My Profile</h1>
                    <p className="text-purple-100/80 text-lg">Manage your settings and availability</p>
                </div>

                <div className="p-8 sm:p-12">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                        {serverError && (
                            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 font-medium text-center">
                                {serverError}
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-4 text-sm text-green-700 bg-green-50 rounded-xl border border-green-200 font-medium text-center">
                                {successMessage}
                            </div>
                        )}

                        {/* Experience Level */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Experience Level</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {EXPERIENCE_LEVELS.map((level) => (
                                    <label
                                        key={level}
                                        className={`
                                            cursor-pointer flex items-center justify-center py-3 px-4 rounded-xl border-2 transition-all duration-200
                                            ${watch('experienceLevel') === level
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
                                <p className="text-sm text-red-500 font-medium">{errors.experienceLevel.message}</p>
                            )}
                        </section>

                        {/* Interview Types */}
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Interview Types</h2>
                                <p className="text-sm text-gray-500 mt-2">What kind of mock interviews do you want to do?</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {INTERVIEW_TYPES.map((type) => {
                                    const isSelected = selectedInterviewTypes?.includes(type);
                                    return (
                                        <button
                                            type="button"
                                            key={type}
                                            onClick={() => toggleInterviewType(type)}
                                            className={`
                                                px-5 py-2.5 rounded-full border-2 transition-all duration-200 font-medium
                                                ${isSelected
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
                                <p className="text-sm text-red-500 font-medium">{errors.interviewTypes.message}</p>
                            )}
                        </section>

                        {/* Zoom Link */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Meeting Link</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Zoom Link (Optional)</label>
                                <input
                                    type="url"
                                    placeholder="https://zoom.us/j/..."
                                    {...register('zoomLink')}
                                    className="w-full sm:max-w-md px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent transition-all"
                                />
                                {errors.zoomLink && (
                                    <p className="mt-2 text-sm text-red-500 font-medium">{errors.zoomLink.message}</p>
                                )}
                            </div>
                        </section>

                        {/* Availability */}
                        <section className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Availability Settings</h2>
                                <p className="text-sm text-gray-500 mt-2">Add the exact dates and times you are free to do a mock interview.</p>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <input
                                        type="date"
                                        value={newAvailabilityDate}
                                        min={new Date().toISOString().split('T')[0]} // Suggest future dates
                                        onChange={(e) => setNewAvailabilityDate(e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent bg-white text-gray-700 font-medium"
                                    />
                                    <select
                                        value={newAvailabilityTime}
                                        onChange={(e) => setNewAvailabilityTime(e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent bg-white text-gray-700 font-medium"
                                    >
                                        <option value="" disabled>Select Start Time</option>
                                        {TIME_OPTIONS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={addAvailability}
                                        disabled={!newAvailabilityDate || !newAvailabilityTime}
                                        className="bg-[#10B981] hover:bg-[#0EA5E9] text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        Add 1 Hr Slot
                                    </button>
                                </div>

                                {/* List added times */}
                                {availabilityList && availabilityList.length > 0 ? (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-gray-700">Your Upcoming Slots:</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {availabilityList.map((isoString, idx) => {
                                                const dateObj = new Date(isoString);
                                                const endDateObj = new Date(dateObj.getTime() + 60 * 60 * 1000); // Add 1 hour

                                                const formattedStart = new Intl.DateTimeFormat('en-US', {
                                                    weekday: 'short', month: 'short', day: 'numeric',
                                                    hour: 'numeric', minute: '2-digit'
                                                }).format(dateObj);

                                                const formattedEnd = new Intl.DateTimeFormat('en-US', {
                                                    hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
                                                }).format(endDateObj);

                                                return (
                                                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                                                        <span className="text-gray-800 font-medium text-sm">{formattedStart} - {formattedEnd}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAvailability(isoString)}
                                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                            title="Remove slot"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-400 font-medium">
                                        No availability slots added yet.
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#8A2BE2] hover:bg-[#7924C7] text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-transform duration-200 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
