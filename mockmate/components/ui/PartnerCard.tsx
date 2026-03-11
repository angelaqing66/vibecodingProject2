'use client';

import Image from 'next/image';
import { useState } from 'react';
import { UserSearchResponse } from '@/app/actions/search';
import { BookingModal } from '@/components/booking-modal';

interface PartnerCardProps {
  user: UserSearchResponse;
}

export function PartnerCard({ user }: PartnerCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:shadow-md transition-shadow duration-200">
      {/* Avatar */}
      <div className="flex-shrink-0 relative w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-2xl overflow-hidden border border-purple-200">
        {user.image ? (
          <Image
            src={user.image}
            alt={`${user.name}'s avatar`}
            fill
            className="object-cover"
          />
        ) : (
          <span>{user.name?.charAt(0).toUpperCase() || '?'}</span>
        )}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 space-y-1 mb-1">
          <h3 className="text-xl font-bold text-gray-900 truncate">
            {user.name || 'Anonymous User'}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
            {user.experienceLevel}
          </span>
        </div>

        {/* Interview Types tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {user.interviewTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Action Area */}
      <div className="w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto px-6 py-3 bg-[#8A2BE2] hover:bg-[#7924c7] text-white font-medium rounded-xl shadow-sm transition-colors duration-200 flex justify-center items-center gap-2"
        >
          <span className="text-lg">📅</span> Book Session
        </button>
      </div>

      {isModalOpen && (
        <BookingModal
          partner={{
            id: user.id,
            name: user.name,
            experienceLevel: user.experienceLevel,
            interviewTypes: user.interviewTypes || [],
            availability: user.availability || [],
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
