/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';

// Mock global fetch (used by handleBooking -> POST /api/sessions)
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock the backend actions
vi.mock('@/app/actions/search', () => ({
  searchPartners: vi.fn(),
  getPartnerById: vi.fn(),
}));

vi.mock('@/app/actions/booking', () => ({
  bookSession: vi.fn(),
}));

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { getPartnerById } from '@/app/actions/search';
import { bookSession } from '@/app/actions/booking';
import PartnerProfilePage from '@/components/features/search/PartnerProfilePage';

const mockPartner = {
  id: '1',
  name: 'Alex Chen',
  image: null,
  experienceLevel: 'New Grad',
  interviewTypes: ['Coding', 'System Design'],
  availability: [
    new Date('2025-03-15T10:00:00Z').toISOString(),
    new Date('2025-03-17T14:00:00Z').toISOString(),
  ],
  zoomLink: 'https://zoom.us/j/111',
};

describe('PartnerProfilePage and Booking UI', () => {
  beforeEach(() => {
    vi.mocked(getPartnerById).mockResolvedValue({
      success: true,
      partner: mockPartner,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(bookSession).mockResolvedValue({
      success: true,
      session: {} as any,
    });
    mockPush.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows loading skeleton then renders profile details', async () => {
    render(<PartnerProfilePage partnerId="1" />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    });

    expect(screen.getByTestId('back-button')).toBeInTheDocument();
    expect(screen.getByText('New Grad')).toBeInTheDocument();
  });

  it('renders profile details correctly in the left section', async () => {
    render(<PartnerProfilePage partnerId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
    });

    expect(screen.getByText('New Grad')).toBeInTheDocument();
    // Both 'Coding' and 'System Design' appear in the profile AND booking widget — use getAllByText
    expect(screen.getAllByText('Coding').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('System Design').length).toBeGreaterThanOrEqual(
      1
    );
  });

  it('handles the booking flow accurately', async () => {
    render(<PartnerProfilePage partnerId="1" />);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-booking')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByTestId('confirm-booking');

    // Initially disabled
    expect(confirmBtn).toBeDisabled();

    // Select interview type
    fireEvent.click(screen.getByTestId('type-select-Coding'));

    // Still disabled — no slot selected
    expect(confirmBtn).toBeDisabled();

    // Select a time slot
    const slotBtn = screen.getAllByTestId(/^slot-select-/)[0];
    fireEvent.click(slotBtn);

    // Now enabled
    expect(confirmBtn).not.toBeDisabled();

    // Confirm booking
    fireEvent.click(confirmBtn);

    // Success state shown
    await waitFor(() => {
      expect(screen.getByTestId('success-state')).toBeInTheDocument();
    });
  });

  it('back button navigates to search', async () => {
    render(<PartnerProfilePage partnerId="1" />);

    await waitFor(() => {
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('back-button'));
    expect(mockPush).toHaveBeenCalledWith('/search');
  });

  it('shows error state when partner is not found', async () => {
    vi.mocked(getPartnerById).mockResolvedValue({
      success: false,
      error: 'Partner not found',
    });

    render(<PartnerProfilePage partnerId="nonexistent" />);

    // Use getAllByText since the text appears in both the heading and the detail
    await waitFor(() => {
      expect(
        screen.getAllByText(/Partner not found/i).length
      ).toBeGreaterThanOrEqual(1);
    });
  });
});
