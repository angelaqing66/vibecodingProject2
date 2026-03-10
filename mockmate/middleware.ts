import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/search/:path*',
    '/profile-setup/:path*',
    '/dashboard/:path*',
    '/profile',
  ],
};
