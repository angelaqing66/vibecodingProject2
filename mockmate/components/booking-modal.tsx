'use client';

import { useState } from 'react';
import { bookSession } from '@/app/actions/booking';
import { Calendar, Clock, X, CheckCircle2 } from 'lucide-react';

interface Partner {
  id: string;
  name: string | null;
  experienceLevel: string | null;
  interviewTypes: string[];
  availability: string[];
}

interface BookingModalProps {
  partner: Partner;
  onClose: () => void;
}

export function BookingModal({ partner, onClose }: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Group availability by date
  const slotsByDate = partner.availability.reduce(
    (acc, slotIso) => {
      const date = new Date(slotIso);
      const dateKey = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(date);

      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(slotIso);
      return acc;
    },
    {} as Record<string, string[]>
  );

  // Sort dates chronologically
  const sortedDates = Object.keys(slotsByDate).sort((a, b) => {
    return (
      new Date(slotsByDate[a][0]).getTime() -
      new Date(slotsByDate[b][0]).getTime()
    );
  });

  const handleBook = async () => {
    if (!selectedSlot) return;

    setStatus('loading');
    setErrorMessage('');

    const res = await bookSession({
      hostId: partner.id,
      scheduledTime: selectedSlot,
      message: message.trim() || null,
    });

    if (res.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(res.error || 'Failed to book session');
    }
  };

  const name = partner.name || 'this partner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-[#F3F4FE]/50 relative shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-[#0B1527]">
              Book a Session
            </h2>
            <p className="text-gray-500 text-sm mt-1">with {partner.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors absolute top-4 right-4 shadow-sm border border-transparent hover:border-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Request Sent!
              </h3>
              <p className="text-gray-500 max-w-sm">
                We&apos;ve notified {partner.name}. You can track the status in
                your Dashboard.
              </p>
              <button
                onClick={onClose}
                className="mt-6 bg-[#8A2BE2] hover:bg-[#7924c7] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Select Time */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#8A2BE2]" />
                  Select Date & Time
                </h3>

                {sortedDates.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 border border-dashed border-gray-200">
                    <p>No available times right now.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedDates.map((dateLabel) => (
                      <div key={dateLabel}>
                        <h4 className="text-sm font-semibold text-gray-500 mb-3 border-b border-gray-100 pb-1">
                          {dateLabel}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {slotsByDate[dateLabel]
                            .sort(
                              (a, b) =>
                                new Date(a).getTime() - new Date(b).getTime()
                            )
                            .map((slotIso) => {
                              const timeStr = new Intl.DateTimeFormat('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              }).format(new Date(slotIso));
                              const isSelected = selectedSlot === slotIso;

                              return (
                                <button
                                  key={slotIso}
                                  onClick={() => setSelectedSlot(slotIso)}
                                  className={`
                                  py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-1.5 border-2
                                  ${
                                    isSelected
                                      ? 'border-[#8A2BE2] bg-purple-50 text-[#8A2BE2] shadow-sm'
                                      : 'border-gray-100 hover:border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                                  }
                                `}
                                >
                                  {isSelected && (
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  )}
                                  {timeStr}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Box */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8A2BE2]" />
                  Introduction (Optional)
                </h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi ${name}, I'm preparing for a System Design loop and would love to practice...`}
                  className="w-full text-base bg-white border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#8A2BE2]/20 focus:border-[#8A2BE2] p-4 transition-colors resize-none placeholder-gray-400"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
                  <span>Keep it friendly & brief</span>
                  <span>{message.length} / 500</span>
                </div>
              </div>
            </>
          )}

          {errorMessage && status === 'error' && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 font-medium">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        {status !== 'success' && (
          <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-3 font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              disabled={status === 'loading'}
            >
              Cancel
            </button>
            <button
              onClick={handleBook}
              disabled={!selectedSlot || status === 'loading'}
              className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                ${
                  !selectedSlot || status === 'loading'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#8A2BE2] text-white hover:bg-[#7924c7] shadow-md active:scale-95'
                }
              `}
            >
              {status === 'loading' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
