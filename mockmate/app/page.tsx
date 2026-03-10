import Link from 'next/link';

export const metadata = {
  title: 'MockMate | Find Your Perfect Mock Interview Partner',
  description: 'Practice mock technical and behavioral interviews with peers at top companies.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F3F4FE] font-sans">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎯</span>
          <span className="text-2xl font-extrabold text-[#0B1527] tracking-tight">
            MockMate
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 bg-[#8A2BE2] text-white rounded-full hover:bg-[#7924c7] transition-all shadow-md active:scale-95"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-[#8A2BE2] font-semibold text-sm mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8A2BE2]"></span>
          </span>
          Now matching software engineers globally
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-[#0B1527] max-w-4xl tracking-tight leading-tight mb-6">
          Nail your next interview with <span className="text-[#8A2BE2]">real practice.</span>
        </h1>

        <p className="text-xl md:text-2xl text-[#64748B] max-w-2xl mb-12">
          Connect with peers at your exact experience level to practice System Design, Behavioral, and Coding interviews.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/signup"
            className="px-8 py-4 bg-[#8A2BE2] text-white rounded-2xl font-bold text-lg hover:bg-[#7924c7] transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-2"
          >
            Start Practicing Free
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-5xl text-left">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Filtering</h3>
            <p className="text-gray-500">Find partners interviewing for the exact same roles and levels as you.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 text-[#8A2BE2] rounded-2xl flex items-center justify-center text-2xl mb-6">📅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Scheduling</h3>
            <p className="text-gray-500">Book mock sessions securely directly through our real-time availability grid.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-6">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Sessions</h3>
            <p className="text-gray-500">Share your personal Zoom or Meet links conditionally only after pairing.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
