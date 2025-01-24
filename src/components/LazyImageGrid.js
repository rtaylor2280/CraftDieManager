"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faFile } from "@fortawesome/free-solid-svg-icons";
import Spinner from "@/components/Spinner";

export default function LazyImageGrid({ fileIds = [], onRemove, deletable = true }) {
  const [images, setImages] = useState([]);
  const [loadingIds, setLoadingIds] = useState(new Set()); // Track loading IDs

  const loadImages = async (ids) => {
    try {
      const res = await fetch("/api/get-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: ids }),
      });
      if (!res.ok) {
        console.error(`Failed to fetch images for IDs: ${ids}`);
        return [];
      }
      const data = await res.json();
      return data.files.map((file) => ({
        id: file.id,
        data: file.data,
        mimeType: file.mimeType,
        loading: false,
      }));
    } catch (error) {
      console.error(`Error loading images for IDs: ${ids}`, error);
      return ids.map((id) => ({ id, data: null, loading: false }));
    }
  };

  useEffect(() => {
    const batchLoadImages = async () => {
      const batchSize = 20; // Number of images to load per batch
      for (let i = 0; i < fileIds.length; i += batchSize) {
        const batch = fileIds.slice(i, i + batchSize);
        setLoadingIds((prev) => new Set([...prev, ...batch])); // Mark batch as loading

        const loadedImages = await loadImages(batch);
        setImages((prev) => [
          ...prev.filter((img) => !batch.includes(img.id)), // Remove duplicates
          ...loadedImages,
        ]);

        setLoadingIds((prev) => {
          const updated = new Set(prev);
          batch.forEach((id) => updated.delete(id)); // Remove loaded IDs from loading state
          return updated;
        });

        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
      }
    };

    batchLoadImages();
  }, [fileIds]);

  const handleRemove = (id) => {
    if (onRemove) onRemove(id);
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {fileIds.map((id) => {
        const image = images.find((img) => img.id === id);
        const isLoading = loadingIds.has(id);

        return (
          <div
            key={id}
            className="relative flex flex-col items-center bg-white p-2 rounded shadow"
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Spinner />
              </div>
            ) : image && image.data ? (
              <img
                src={`data:${image.mimeType};base64,${image.data}`}
                alt={`Image ${id}`}
                className="w-full h-auto max-h-60"
                style={{ objectFit: "contain" }}
              />
            ) : (
              <div className="flex justify-center items-center h-40 bg-white rounded">
                <p className="text-gray-500"><FontAwesomeIcon icon={faFile} size="lg" /></p>
              </div>
            )}
            {deletable && (
              <button
                type="button"
                onClick={() => handleRemove(id)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <FontAwesomeIcon icon={faCircleXmark} size="lg" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
