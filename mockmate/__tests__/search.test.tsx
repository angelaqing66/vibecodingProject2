/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import SearchPage from '@/components/features/search/SearchPage';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('SearchPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders correctly with all mock partners initially', () => {
    render(<SearchPage />);

    expect(screen.getByText('Find a Practice Partner')).toBeInTheDocument();

    // We should see 6 results initially based on mockPartners array
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('filters results instantly based on text input', () => {
    render(<SearchPage />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Alex Chen' } });

    // Only 1 result now
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    // James Park should not be in the document
    expect(screen.queryByText('James Park')).not.toBeInTheDocument();
  });

  it('filters results instantly based on checkboxes', () => {
    render(<SearchPage />);

    // Check INTERN box
    const internCheckbox = screen.getByTestId('filter-level-INTERN');
    fireEvent.click(internCheckbox);

    // Kevin Wu and Priya Sharma
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('Kevin Wu')).toBeInTheDocument();
    expect(screen.queryByText('Alex Chen')).not.toBeInTheDocument();
  });

  it('shows empty state when no results match', () => {
    render(<SearchPage />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, {
      target: { value: 'ThisStringWillNotMatchAnything' },
    });

    expect(screen.getByText('No partners found')).toBeInTheDocument();
    expect(screen.queryByTestId('partner-card')).not.toBeInTheDocument();
  });

  it('clears all filters when clear button is clicked', () => {
    render(<SearchPage />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, {
      target: { value: 'ThisStringWillNotMatchAnything' },
    });

    expect(screen.getByText('No partners found')).toBeInTheDocument();

    const clearBtn = screen.getByTestId('clear-filters');
    fireEvent.click(clearBtn);

    // Should be back to 6
    expect(screen.getByText('6')).toBeInTheDocument();
  });
});
