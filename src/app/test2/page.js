"use client";

import LazyImageGrid from "@/components/LazyImageGrid";
import { useState, useEffect } from "react";

export default function TestPage() {
  const [imageFileIds, setImageFileIds] = useState([]);
  const [error, setError] = useState("");

  // Fetch the folder files when the component mounts
  useEffect(() => {
    const fetchFolderFiles = async () => {
      try {
        const response = await fetch("/api/get-folder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "DIES" }), // Fetch files from the DIES folder
        });

        if (!response.ok) {
          throw new Error("Failed to fetch folder files.");
        }

        const data = await response.json();
        setImageFileIds(data.files.map((file) => file.id)); // Extract file IDs
      } catch (err) {
        console.error("Error fetching folder files:", err.message);
        setError("Error fetching folder files. Check console for details.");
      }
    };

    fetchFolderFiles();
  }, []); // Run only once when the page mounts

  const [removedIds, setRemovedIds] = useState([]);

  const handleRemoveImage = (id) => {
    setRemovedIds((prev) => [...prev, id]);
    setImageFileIds((prev) => prev.filter((fileId) => fileId !== id));
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-100">
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Test LazyImageGrid</h1>
        {error && <div className="text-red-500">{error}</div>}
        <LazyImageGrid
          fileIds={Array.isArray(imageFileIds) ? imageFileIds : []}
          onRemove={handleRemoveImage}
          deletable={true}
        />
        <div className="mt-6">
          <h2 className="text-xl font-bold">Removed IDs:</h2>
          <ul className="list-disc pl-6">
            {Array.isArray(removedIds) ? (
              removedIds.map((id) => <li key={id}>{id}</li>)
            ) : (
              <li>No IDs removed</li>
            )}
          </ul>
          <h2 className="text-xl font-bold mt-4">Remaining IDs:</h2>
          <ul className="list-disc pl-6">
            {Array.isArray(imageFileIds) ? (
              imageFileIds.map((id) => <li key={id}>{id}</li>)
            ) : (
              <li>No remaining IDs</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
