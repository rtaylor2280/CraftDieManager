"use client";

import { useEffect, useState } from "react";
import { sortLocations } from "@/utils/sortLocations";

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    // Fetch data from the locations API
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => {
        const sortedData = sortLocations(data); // Use updated sorting function
        setLocations(sortedData);
      })
      .catch((err) => console.error("Failed to fetch locations:", err));
  }, []);

  // Group locations by description
  const groupedLocations = locations.reduce((groups, location) => {
    const groupKey = location.description || "No Description";
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(location);
    return groups;
  }, {});

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Craft Die Manager</h1>
        <p className="text-gray-600 mt-4">Your Next.js app is connected to the database!</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Locations</h2>
        {Object.entries(groupedLocations).map(([description, locations]) => (
          <div key={description} className="mb-6">
            <button
              onClick={() => toggleGroup(description)}
              className="text-lg font-semibold text-gray-800 w-full text-left p-2 bg-gray-200 rounded"
            >
              {description} ({locations.length})
            </button>
            {expandedGroups[description] && (
              <ul className="mt-2 space-y-4 pl-4">
                {locations.map((location) => (
                  <li
                    key={location.id}
                    className="p-4 border rounded-lg shadow-sm bg-white"
                  >
                    <h3 className="text-xl font-semibold text-gray-800">{location.name}</h3>
                    <p className="text-gray-600">{location.description || "No description provided"}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </main>

      <footer className="text-center mt-16 text-gray-500">
        <p>Powered by Next.js & Vercel</p>
      </footer>
    </div>
  );
}
