"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-50 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Craft Die Manager</h1>
        <p className="text-gray-600 mt-4">Manage your dies, locations, and images with ease.</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/dies"
              className="p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
            >
              Manage Dies
            </Link>
            <Link
              href="/locations"
              className="p-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
            >
              Manage Locations
            </Link>
            <Link
              href="/gallery"
              className="p-4 bg-purple-500 text-white rounded-lg shadow-md hover:bg-purple-600"
            >
              View Gallery
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Search</h2>
          <form>
            <input
              type="text"
              placeholder="Search for dies, locations, or images..."
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-500"
              spellCheck={false}
              data-ms-editor={false}
            />
          </form>
        </section>
      </main>

      <footer className="text-center mt-16 text-gray-500">
        <p>Powered by Next.js & Vercel</p>
      </footer>
    </div>
  );
}
