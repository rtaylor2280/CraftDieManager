"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import Button from "@/components/Button";

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Searching for: ${searchInput}`);
    if (searchInput.trim()) {
      router.push(`/dies?query=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <div className="flex flex-grow flex-col items-center justify-center bg-white text-gray-800">
      <div className="w-full max-w-xl mb-8">
        <form className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search for dies by name, description, location, or tags..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(e);
            }}
            className="w-full p-3 pl-10 text-gray-900 rounded-lg shadow-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      <section>
        <div className="w-full max-w-xl flex flex-wrap gap-4 justify-center">
          <Button text="Dies" href="/dies" bgColor="bg-blue-500" />
          <Button text="Locations" href="/locations" bgColor="bg-green-500" />
          <Button text="Gallery" href="/gallery" bgColor="bg-purple-500" />
          <Button text="New Die" href="/add-die" bgColor="bg-orange-500" />
        </div>
      </section>
    </div>
  );
}
