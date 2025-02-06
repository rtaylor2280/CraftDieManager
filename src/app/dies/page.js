"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import { FaSearch } from "react-icons/fa";
import Button from "@/components/Button";

export default function DiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState(null); // Initialize with null
  const [dies, setDies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Read query parameter on mount
  useEffect(() => {
    const initialQuery = searchParams.get("query") || "";
    setSearchInput(initialQuery);
    setActiveQuery(initialQuery);
  }, [searchParams]); // Depend on searchParams to trigger updates

  // Fetch dies when activeQuery is set
  useEffect(() => {
    if (activeQuery === null) return; // Prevents running on first mount before params are loaded

    async function fetchDies() {
      try {
        setLoading(true);
        const queryString = activeQuery.trim()
          ? `?query=${encodeURIComponent(activeQuery)}`
          : "";
        const res = await fetch(`/api/search${queryString}`);
        const data = await res.json();
        setDies(data.dies || []);
      } catch (error) {
        console.error("Failed to fetch dies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDies();
  }, [activeQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/dies?query=${encodeURIComponent(searchInput)}`);
      setActiveQuery(searchInput);
    } else {
      router.push(`/dies`); // Removes the query param when empty
      setActiveQuery(""); // Also clear the activeQuery state
    }
  };

  return (
    <div className="p-8 flex flex-grow flex-col items-center bg-white text-gray-1400">
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

      {loading && (
        <div className="flex justify-center">
          <Spinner className="w-10 h-10 text-gray-700" />
        </div>
      )}

      {!loading && dies.length === 0 && (
        <p className="text-center text-gray-500">No results found.</p>
      )}

      {/* Display Dies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {dies.map((die) => (
          <div
            key={die.id}
            onClick={() => router.push(`/dies/${die.id}`)}
            className="p-4 border rounded-lg shadow-sm bg-white cursor-pointer hover:bg-gray-100 transition"
          >
            <h3 className="text-xl font-semibold text-gray-800">{die.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
