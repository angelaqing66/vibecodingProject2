/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import PartnerProfilePage from '@/components/features/search/PartnerProfilePage';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('PartnerProfilePage and Booking UI', () => {
  afterEach(() => {
    cleanup();
    mockPush.mockClear();
  });

  it('renders profile details correctly in the left section', () => {
    render(<PartnerProfilePage partnerId="1" />);

    // Check Avatar/Name
    expect(screen.getByText('Alex Chen')).toBeInTheDocument();

    // Check tags
    expect(screen.getByText('NEW GRAD')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Meta')).toBeInTheDocument();

    // Check Bio
    expect(
      screen.getByText(
        'CS grad from MIT, prepping for big tech. Love helping others practice!'
      )
    ).toBeInTheDocument();
  });

  it('handles the booking flow accurately', () => {
    render(<PartnerProfilePage partnerId="1" />);

    const confirmBtn = screen.getByTestId('confirm-booking');

    // Initially disabled because no type or slot is selected
    expect(confirmBtn).toBeDisabled();

    // Select Interview type
    const typeSelect = screen.getByTestId('type-select-CODING');
    fireEvent.click(typeSelect);

    // Still disabled
    expect(confirmBtn).toBeDisabled();

    // Select Slot (s1 -> Mon Morning)
    const slotSelect = screen.getByTestId('slot-select-s1');
    fireEvent.click(slotSelect);

    // Now it should be enabled!
    expect(confirmBtn).toBeEnabled();

    // Add note
    const notesInput = screen.getByTestId('booking-notes');
    fireEvent.change(notesInput, {
      target: { value: 'Excited for this mock!' },
    });

    // Click confirm!
    fireEvent.click(confirmBtn);

    // We should be in the success state
    expect(screen.getByTestId('success-state')).toBeInTheDocument();
    expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
    expect(screen.getByText('Monday morning')).toBeInTheDocument();

    // Meeting link exposed
    expect(screen.getByText('https://zoom.us/j/111')).toBeInTheDocument();

    // Click 'View in Dashboard'
    const viewDashboardBtn = screen.getByText('View in Dashboard');
    fireEvent.click(viewDashboardBtn);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('back button navigates to search', () => {
    render(<PartnerProfilePage partnerId="1" />);

    const backBtn = screen.getByTestId('back-button');
    fireEvent.click(backBtn);

    expect(mockPush).toHaveBeenCalledWith('/search');
  });
});
