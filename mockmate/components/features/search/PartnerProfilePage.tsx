'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Level, InterviewType, Period, TimeSlot } from '@/types';

const mockPartner: User = {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@mit.edu',
    bio: 'CS grad from MIT, prepping for big tech. Love helping others practice!',
    level: 'NEW_GRAD',
    interviewTypes: ['CODING', 'SYSTEM_DESIGN'],
    companies: ['Google', 'Meta'],
    meetingLink: 'https://zoom.us/j/111',
    role: 'STUDENT',
    availability: [
        { id: 's1', dayOfWeek: 0, period: 'MORNING', isBooked: false },
        { id: 's2', dayOfWeek: 2, period: 'EVENING', isBooked: false },
        { id: 's3', dayOfWeek: 4, period: 'AFTERNOON', isBooked: false },
    ],
    createdAt: '2025-01-15',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];
const PERIODS: Period[] = ['MORNING', 'AFTERNOON', 'EVENING'];

export default function PartnerProfilePage({
    partnerId,
}: {
    partnerId: string;
}) {
    const router = useRouter();

    // In a real app we'd fetch the user using partnerId, but we are using mock data
    // e.g. await fetchUser(partnerId)
    const user = mockPartner;

    const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [notes, setNotes] = useState('');
    const [isBooked, setIsBooked] = useState(false);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getLevelColor = (level: Level) => {
        switch (level) {
            case 'INTERN':
                return 'bg-blue-100 text-blue-800';
            case 'NEW_GRAD':
                return 'bg-green-100 text-green-800';
            case 'EXPERIENCED':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const hasSlot = (dayIndex: number, period: Period) => {
        return user.availability.find(
            (slot: TimeSlot) => slot.dayOfWeek === dayIndex && slot.period === period
        );
    };

    const handleBooking = () => {
        if (!selectedType || !selectedSlot) return;
        setIsBooked(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => router.push('/search')}
                className="text-[#7C3AED] hover:text-[#5B21B6] font-medium flex items-center gap-2 mb-8 transition-colors"
                data-testid="back-button"
            >
                <span>←</span> Back to Search
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT SECTION — Partner Profile */}
                <div className="flex-1 space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-[#7C3AED] text-3xl font-bold shrink-0">
                                {getInitials(user.name)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {user.name}
                                </h1>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(user.level)}`}
                                >
                                    {user.level.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <section className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                About
                            </h2>
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {user.bio}
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <section>
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                    Interview Types
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {user.interviewTypes.map((type: InterviewType) => (
                                        <span
                                            key={type}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
                                        >
                                            {type.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                    Target Companies
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {user.companies.map((company: string) => (
                                        <span
                                            key={company}
                                            className="px-3 py-1 bg-[#EEF2FF] text-[#4338CA] rounded-lg text-sm font-medium border border-[#E0E7FF] flex items-center gap-1.5"
                                        >
                                            <span>🏢</span> {company}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Availability Grid
                            </h2>
                            <div className="overflow-x-auto">
                                <div className="min-w-[600px]">
                                    <div className="grid grid-cols-8 gap-2 mb-2">
                                        <div className="font-medium text-gray-500 text-sm text-center"></div>
                                        {DAYS.map((day) => (
                                            <div
                                                key={day}
                                                className="font-semibold text-gray-700 text-sm text-center py-2"
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {PERIODS.map((period) => (
                                        <div
                                            key={period}
                                            className="grid grid-cols-8 gap-2 mb-2 items-center"
                                        >
                                            <div className="font-medium text-gray-500 text-xs text-right pr-4 tracking-wider">
                                                {period}
                                            </div>
                                            {DAYS.map((_, dayIndex) => {
                                                const slot = hasSlot(dayIndex, period);
                                                const isAvailable = !!slot;
                                                const booked = slot?.isBooked;

                                                return (
                                                    <div
                                                        key={`${dayIndex}-${period}`}
                                                        className={`h-12 rounded-lg transition-colors flex justify-center items-center ${isAvailable && !booked
                                                            ? 'bg-[#7C3AED] border-[#7C3AED] shadow-inner text-white text-xs font-bold'
                                                            : booked
                                                                ? 'bg-gray-300 border-gray-300 opacity-50 cursor-not-allowed'
                                                                : 'bg-gray-50 border border-gray-100'
                                                            }`}
                                                    >
                                                        {isAvailable && !booked && '✓'}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* RIGHT SECTION — Booking Widget */}
                <div className="w-full lg:w-96 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:sticky lg:top-8">
                        {isBooked ? (
                            <div className="text-center py-8" data-testid="success-state">
                                <span className="text-6xl mb-4 block">🎉</span>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Booking Confirmed!
                                </h2>
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100 mb-6 text-left space-y-2">
                                    <p className="text-sm font-semibold text-green-900">
                                        Session Details:
                                    </p>
                                    <p className="text-sm text-green-800">
                                        <span className="font-medium">With:</span> {user.name}
                                    </p>
                                    <p className="text-sm text-green-800">
                                        <span className="font-medium">Type:</span>{' '}
                                        {selectedType?.replace('_', ' ')}
                                    </p>
                                    <p className="text-sm text-green-800">
                                        <span className="font-medium">Time:</span>{' '}
                                        {selectedSlot
                                            ? `${FULL_DAYS[selectedSlot.dayOfWeek]} ${selectedSlot.period.toLowerCase()}`
                                            : ''}
                                    </p>
                                    <div className="pt-2 mt-2 border-t border-green-200">
                                        <span className="text-sm font-semibold text-green-900 block mb-1">
                                            Meeting Link:
                                        </span>
                                        <a
                                            href={user.meetingLink || '#'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[#7C3AED] hover:underline text-sm font-medium break-all"
                                        >
                                            {user.meetingLink}
                                        </a>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium rounded-xl transition-colors"
                                >
                                    View in Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                                    Book a Session
                                </h2>

                                <div className="space-y-6">
                                    {/* Interview Type Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            1. What do you want to practice?
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            {user.interviewTypes.map((type: InterviewType) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setSelectedType(type)}
                                                    data-testid={`type-select-${type}`}
                                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left border-2 ${selectedType === type
                                                        ? 'bg-purple-50 border-[#7C3AED] text-[#7C3AED]'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#7C3AED] hover:bg-purple-50'
                                                        }`}
                                                >
                                                    {type.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time Slot Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            2. Choose a time
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            {user.availability.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">
                                                    No available slots.
                                                </p>
                                            ) : (
                                                user.availability
                                                    .filter((slot: TimeSlot) => !slot.isBooked)
                                                    .map((slot: TimeSlot) => (
                                                        <button
                                                            key={slot.id}
                                                            onClick={() => setSelectedSlot(slot)}
                                                            data-testid={`slot-select-${slot.id}`}
                                                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between border-2 ${selectedSlot?.id === slot.id
                                                                ? 'bg-purple-50 border-[#7C3AED] text-[#7C3AED]'
                                                                : 'bg-white border-gray-200 text-gray-700 hover:border-[#7C3AED] hover:bg-purple-50'
                                                                }`}
                                                        >
                                                            <span>{FULL_DAYS[slot.dayOfWeek]}</span>
                                                            <span
                                                                className={`text-xs ${selectedSlot?.id === slot.id ? 'opacity-100' : 'text-gray-500'}`}
                                                            >
                                                                {slot.period}
                                                            </span>
                                                        </button>
                                                    ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            3. Note to partner{' '}
                                            <span className="text-gray-400 font-normal">
                                                (Optional)
                                            </span>
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Hi! I'd love to go over a couple linked list problems..."
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none resize-none text-sm"
                                            rows={3}
                                            data-testid="booking-notes"
                                        />
                                    </div>

                                    <button
                                        onClick={handleBooking}
                                        disabled={!selectedType || !selectedSlot}
                                        data-testid="confirm-booking"
                                        className={`w-full px-6 py-3.5 rounded-xl font-bold text-white transition-all duration-200 ${!selectedType || !selectedSlot
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-[#7C3AED] hover:bg-[#6D28D9] shadow-md hover:shadow-lg'
                                            }`}
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
