/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import DashboardPage from '@/components/features/dashboard/DashboardPage';

describe('DashboardPage', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the dashboard header and stats correctly', () => {
        render(<DashboardPage />);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Manage your mock interview sessions')).toBeInTheDocument();

        // Stats validations based on mock data
        // Total Completed = 2 (session-3, session-4)
        expect(screen.getByText('2')).toBeInTheDocument();

        // As Interviewee = 1 (session-3)
        // As Interviewer = 1 (session-4)
        const ones = screen.getAllByText('1');
        expect(ones.length).toBeGreaterThanOrEqual(2);
    });

    it('renders upcoming sessions with join links', () => {
        render(<DashboardPage />);

        expect(screen.getByText('Upcoming Sessions')).toBeInTheDocument();

        // session-1
        expect(screen.getByText('Mock Interview with James Park')).toBeInTheDocument();
        expect(screen.getByText('Friday evening')).toBeInTheDocument();
        expect(screen.getByText('"Preparing for Google SWE internship"')).toBeInTheDocument();
        expect(screen.getAllByText(/Interviewee/i)[0]).toBeInTheDocument();

        // session-2
        expect(screen.getByText('Mock Interview with Sofia Martinez')).toBeInTheDocument();
        expect(screen.getByText('Sunday afternoon')).toBeInTheDocument();
        expect(screen.getByText(/Behavioral/i)).toBeInTheDocument();

        // Check for Join Meeting links
        const joinLinks = screen.getAllByText('Join Meeting');
        expect(joinLinks).toHaveLength(2);
        expect(joinLinks[0].closest('a')).toHaveAttribute('href', 'https://zoom.us/j/111');
        expect(joinLinks[1].closest('a')).toHaveAttribute('href', 'https://zoom.us/j/222');
    });

    it('renders past sessions without join links but with status badges', () => {
        render(<DashboardPage />);

        expect(screen.getByText('Past Sessions')).toBeInTheDocument();

        // session-3 (completed, user is requester)
        expect(screen.getByText('Mock Interview with Kevin Wu')).toBeInTheDocument();
        expect(screen.getByText('Monday morning')).toBeInTheDocument();

        // session-4 (completed, user is partner)
        expect(screen.getByText('Mock Interview with Priya Sharma')).toBeInTheDocument();
        expect(screen.getByText('Tuesday evening')).toBeInTheDocument();
        expect(screen.getByText(/System Design/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Interviewer/i)[0]).toBeInTheDocument();

        // Should have "✓ Completed" badges
        const completedBadges = screen.getAllByText('✓ Completed');
        expect(completedBadges).toHaveLength(2);

        // They should not have Join Meeting links inside the Past Sessions section
        // (Only 2 join links on the whole page from the UPCOMING section)
        const joinLinks = screen.getAllByText('Join Meeting');
        expect(joinLinks).toHaveLength(2);
    });
});
