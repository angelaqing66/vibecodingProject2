'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { User, Level, InterviewType } from '@/types';

const mockPartners: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    level: 'NEW_GRAD',
    interviewTypes: ['CODING', 'SYSTEM_DESIGN'],
    companies: ['Google', 'Meta'],
    bio: 'CS grad from MIT, prepping for big tech.',
    meetingLink: 'https://zoom.us/j/111',
    role: 'STUDENT',
    availability: [
      { id: 's1', dayOfWeek: 0, period: 'MORNING', isBooked: false },
    ],
    createdAt: '2025-01-15',
    email: 'alex@mit.edu',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    level: 'INTERN',
    interviewTypes: ['BEHAVIORAL', 'CODING'],
    companies: ['Amazon'],
    bio: 'Junior at Stanford looking for coding practice.',
    meetingLink: 'https://zoom.us/j/222',
    role: 'STUDENT',
    availability: [
      { id: 's2', dayOfWeek: 1, period: 'AFTERNOON', isBooked: false },
    ],
    createdAt: '2025-01-22',
    email: 'priya@stanford.edu',
  },
  {
    id: '3',
    name: 'James Park',
    level: 'EXPERIENCED',
    interviewTypes: ['SYSTEM_DESIGN'],
    companies: ['Meta', 'Apple'],
    bio: '5 years at FAANG, happy to help with system design.',
    meetingLink: 'https://zoom.us/j/333',
    role: 'STUDENT',
    availability: [
      { id: 's3', dayOfWeek: 4, period: 'EVENING', isBooked: false },
    ],
    createdAt: '2024-12-10',
    email: 'james@berkeley.edu',
  },
  {
    id: '4',
    name: 'Sofia Martinez',
    level: 'NEW_GRAD',
    interviewTypes: ['BEHAVIORAL', 'CODING', 'SYSTEM_DESIGN'],
    companies: ['Google'],
    bio: 'Recent grad preparing for all interview types.',
    meetingLink: 'https://zoom.us/j/444',
    role: 'STUDENT',
    availability: [
      { id: 's4', dayOfWeek: 0, period: 'EVENING', isBooked: false },
    ],
    createdAt: '2025-02-01',
    email: 'sofia@ucla.edu',
  },
  {
    id: '5',
    name: 'Kevin Wu',
    level: 'INTERN',
    interviewTypes: ['CODING'],
    companies: ['Amazon', 'Microsoft'],
    bio: 'Junior CS student preparing for summer internships.',
    meetingLink: 'https://zoom.us/j/555',
    role: 'STUDENT',
    availability: [
      { id: 's5', dayOfWeek: 2, period: 'MORNING', isBooked: false },
    ],
    createdAt: '2025-02-08',
    email: 'kevin@cmu.edu',
  },
  {
    id: '6',
    name: 'Aisha Johnson',
    level: 'EXPERIENCED',
    interviewTypes: ['BEHAVIORAL', 'SYSTEM_DESIGN'],
    companies: ['Apple', 'Netflix'],
    bio: 'Senior engineer helping others ace their interviews.',
    meetingLink: 'https://zoom.us/j/666',
    role: 'STUDENT',
    availability: [
      { id: 's6', dayOfWeek: 1, period: 'EVENING', isBooked: false },
    ],
    createdAt: '2024-12-20',
    email: 'aisha@columbia.edu',
  },
];

const INTERVIEW_TYPES: InterviewType[] = [
  'BEHAVIORAL',
  'CODING',
  'SYSTEM_DESIGN',
];
const EXPERIENCE_LEVELS: Level[] = ['INTERN', 'NEW_GRAD', 'EXPERIENCED'];
const TARGET_COMPANIES = [
  'Google',
  'Meta',
  'Amazon',
  'Apple',
  'Microsoft',
  'Netflix',
];
const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function SearchPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<InterviewType[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<Level[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const filteredPartners = useMemo(() => {
    return mockPartners.filter((partner) => {
      // Name or Bio Match
      const matchesQuery =
        searchQuery === '' ||
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (partner.bio &&
          partner.bio.toLowerCase().includes(searchQuery.toLowerCase()));

      // Interview Types Match (if any selected, partner must have AT LEAST ONE of selected)
      const matchesTypes =
        selectedTypes.length === 0 ||
        partner.interviewTypes.some((t) => selectedTypes.includes(t));

      // Experience Level Match
      const matchesLevel =
        selectedLevels.length === 0 || selectedLevels.includes(partner.level);

      // Companies Match
      const matchesCompany =
        selectedCompanies.length === 0 ||
        partner.companies.some((c) => selectedCompanies.includes(c));

      return matchesQuery && matchesTypes && matchesLevel && matchesCompany;
    });
  }, [searchQuery, selectedTypes, selectedLevels, selectedCompanies]);

  const toggleFilter = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    value: T
  ) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedLevels([]);
    setSelectedCompanies([]);
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="md:sticky md:top-24 space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Name or bio keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-all"
              data-testid="search-input"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Interview Type
            </h3>
            <div className="space-y-2">
              {INTERVIEW_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleFilter(setSelectedTypes, type)}
                    className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] border-gray-300"
                    data-testid={`filter-type-${type}`}
                  />
                  <span className="text-sm text-gray-700">
                    {type.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Experience Level
            </h3>
            <div className="space-y-2">
              {EXPERIENCE_LEVELS.map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(level)}
                    onChange={() => toggleFilter(setSelectedLevels, level)}
                    className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] border-gray-300"
                    data-testid={`filter-level-${level}`}
                  />
                  <span className="text-sm text-gray-700">
                    {level.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Company
            </h3>
            <div className="space-y-2">
              {TARGET_COMPANIES.map((company) => (
                <label
                  key={company}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company)}
                    onChange={() => toggleFilter(setSelectedCompanies, company)}
                    className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] border-gray-300"
                    data-testid={`filter-company-${company}`}
                  />
                  <span className="text-sm text-gray-700">{company}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="text-sm font-medium text-gray-500 hover:text-[#7C3AED] transition-colors"
            data-testid="clear-filters"
          >
            Clear all filters
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Find a Practice Partner
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Showing{' '}
            <span className="text-gray-900 font-bold">
              {filteredPartners.length}
            </span>{' '}
            result{filteredPartners.length !== 1 && 's'}
          </p>
        </div>

        {filteredPartners.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center h-96">
            <span className="text-6xl mb-4">🕵️‍♀️</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No partners found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters to see more results.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-full transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-6 flex flex-col h-full group"
                data-testid="partner-card"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-[#7C3AED] text-xl font-bold shrink-0">
                    {getInitials(partner.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {partner.name}
                    </h3>
                    <span
                      className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold ${getLevelColor(partner.level)}`}
                    >
                      {partner.level.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {partner.bio}
                </p>

                <div className="mt-auto space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Interview Focus
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {partner.interviewTypes.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                        >
                          {type.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {partner.companies.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Target Companies
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {partner.companies.map((co) => (
                          <span key={co} className="text-xs text-gray-600">
                            {co}
                            {co !==
                              partner.companies[partner.companies.length - 1] &&
                              ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-500 block text-xs mb-0.5">
                        Next available
                      </span>
                      {partner.availability.length > 0 ? (
                        <span className="font-medium text-gray-900">
                          {DAYS[partner.availability[0].dayOfWeek]}{' '}
                          {partner.availability[0].period.toLowerCase()}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">None</span>
                      )}
                    </div>
                    <button
                      onClick={() => router.push(`/search/${partner.id}`)}
                      className="px-4 py-2 bg-[#7C3AED] text-white text-sm font-medium rounded-lg hover:bg-[#6D28D9] transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
