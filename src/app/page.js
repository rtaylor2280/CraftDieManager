'use client';

import SearchBar from "@/components/SearchBar";
import Button from "@/components/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <main className="flex flex-col items-center justify-center py-10">
        {/* Search Bar */}
        <div className="w-full max-w-xl mb-8">
          <SearchBar placeholder="Search for dies, locations, or images quickly..." />
        </div>

        {/* Buttons */}
        <section>
          <div className="w-full max-w-xl flex flex-wrap gap-4 justify-center">
            <Button text="Manage Dies" href="/dies" bgColor="bg-blue-500" />
            <Button text="Manage Locations" href="/locations" bgColor="bg-green-500" />
            <Button text="View Gallery" href="/gallery" bgColor="bg-purple-500" />
          </div>
        </section>
      </main>
    </div>
  );
}
