"use client";

import { useState } from "react";

export default function TestPage() {
  const [fileIds, setFileIds] = useState("");
  const [images, setImages] = useState([]);

  const handleRetrieveImages = async () => {
    try {
      const res = await fetch("/api/get-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: fileIds.split(",") }),
      });

      if (!res.ok) {
        throw new Error("Failed to retrieve files");
      }

      const data = await res.json();
      setImages(data.files);
    } catch (error) {
      console.error("Error retrieving images:", error);
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-100 p-4">
      <form>
        <h1 className="text-2xl font-bold mb-4">Test Image Retrieval</h1>
        <input
          type="text"
          placeholder="Enter File IDs (comma-separated)"
          value={fileIds}
          onChange={(e) => setFileIds(e.target.value)}
          className="border p-2 mb-4 w-96"
        />
        <button
          onClick={handleRetrieveImages}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        >
          Retrieve Images
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="flex flex-col items-center bg-white p-2 rounded shadow"
            >
              <img
                src={`data:${image.mimeType};base64,${image.data}`}
                alt={image.name}
                className="max-w-full h-auto max-h-40"
                style={{ objectFit: "contain" }}
              />
              <p className="text-sm mt-2 break-words">{image.name}</p>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
