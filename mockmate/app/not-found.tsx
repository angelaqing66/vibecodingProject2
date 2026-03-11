import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="mb-8">
                <span className="text-6xl text-[#8A2BE2] block mb-4">404</span>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Page Not Found</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    We couldn't find the page you were looking for. It might have been moved or doesn't exist.
                </p>
            </div>
            <Link
                href="/dashboard"
                className="px-6 py-3 bg-[#8A2BE2] text-white rounded-xl font-bold hover:bg-[#7924c7] transition-colors shadow-sm"
            >
                Return to Dashboard
            </Link>
        </div>
    );
}
