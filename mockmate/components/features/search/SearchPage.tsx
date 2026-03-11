'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { searchPartners, type UserSearchResponse } from '@/app/actions/search';

const INTERVIEW_TYPES = ['Behavioral', 'Coding', 'System Design'];
const EXPERIENCE_LEVELS = ['Intern', 'New Grad', 'Experienced'];

export default function SearchPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [dateBounds] = useState(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return { min: todayStr, max: nextMonth.toISOString().split('T')[0] };
  });

  const [partners, setPartners] = useState<UserSearchResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    const result = await searchPartners({
      page,
      limit: 12,
      name: searchQuery,
      experienceLevel: selectedLevel,
      interviewType: selectedType,
      date: selectedDate,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setPartners(result.users);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
    }
    setIsLoading(false);
  }, [searchQuery, selectedLevel, selectedType, selectedDate]);

  useEffect(() => {
    // Debounce search query changes
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchPartners(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPartners]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedLevel('');
    setSelectedDate('');
  };

  const hasFilters = searchQuery || selectedType || selectedLevel || selectedDate;

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getLevelColor = (level: string | null) => {
    switch (level) {
      case 'Intern':
        return 'bg-blue-100 text-blue-800';
      case 'New Grad':
        return 'bg-green-100 text-green-800';
      case 'Experienced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-8 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Name Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search by name</label>
            <input
              type="text"
              placeholder="Type a name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              data-testid="search-input"
            />
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Availability Date</label>
            <input
              type="date"
              value={selectedDate}
              min={dateBounds.min}
              max={dateBounds.max}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              data-testid="date-input"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
            <div className="space-y-2">
              {EXPERIENCE_LEVELS.map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={level}
                    checked={selectedLevel === level}
                    onChange={() => setSelectedLevel(selectedLevel === level ? '' : level)}
                    className="accent-purple-600"
                    data-testid={`level-filter-${level.replace(' ', '-')}`}
                  />
                  <span className="text-sm text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Type</label>
            <div className="space-y-2">
              {INTERVIEW_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="interviewType"
                    value={type}
                    checked={selectedType === type}
                    onChange={() => setSelectedType(selectedType === type ? '' : type)}
                    className="accent-purple-600"
                    data-testid={`type-filter-${type.replace(' ', '-')}`}
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Results */}
      <main className="flex-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Find Partners</h1>
          <p className="text-gray-500 mt-1">
            {isLoading
              ? 'Searching...'
              : `${totalCount} partner${totalCount !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : partners.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-gray-700 font-semibold text-lg">No partners found</p>
            <p className="text-gray-500 mt-1 text-sm">
              Try adjusting your filters or search query.
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4"
                  onClick={() => router.push(`/search/${partner.id}`)}
                  data-testid={`partner-card-${partner.id}`}
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg shrink-0">
                      {getInitials(partner.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{partner.name || 'Anonymous'}</p>
                      {partner.experienceLevel && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getLevelColor(partner.experienceLevel)}`}>
                          {partner.experienceLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interview Types */}
                  {partner.interviewTypes && partner.interviewTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {partner.interviewTypes.map((type) => (
                        <span
                          key={type}
                          className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full font-medium"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    className="mt-auto w-full py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/search/${partner.id}`);
                    }}
                  >
                    View Profile & Book
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => fetchPartners(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchPartners(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
