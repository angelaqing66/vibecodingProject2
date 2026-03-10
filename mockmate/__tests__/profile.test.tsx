/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import ProfilePage from '@/components/features/profile/ProfilePage';

describe('ProfilePage', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders correctly in view mode', () => {
    render(<ProfilePage />);

    // Check for user details
    expect(screen.getByText('Vartika Singh')).toBeInTheDocument();
    expect(screen.getByText('vartika@university.edu')).toBeInTheDocument();

    // Check for bio
    expect(
      screen.getByText(
        'CS student preparing for SWE roles at top tech companies.'
      )
    ).toBeInTheDocument();

    // Check for "Edit Profile" button
    const editBtn = screen.getByTestId('edit-save-button');
    expect(editBtn).toHaveTextContent('Edit Profile');
  });

  it('toggles to edit mode and allows modifications', () => {
    render(<ProfilePage />);

    const editBtn = screen.getByTestId('edit-save-button');

    // Enter edit mode
    fireEvent.click(editBtn);
    expect(editBtn).toHaveTextContent('Save Profile');

    // Modify bio
    const bioInput = screen.getByTestId('bio-input');
    fireEvent.change(bioInput, { target: { value: 'Updated bio testing.' } });
    expect(bioInput).toHaveValue('Updated bio testing.');

    // Add new company
    const targetCompaniesInput = screen.getByTestId('company-input');
    fireEvent.change(targetCompaniesInput, { target: { value: 'Amazon' } });
    fireEvent.keyDown(targetCompaniesInput, { key: 'Enter', code: 'Enter' });

    // Check if new company acts as a pill
    expect(screen.getByText('Amazon')).toBeInTheDocument();

    // Save profile
    fireEvent.click(editBtn);

    // We should be back in view mode
    expect(editBtn).toHaveTextContent('Edit Profile');

    // And bio is updated
    expect(screen.getByText('Updated bio testing.')).toBeInTheDocument();
    expect(screen.getByText('Amazon')).toBeInTheDocument();
  });

  it('availability toggle grid cells react to clicks', () => {
    render(<ProfilePage />);

    // Enter Edit Mode
    const editBtn = screen.getByTestId('edit-save-button');
    fireEvent.click(editBtn);

    // Initial state matching mockUser (slot-1, day: 0, period: "MORNING") => already active
    // Click on Mon (0) Morning
    const monMorningBtn = screen.getByTestId('slot-0-MORNING');

    expect(monMorningBtn).toHaveClass('bg-purple-500');

    fireEvent.click(monMorningBtn);

    // After click, should become inactive
    expect(monMorningBtn).toHaveClass('bg-gray-50');
  });
});
