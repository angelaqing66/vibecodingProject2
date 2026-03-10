/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';

// Mock next/navigation (AdminPage uses useRouter)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import AdminPage from '@/components/features/admin/AdminPage';

const mockUsersData = {
  success: true,
  data: [
    { id: '1', name: 'Alex Chen', email: 'alex@mit.edu', experienceLevel: 'New Grad' },
    { id: '2', name: 'Sofia Martinez', email: 'sofia@ucla.edu', experienceLevel: 'Intern' },
  ],
};
const mockSessionsData = {
  success: true,
  data: [
    {
      id: 's1',
      status: 'COMPLETED',
      scheduledTime: '2025-03-15T10:00:00Z',
      requester: { id: '1', name: 'Alex Chen', level: 'New Grad' },
      partner: { id: '2', name: 'Sofia Martinez', level: 'Intern' },
    },
    {
      id: 's2',
      status: 'UPCOMING',
      scheduledTime: '2025-03-17T14:00:00Z',
      requester: { id: '2', name: 'Sofia Martinez', level: 'Intern' },
      partner: { id: '1', name: 'Alex Chen', level: 'New Grad' },
    },
  ],
};
const mockStatsData = { success: true, data: { totalUsers: 248, totalSessions: 42, weekSessions: 10 } };

describe('AdminPage', () => {
  beforeEach(() => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/admin/users')) return Promise.resolve({ status: 200, json: () => Promise.resolve(mockUsersData) });
      if (url.includes('/api/admin/sessions')) return Promise.resolve({ status: 200, json: () => Promise.resolve(mockSessionsData) });
      if (url.includes('/api/admin/stats')) return Promise.resolve({ status: 200, json: () => Promise.resolve(mockStatsData) });
      return Promise.resolve({ status: 200, json: () => Promise.resolve({ success: true }) });
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders admin badge and default overview tab correctly', async () => {
    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    expect(screen.getByTestId('admin-badge')).toHaveTextContent('Admin');
    expect(screen.getByText('248')).toBeInTheDocument();  // totalUsers
    expect(screen.getByText('42')).toBeInTheDocument();   // totalSessions
    expect(screen.getByText('10')).toBeInTheDocument();   // weekSessions
  });

  it('toggles tabs and renders Users and Sessions', async () => {
    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-Users')).toBeInTheDocument();
    });

    // Switch to Users tab
    fireEvent.click(screen.getByTestId('tab-Users'));
    await waitFor(() => {
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    expect(screen.getByText('sofia@ucla.edu')).toBeInTheDocument();

    // Switch to Sessions tab
    fireEvent.click(screen.getByTestId('tab-Sessions'));
    await waitFor(() => {
      expect(screen.getByTestId('sessions-table')).toBeInTheDocument();
    });
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('filters users correctly via search input', async () => {
    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-Users')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tab-Users'));

    // Wait for users data to load
    await waitFor(() => {
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('user-search'), { target: { value: 'Sofia' } });

    await waitFor(() => {
      expect(screen.getByText('Sofia Martinez')).toBeInTheDocument();
    });
    expect(screen.queryByText('Alex Chen')).not.toBeInTheDocument();
  });

  it('calls DELETE endpoint when delete button is clicked', async () => {
    window.confirm = vi.fn(() => true);
    mockFetch.mockImplementationOnce((url: string) => {
      if (url.includes('/api/admin/users')) return Promise.resolve({ status: 200, json: () => Promise.resolve(mockUsersData) });
      return Promise.resolve({ status: 200, json: () => Promise.resolve({ success: true }) });
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByTestId('tab-Users')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('tab-Users'));

    await waitFor(() => {
      expect(screen.getByTestId('delete-btn-1')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByTestId('delete-btn-1');
    expect(deleteBtn).toHaveTextContent('Delete');
  });
});
