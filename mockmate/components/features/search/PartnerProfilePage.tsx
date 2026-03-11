'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPartnerById, type PartnerProfile } from '@/app/actions/search';
import { bookSession } from '@/app/actions/booking';



export default function PartnerProfilePage({ partnerId }: { partnerId: string }) {
    const router = useRouter();

    const [partner, setPartner] = useState<PartnerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null); // ISO string
    const [notes, setNotes] = useState('');
    const [isBooked, setIsBooked] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [confirmedMeetingLink, setConfirmedMeetingLink] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const res = await getPartnerById(partnerId);
            if (res.success && res.partner) {
                setPartner(res.partner);
            } else {
                setError(res.error || 'Failed to load partner profile');
            }
            setIsLoading(false);
        }
        load();
    }, [partnerId]);

    const getInitials = (name: string | null) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const getLevelColor = (level: string | null) => {
        switch (level) {
            case 'Intern': return 'bg-blue-100 text-blue-800';
            case 'New Grad': return 'bg-green-100 text-green-800';
            case 'Experienced': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatSlot = (iso: string) => {
        try {
            const d = new Date(iso);
            return new Intl.DateTimeFormat('en-US', {
                weekday: 'long', month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit',
            }).format(d);
        } catch {
            return iso;
        }
    };

    const handleBooking = async () => {
        if (!selectedType || !selectedSlot || !partner) return;
        setIsBooking(true);
        setBookingError(null);

        try {
            const result = await bookSession({
                hostId: partner.id,
                scheduledTime: selectedSlot,
                message: notes.trim() || undefined,
            });

            if (!result.success) {
                setBookingError(result.error || 'Failed to book session. Please try again.');
                setIsBooking(false);
                return;
            }

            // Success — show success message and meeting link
            setConfirmedMeetingLink(partner.zoomLink ?? null);
            setPartner((prev) =>
                prev ? { ...prev, availability: prev.availability.filter((a) => a !== selectedSlot) } : prev
            );
            setIsBooked(true);
        } catch {
            setBookingError('Network error. Please try again.');
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-32" />
                    <div className="bg-white rounded-xl p-8 space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-gray-200 rounded-full" />
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-48" />
                                <div className="h-4 bg-gray-200 rounded w-24" />
                            </div>
                        </div>
                        <div className="h-20 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !partner) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => router.push('/search')}
                    className="text-[#7C3AED] hover:text-[#5B21B6] font-medium flex items-center gap-2 mb-8"
                    data-testid="back-button"
                >
                    ← Back to Search
                </button>
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-8 text-center">
                    <p className="font-semibold text-lg mb-2">Partner not found</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

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
                {/* LEFT — Partner Profile */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        {/* Header */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center text-[#7C3AED] text-3xl font-bold shrink-0">
                                {getInitials(partner.name)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {partner.name || 'Anonymous'}
                                </h1>
                                {partner.experienceLevel && (
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getLevelColor(partner.experienceLevel)}`}>
                                        {partner.experienceLevel}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Interview Types */}
                        {partner.interviewTypes && partner.interviewTypes.length > 0 && (
                            <section className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Interview Types</h2>
                                <div className="flex flex-wrap gap-2">
                                    {partner.interviewTypes.map((type) => (
                                        <span key={type} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Availability */}
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Times</h2>
                            {partner.availability && partner.availability.length > 0 ? (
                                <div className="space-y-2">
                                    {partner.availability.map((iso, idx) => (
                                        <div key={idx} className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-2.5 text-sm text-purple-800 font-medium">
                                            📅 {formatSlot(iso)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-sm">No availability set yet.</p>
                            )}
                        </section>
                    </div>
                </div>

                {/* RIGHT — Booking Widget */}
                <div className="w-full lg:w-96 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:sticky lg:top-8">
                        {isBooked ? (
                            <div className="text-center py-8" data-testid="success-state">
                                <span className="text-6xl mb-4 block">🎉</span>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Requested!</h2>
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100 mb-6 text-left space-y-2">
                                    <p className="text-sm font-semibold text-green-900">Session Details:</p>
                                    <p className="text-sm text-green-800">
                                        <span className="font-medium">With:</span> {partner.name}
                                    </p>
                                    <p className="text-sm text-green-800">
                                        <span className="font-medium">Type:</span> {selectedType}
                                    </p>
                                    {selectedSlot && (
                                        <p className="text-sm text-green-800">
                                            <span className="font-medium">Time:</span> {formatSlot(selectedSlot)}
                                        </p>
                                    )}
                                    {confirmedMeetingLink && (
                                        <div className="pt-2 mt-2 border-t border-green-200">
                                            <span className="text-sm font-semibold text-green-900 block mb-1">Meeting Link:</span>
                                            <a href={confirmedMeetingLink} target="_blank" rel="noreferrer"
                                                className="text-[#7C3AED] hover:underline text-sm font-medium break-all">
                                                {confirmedMeetingLink}
                                            </a>
                                        </div>
                                    )}
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
                                    {/* Interview Type */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            1. What do you want to practice?
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            {(partner.interviewTypes || []).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setSelectedType(type)}
                                                    data-testid={`type-select-${type}`}
                                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left border-2 ${selectedType === type
                                                        ? 'bg-purple-50 border-[#7C3AED] text-[#7C3AED]'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#7C3AED] hover:bg-purple-50'
                                                        }`}
                                                >
                                                    {type}
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
                                            {partner.availability && partner.availability.length > 0 ? (
                                                partner.availability.map((iso) => (
                                                    <button
                                                        key={iso}
                                                        onClick={() => setSelectedSlot(iso)}
                                                        data-testid={`slot-select-${iso}`}
                                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all text-left border-2 ${selectedSlot === iso
                                                            ? 'bg-purple-50 border-[#7C3AED] text-[#7C3AED]'
                                                            : 'bg-white border-gray-200 text-gray-700 hover:border-[#7C3AED] hover:bg-purple-50'
                                                            }`}
                                                    >
                                                        {formatSlot(iso)}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">No available slots.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            3. Note to partner <span className="text-gray-400 font-normal">(Optional)</span>
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

                                    {/* Booking Error */}
                                    {bookingError && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-medium" data-testid="booking-error">
                                            ⚠️ {bookingError}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleBooking}
                                        disabled={!selectedType || !selectedSlot || isBooking}
                                        data-testid="confirm-booking"
                                        className={`w-full px-6 py-3.5 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 ${!selectedType || !selectedSlot || isBooking
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-[#7C3AED] hover:bg-[#6D28D9] shadow-md hover:shadow-lg'
                                            }`}
                                    >
                                        {isBooking ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Booking...
                                            </>
                                        ) : 'Confirm Booking'}
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
