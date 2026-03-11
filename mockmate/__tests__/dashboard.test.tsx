/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';

const mockPush = vi.fn();
const mockAccept = vi.fn();
const mockDecline = vi.fn();
const mockCancel = vi.fn();
const mockGetDashboard = vi.fn();

vi.mock('@/app/actions/dashboard', () => ({
    getDashboardData: (...args: unknown[]) => mockGetDashboard(...args),
    acceptSession: (...args: unknown[]) => mockAccept(...args),
    declineSession: (...args: unknown[]) => mockDecline(...args),
    cancelSession: (...args: unknown[]) => mockCancel(...args),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
}));

const DashboardPage = (await import('@/components/features/dashboard/DashboardPage')).default;

const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3); // 3 days from now

const mockSessionBase = {
    id: 'sess-1',
    hostId: 'host-1',
    guestId: 'guest-1',
    scheduledTime: futureDate,
    notes: null,
    message: null,
    host: { id: 'host-1', name: 'Alice Host', experienceLevel: 'New Grad', interviewTypes: ['Coding'], zoomLink: 'https://zoom.us/j/test' },
    guest: { id: 'guest-1', name: 'Bob Guest', experienceLevel: 'Intern', interviewTypes: ['Coding'], zoomLink: null },
};

const emptyData = { pendingReceived: [], pendingSent: [], upcoming: [], past: [] };

describe('DashboardPage — expanded coverage', () => {
    beforeEach(() => {
        mockGetDashboard.mockResolvedValue({ success: true, data: emptyData });
        mockAccept.mockResolvedValue({ success: true });
        mockDecline.mockResolvedValue({ success: true });
        mockCancel.mockResolvedValue({ success: true });
        mockPush.mockClear();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('shows error state if data fetch fails', async () => {
        mockGetDashboard.mockResolvedValue({ success: false, error: 'Server error loading data' });
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByText('Server error loading data')).toBeInTheDocument();
        });
    });

    it('navigates to /search when Find Partners is clicked', async () => {
        render(<DashboardPage />);
        await waitFor(() => expect(screen.getByText('Find Partners')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Find Partners'));
        expect(mockPush).toHaveBeenCalledWith('/search');
    });

    it('switches to Pending tab and shows pending received session with accept/decline buttons', async () => {
        mockGetDashboard.mockResolvedValue({
            success: true,
            data: {
                ...emptyData,
                pendingReceived: [{ ...mockSessionBase, status: 'PENDING' }],
            },
        });
        render(<DashboardPage />);
        await waitFor(() => expect(screen.getByText(/Pending Requests/)).toBeInTheDocument());

        fireEvent.click(screen.getByText(/Pending Requests/));

        await waitFor(() => {
            expect(screen.getByText('Accept')).toBeInTheDocument();
            expect(screen.getByText('Decline')).toBeInTheDocument();
        });
    });

    it('calls acceptSession and shows success message when Accept is clicked', async () => {
        mockGetDashboard.mockResolvedValue({
            success: true,
            data: {
                ...emptyData,
                pendingReceived: [{ ...mockSessionBase, status: 'PENDING' }],
            },
        });
        render(<DashboardPage />);
        await waitFor(() => expect(screen.getByText(/Pending Requests/)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Pending Requests/));

        await waitFor(() => expect(screen.getByText('Accept')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Accept'));

        await waitFor(() => {
            expect(mockAccept).toHaveBeenCalledWith('sess-1');
            expect(screen.getByText('Session accepted successfully')).toBeInTheDocument();
        });
    });

    it('calls declineSession and shows success message when Decline is clicked', async () => {
        mockGetDashboard.mockResolvedValue({
            success: true,
            data: {
                ...emptyData,
                pendingReceived: [{ ...mockSessionBase, status: 'PENDING' }],
            },
        });
        render(<DashboardPage />);
        await waitFor(() => expect(screen.getByText(/Pending Requests/)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Pending Requests/));

        await waitFor(() => expect(screen.getByText('Decline')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Decline'));

        await waitFor(() => {
            expect(mockDecline).toHaveBeenCalledWith('sess-1');
            expect(screen.getByText('Session declined')).toBeInTheDocument();
        });
    });

    it('shows an upcoming confirmed session with meeting link', async () => {
        mockGetDashboard.mockResolvedValue({
            success: true,
            data: {
                ...emptyData,
                upcoming: [{ ...mockSessionBase, status: 'SCHEDULED' }],
            },
        });
        render(<DashboardPage />);
        await waitFor(() => {
            expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
            expect(screen.getByText('https://zoom.us/j/test')).toBeInTheDocument();
        });
    });

    it('switches to Past tab and shows empty state', async () => {
        render(<DashboardPage />);
        await waitFor(() => expect(screen.getByText(/Past Interviews/)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Past Interviews/));
        await waitFor(() => {
            expect(screen.getByText(/No past interviews/i)).toBeInTheDocument();
        });
    });

    it('shows error message when acceptSession fails', async () => {
        mockAccept.mockResolvedValue({ success: false, error: 'Failed to accept session' });
        mockGetDashboard.mockResolvedValue({
            success: true,
            data: {
                ...emptyData,
                pendingReceived: [{ ...mockSessionBase, status: 'PENDING' }],
            },
        });
        render(<DashboardPage />);
        await waitFor(() => expect(screen.getByText(/Pending Requests/)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Pending Requests/));
        await waitFor(() => expect(screen.getByText('Accept')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Accept'));
        await waitFor(() => {
            expect(screen.getByText('Failed to accept session')).toBeInTheDocument();
        });
    });
});
