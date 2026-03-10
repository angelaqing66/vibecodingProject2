/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';

// Mock the server action
vi.mock('@/app/actions/dashboard', () => ({
    getDashboardData: vi.fn().mockResolvedValue({
        success: true,
        data: {
            pendingReceived: [],
            pendingSent: [],
            upcoming: [],
            past: [],
        },
    }),
    acceptSession: vi.fn().mockResolvedValue({ success: true }),
    declineSession: vi.fn().mockResolvedValue({ success: true }),
    cancelSession: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
    }),
}));

// Lazy import so mocks are set up first
const DashboardPage = (await import('@/components/features/dashboard/DashboardPage')).default;

describe('DashboardPage (backend-integrated)', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the loading state initially', () => {
        render(<DashboardPage />);
        expect(screen.getByText('Loading Dashboard...')).toBeInTheDocument();
    });

    it('renders the dashboard header after loading', async () => {
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByText('Your Dashboard')).toBeInTheDocument();
        });
    });

    it('renders the tab navigation', async () => {
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByText(/Upcoming Sessions/)).toBeInTheDocument();
            expect(screen.getByText(/Pending Requests/)).toBeInTheDocument();
            expect(screen.getByText(/Past Interviews/)).toBeInTheDocument();
        });
    });

    it('renders the Find Partners button', async () => {
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByText('Find Partners')).toBeInTheDocument();
        });
    });

    it('shows empty state message when there are no upcoming sessions', async () => {
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByText('No upcoming sessions. Time to find a partner!')).toBeInTheDocument();
        });
    });
});
