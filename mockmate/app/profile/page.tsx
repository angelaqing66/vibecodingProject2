import React from 'react';
import ProfilePage from '@/components/features/profile/ProfilePage';

export const metadata = {
  title: 'Profile | MockMate',
  description: 'View and edit your MockMate profile',
};

export default function ProfileRoute() {
  return (
    <div className="py-12">
      <ProfilePage />
    </div>
  );
}
