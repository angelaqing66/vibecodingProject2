'use client';

import React, { useState } from 'react';
import { User, Level, InterviewType, Period, TimeSlot } from '@/types';

const mockUser: User = {
  id: 'mock-1',
  name: 'Vartika Singh',
  email: 'vartika@university.edu',
  bio: 'CS student preparing for SWE roles at top tech companies.',
  level: 'NEW_GRAD',
  interviewTypes: ['CODING', 'SYSTEM_DESIGN'],
  companies: ['Google', 'Meta'],
  meetingLink: 'https://zoom.us/j/123456789',
  role: 'STUDENT',
  availability: [
    { id: 'slot-1', dayOfWeek: 0, period: 'MORNING', isBooked: false },
    { id: 'slot-2', dayOfWeek: 2, period: 'EVENING', isBooked: false },
  ],
  createdAt: '2025-01-15',
};

const LEVELS: Level[] = ['INTERN', 'NEW_GRAD', 'EXPERIENCED'];
const INTERVIEW_TYPES: InterviewType[] = [
  'BEHAVIORAL',
  'CODING',
  'SYSTEM_DESIGN',
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PERIODS: Period[] = ['MORNING', 'AFTERNOON', 'EVENING'];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User>(mockUser);

  // Edit states
  const [bio, setBio] = useState(user.bio || '');
  const [level, setLevel] = useState<Level>(user.level);
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>(
    user.interviewTypes
  );
  const [companies, setCompanies] = useState<string[]>(user.companies);
  const [newCompany, setNewCompany] = useState('');
  const [availability, setAvailability] = useState<TimeSlot[]>(
    user.availability
  );
  const [meetingLink, setMeetingLink] = useState(user.meetingLink || '');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = () => {
    setUser({
      ...user,
      bio,
      level,
      interviewTypes,
      companies,
      availability,
      meetingLink,
    });
    setIsEditing(false);
  };

  const toggleInterviewType = (type: InterviewType) => {
    setInterviewTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const addCompany = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newCompany.trim() !== '') {
      e.preventDefault();
      if (!companies.includes(newCompany.trim())) {
        setCompanies([...companies, newCompany.trim()]);
      }
      setNewCompany('');
    }
  };

  const removeCompany = (companyToRemove: string) => {
    setCompanies(companies.filter((c) => c !== companyToRemove));
  };

  const toggleAvailability = (dayIndex: number, period: Period) => {
    setAvailability((prev) => {
      const existingIdx = prev.findIndex(
        (slot) => slot.dayOfWeek === dayIndex && slot.period === period
      );
      if (existingIdx >= 0) {
        // Remove if exists
        return prev.filter((_, idx) => idx !== existingIdx);
      } else {
        // Add if doesn't exist
        return [
          ...prev,
          {
            id: `new-slot-${Date.now()}`,
            dayOfWeek: dayIndex,
            period,
            isBooked: false,
          },
        ];
      }
    });
  };

  const hasSlot = (dayIndex: number, period: Period) => {
    return availability.some(
      (slot) => slot.dayOfWeek === dayIndex && slot.period === period
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-2xl font-bold shrink-0">
              {getInitials(user.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="px-6 py-2.5 rounded-full font-medium transition-colors cursor-pointer"
            data-testid="edit-save-button"
            style={{
              backgroundColor: isEditing ? '#7C3AED' : '#f3f4f6',
              color: isEditing ? 'white' : '#374151',
            }}
          >
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
        </div>

        <div className="space-y-8">
          {/* Bio */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Bio</h2>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                rows={3}
                data-testid="bio-input"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {user.bio || 'No bio added yet.'}
              </p>
            )}
          </section>

          {/* Experience Level & Interview Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Experience Level
              </h2>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    disabled={!isEditing}
                    onClick={() => setLevel(lvl)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      level === lvl
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                        : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {lvl.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Interview Types
              </h2>
              <div className="flex flex-wrap gap-2">
                {INTERVIEW_TYPES.map((type) => (
                  <button
                    key={type}
                    disabled={!isEditing}
                    onClick={() => toggleInterviewType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      interviewTypes.includes(type)
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                        : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Target Companies */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Target Companies
            </h2>
            <div className="flex flex-wrap gap-2 items-center">
              {companies.map((company) => (
                <span
                  key={company}
                  className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium flex items-center gap-2"
                >
                  {company}
                  {isEditing && (
                    <button
                      onClick={() => removeCompany(company)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none"
                      aria-label={`Remove ${company}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
              {isEditing && (
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  onKeyDown={addCompany}
                  placeholder="Type & press enter..."
                  className="px-4 py-1.5 text-sm rounded-full border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  data-testid="company-input"
                />
              )}
              {!isEditing && companies.length === 0 && (
                <span className="text-gray-500 italic">None specified</span>
              )}
            </div>
          </section>

          {/* Meeting Link */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Meeting Link
            </h2>
            {isEditing ? (
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="e.g. https://zoom.us/j/your-link"
                className="w-full md:w-1/2 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                data-testid="meeting-link-input"
              />
            ) : (
              <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 inline-block">
                {user.meetingLink ? (
                  <a
                    href={user.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 hover:text-purple-700 hover:underline font-medium"
                  >
                    {user.meetingLink}
                  </a>
                ) : (
                  <span className="text-gray-500 italic">No link provided</span>
                )}
              </div>
            )}
          </section>

          {/* Availability Grid */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Availability
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
                      const selected = hasSlot(dayIndex, period);
                      return (
                        <button
                          key={`${dayIndex}-${period}`}
                          disabled={!isEditing}
                          onClick={() => toggleAvailability(dayIndex, period)}
                          className={`h-12 rounded-lg transition-all duration-200 ${
                            selected
                              ? 'bg-purple-500 border-purple-600 shadow-inner'
                              : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                          } ${!isEditing && !selected ? 'opacity-30' : ''}`}
                          aria-label={`${selected ? 'Remove' : 'Add'} ${period} on day ${dayIndex}`}
                          data-testid={`slot-${dayIndex}-${period}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
