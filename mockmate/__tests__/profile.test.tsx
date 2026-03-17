/** @vitest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';

// Mock the server actions used by the profile page
vi.mock('@/app/actions/profile', () => ({
  getProfile: vi.fn().mockResolvedValue({
    success: true,
    user: {
      name: 'Vartika Singh',
      email: 'vartika@university.edu',
      bio: 'CS student preparing for SWE roles at top tech companies.',
      experienceLevel: 'New Grad',
      interviewTypes: ['Coding', 'System Design'],
      availability: [],
      zoomLink: 'https://zoom.us/j/123456789',
    },
  }),
  updateProfile: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock react-hook-form with zodResolver since profile/page.tsx uses it
vi.mock('react-hook-form', async () => {
  const actual =
    await vi.importActual<typeof import('react-hook-form')>('react-hook-form');
  return {
    ...actual,
    useForm: () => ({
      register: vi.fn(() => ({})),
      handleSubmit: (fn: (data: unknown) => void) => (e: React.FormEvent) => {
        e.preventDefault();
        fn({
          experienceLevel: 'New Grad',
          interviewTypes: ['Coding'],
          availability: [],
          zoomLink: '',
        });
      },
      watch: vi.fn((field?: string) => {
        if (field === 'interviewTypes') return ['Coding'];
        if (field === 'availability') return [];
        if (field === 'experienceLevel') return 'New Grad';
        return undefined;
      }),
      setValue: vi.fn(),
      formState: { errors: {}, isSubmitting: false },
    }),
  };
});

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => vi.fn(),
}));

// Lazy import so mocks are set up first
const ProfilePage = (await import('@/app/profile/page')).default;

describe('ProfilePage (backend-integrated)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the loading state initially then shows the profile form', async () => {
    render(<ProfilePage />);

    // While loading, component shows "Loading Profile..."
    expect(screen.getByText('Loading Profile...')).toBeInTheDocument();

    // After fetching, the form header should appear
    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });
  });

  it('renders experience level options', async () => {
    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });
    expect(screen.getByText('Experience Level')).toBeInTheDocument();
    expect(screen.getByText('Intern')).toBeInTheDocument();
    expect(screen.getByText('New Grad')).toBeInTheDocument();
    expect(screen.getByText('Experienced')).toBeInTheDocument();
  });

  it('renders interview type options', async () => {
    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });
    expect(screen.getByText('Behavioral')).toBeInTheDocument();
    expect(screen.getByText('Coding')).toBeInTheDocument();
    expect(screen.getByText('System Design')).toBeInTheDocument();
  });

  it('renders the save button', async () => {
    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /save profile/i })
    ).toBeInTheDocument();
  });
});
