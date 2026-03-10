/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import AdminPage from '@/components/features/admin/AdminPage';

describe('AdminPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders admin badge and default overview tab correctly', () => {
    render(<AdminPage />);

    // Header check
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByTestId('admin-badge')).toHaveTextContent('Admin');

    // Overview metrics
    expect(screen.getByText('248')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('89%')).toBeInTheDocument();

    // Chart check
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('toggles tabs and renders Users and Sessions', () => {
    render(<AdminPage />);

    // Switch to Users
    const usersTab = screen.getByTestId('tab-Users');
    fireEvent.click(usersTab);

    expect(screen.getByTestId('users-table')).toBeInTheDocument();
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    expect(screen.getByText('priya@stanford.edu')).toBeInTheDocument();

    // Switch to Sessions
    const sessionsTab = screen.getByTestId('tab-Sessions');
    fireEvent.click(sessionsTab);

    expect(screen.getByTestId('sessions-table')).toBeInTheDocument();

    // Check elements in sessions
    expect(screen.getByText('SYSTEM DESIGN')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('filters users correctly via search input', () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByTestId('tab-Users'));

    const searchInput = screen.getByTestId('user-search');
    fireEvent.change(searchInput, { target: { value: 'Sofia' } });

    expect(screen.getByText('Sofia Martinez')).toBeInTheDocument();
    // Alex Chen should disappear
    expect(screen.queryByText('Alex Chen')).not.toBeInTheDocument();
  });

  it('toggles Suspend/Restore state for individuals', () => {
    render(<AdminPage />);
    fireEvent.click(screen.getByTestId('tab-Users'));

    // Click suspend on user 1
    const suspendBtn = screen.getByTestId('suspend-btn-1');
    expect(suspendBtn).toHaveTextContent('Suspend');

    fireEvent.click(suspendBtn);
    expect(suspendBtn).toHaveTextContent('Restore');

    fireEvent.click(suspendBtn);
    expect(suspendBtn).toHaveTextContent('Suspend');
  });
});
