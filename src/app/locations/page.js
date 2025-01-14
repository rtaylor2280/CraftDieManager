"use client";

import { useEffect, useState } from "react";
import { sortLocations } from "@/utils/sortLocations";
import Spinner from "@/components/Spinner"; // Import the Spinner component

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        const res = await fetch("/api/locations");
        const data = await res.json();
        const sortedData = sortLocations(data);
        setLocations(sortedData);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
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
      <main className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Locations</h2>
          {loading && (
            <span className="ml-1">
              <Spinner
              className="ml-3 w-5 h-5 text-gray-700"
              aria-label="Loading"
              />
            </span>
          )}
        </div>

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
                    <h3 className="text-xl font-semibold text-gray-800">
                      {location.name}
                    </h3>
                    <p className="text-gray-600">
                      {location.description || "No description provided"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
