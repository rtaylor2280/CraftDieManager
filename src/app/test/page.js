"use client";

import LazyImageGrid from "@/components/LazyImageGrid";
import { useEffect, useState } from "react";

export default function TestPage() {
  const [imageFileIds, setImageFileIds] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchFolderFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/get-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "DIES" }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch folder files.");
      }

      const data = await response.json();
      setImageFileIds(data.files.map((file) => file.id)); // Extract file IDs
    } catch (err) {
      console.error("Error fetching folder files:", err.message);
      setError("Error fetching folder files. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (id) => {
    if (!removedIds.includes(id)) {
      setRemovedIds((prev) => [...prev, id]); // Mark ID as removed
    }
  };

  const handleRestoreImage = (id) => {
    setRemovedIds((prev) => prev.filter((removedId) => removedId !== id)); // Remove ID from removedIds
  };

  // Load the folder files on page load
  useEffect(() => {
    fetchFolderFiles();
  }, []);

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-100">
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Test LazyImageGrid</h1>
        {isLoading && <p>Loading files...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <LazyImageGrid
          fileIds={imageFileIds}
          onRemove={handleRemoveImage}
          onRestore={handleRestoreImage} // Pass restore handler
          removedIds={removedIds}
          deletable={true}
        />

        <div className="mt-6">
          <h2 className="text-xl font-bold">Removed IDs:</h2>
          <ul className="list-disc pl-6">
            {removedIds.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
          <h2 className="text-xl font-bold mt-4">Remaining IDs:</h2>
          <ul className="list-disc pl-6">
            {imageFileIds
              .filter((id) => !removedIds.includes(id))
              .map((id) => (
                <li key={id}>{id}</li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
