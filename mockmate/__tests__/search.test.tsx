/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';

// Mock the backend action
vi.mock('@/app/actions/search', () => ({
  searchPartners: vi.fn(),
}));

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

import { searchPartners } from '@/app/actions/search';
import SearchPage from '@/components/features/search/SearchPage';

const mockResult = {
  users: [
    { id: '1', name: 'Alex Chen', image: null, experienceLevel: 'New Grad', interviewTypes: ['Coding', 'System Design'], availability: [] },
    { id: '2', name: 'Priya Sharma', image: null, experienceLevel: 'Intern', interviewTypes: ['Behavioral', 'Coding'], availability: [] },
    { id: '3', name: 'James Park', image: null, experienceLevel: 'Experienced', interviewTypes: ['System Design'], availability: [] },
  ],
  totalCount: 3,
  totalPages: 1,
  currentPage: 1,
};

describe('SearchPage (backend-integrated)', () => {
  beforeEach(() => {
    vi.mocked(searchPartners).mockResolvedValue(mockResult);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the loading skeleton initially then shows partners', async () => {
    render(<SearchPage />);

    // Header should be there immediately
    expect(screen.getByText('Find Partners')).toBeInTheDocument();

    // Wait for partners to load
    await waitFor(() => {
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    });

    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('James Park')).toBeInTheDocument();
  });

  it('shows the correct total count after loading', async () => {
    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByText('3 partners found')).toBeInTheDocument();
    });
  });

  it('renders partner cards with experience level badges', async () => {
    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByText('New Grad')).toBeInTheDocument();
      expect(screen.getByText('Intern')).toBeInTheDocument();
      expect(screen.getByText('Experienced')).toBeInTheDocument();
    });
  });

  it('renders View Profile & Book buttons for each partner', async () => {
    render(<SearchPage />);
    await waitFor(() => {
      const viewButtons = screen.getAllByText('View Profile & Book');
      expect(viewButtons).toHaveLength(3);
    });
  });

  it('shows empty state when no partners found', async () => {
    vi.mocked(searchPartners).mockResolvedValue({
      users: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    });

    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByText('No partners found')).toBeInTheDocument();
    });
  });

  it('shows search input and filter controls', async () => {
    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    });
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByText('Experience Level')).toBeInTheDocument();
    expect(screen.getByText('Interview Type')).toBeInTheDocument();
  });
});
