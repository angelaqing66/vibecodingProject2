'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

const EXPERIENCE_LEVELS = ['', 'Intern', 'New Grad', 'Experienced'];
const INTERVIEW_TYPES = ['', 'Behavioral', 'Coding', 'System Design'];

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams() as unknown as URLSearchParams;

  // Use local state for the text input so it doesn't navigate on every keystroke
  const [nameQuery, setNameQuery] = useState(searchParams.get('name') || '');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset to page 1 on filter changes
      params.set('page', '1');
      return params.toString();
    },
    [searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${pathname}?${createQueryString('name', nameQuery)}`);
  };

  const handleSelectChange = (key: string, value: string) => {
    router.push(`${pathname}?${createQueryString(key, value)}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Find your match</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Name Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search by Name
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Jane Doe"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8A2BE2] focus:border-[#8A2BE2] outline-none transition duration-200"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </form>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <div className="relative">
            <select
              value={searchParams.get('experienceLevel') || ''}
              onChange={(e) =>
                handleSelectChange('experienceLevel', e.target.value)
              }
              className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8A2BE2] focus:border-[#8A2BE2] outline-none transition duration-200 bg-white"
            >
              <option value="">Any Experience</option>
              {EXPERIENCE_LEVELS.filter(Boolean).map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              ▼
            </span>
          </div>
        </div>

        {/* Interview Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interview Type
          </label>
          <div className="relative">
            <select
              value={searchParams.get('interviewType') || ''}
              onChange={(e) =>
                handleSelectChange('interviewType', e.target.value)
              }
              className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8A2BE2] focus:border-[#8A2BE2] outline-none transition duration-200 bg-white"
            >
              <option value="">Any Type</option>
              {INTERVIEW_TYPES.filter(Boolean).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              ▼
            </span>
          </div>
        </div>
      </div>

      {(searchParams.get('name') ||
        searchParams.get('experienceLevel') ||
        searchParams.get('interviewType')) && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setNameQuery('');
              router.push(pathname);
            }}
            className="text-sm text-gray-500 hover:text-gray-900 font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
