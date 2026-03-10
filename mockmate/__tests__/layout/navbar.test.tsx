/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import Navbar from '@/components/layout/Navbar';
import * as navigation from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
}));

describe('Navbar Layout', () => {
    beforeEach(() => {
        vi.mocked(navigation.usePathname).mockReturnValue('/dashboard');
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('renders logo and navigation links correctly', () => {
        render(<Navbar userName="Test User" role="STUDENT" />);

        expect(screen.getByTestId('nav-logo')).toBeInTheDocument();
        expect(screen.getByTestId('nav-link-search')).toBeInTheDocument();
        expect(screen.getByTestId('nav-link-dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('nav-link-profile')).toBeInTheDocument();
    });

    it('highlights active links appropriately', () => {
        vi.mocked(navigation.usePathname).mockReturnValue('/search');
        render(<Navbar userName="Test User" role="STUDENT" />);

        // Check active Search link
        const searchLink = screen.getByTestId('nav-link-search');
        expect(searchLink).toHaveClass('bg-[#EDE9FE]');
        expect(searchLink).toHaveClass('text-[#7C3AED]');

        // Dashboard should be inactive
        const dashboardLink = screen.getByTestId('nav-link-dashboard');
        expect(dashboardLink).not.toHaveClass('bg-[#EDE9FE]');
    });

    it('renders Admin link ONLY for ADMIN roles', () => {
        // 1. Student setup
        const { rerender } = render(<Navbar userName="Test User" role="STUDENT" />);
        expect(screen.queryByTestId('nav-link-admin')).not.toBeInTheDocument();

        // 2. Admin setup
        rerender(<Navbar userName="Admin User" role="ADMIN" />);
        expect(screen.getByTestId('nav-link-admin')).toBeInTheDocument();
    });

    it('handles NavDropdown interactions correctly', () => {
        render(<Navbar userName="Aisha Johnson" role="STUDENT" />);

        // Check initial extraction logic mapped to initials
        const avatarBtn = screen.getByTestId('nav-avatar-btn');
        expect(avatarBtn).toHaveTextContent('AJ');

        // Menu should be hidden natively
        expect(screen.queryByTestId('nav-dropdown-menu')).not.toBeInTheDocument();

        // Opening it
        fireEvent.click(avatarBtn);
        expect(screen.getByTestId('nav-dropdown-menu')).toBeInTheDocument();

        // Verify properties
        expect(screen.getByText('My Profile')).toHaveAttribute('href', '/profile');
        expect(screen.getByTestId('nav-signout-btn')).toBeInTheDocument();
    });

    it('handles NotificationBell interactions properly', () => {
        render(<Navbar userName="Test User" role="STUDENT" />);

        const bellBtn = screen.getByTestId('notification-bell-btn');

        // Initial badge check (hardcoded to 2) 
        expect(screen.getByTestId('notification-badge')).toHaveTextContent('2');

        // Displaying list
        fireEvent.click(bellBtn);
        expect(screen.getByTestId('notifications-list')).toBeInTheDocument();

        // Content properties
        expect(screen.getByText(/Alex Chen booked your Monday Morning slot/i)).toBeInTheDocument();
        expect(screen.getByText(/Your session with Priya Sharma is tomorrow/i)).toBeInTheDocument();

        // Simulate clicking mark read
        const markReadBtn = screen.getByTestId('mark-all-read-btn');
        fireEvent.click(markReadBtn);

        // Make sure badge dissipates
        expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
        expect(screen.getByText('No new notifications')).toBeInTheDocument();
    });
});
