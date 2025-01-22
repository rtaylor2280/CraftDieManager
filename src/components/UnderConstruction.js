'use client';

import Link from "next/link";

export default function UnderConstruction() {
  return (
    <div className="flex flex-grow flex-col items-center justify-center py-10 bg-gray-50 text-gray-800">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">🚧 Under Construction 🚧</h1>
        <p className="text-lg text-gray-600 mb-6">
          This page is currently being built. Please check back later!
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
