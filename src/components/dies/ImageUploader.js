"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faFile } from "@fortawesome/free-solid-svg-icons";

export default function ImageUploader({
  label,
  onFileChange,
  allowMultiple,
  clear,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [inputKey, setInputKey] = useState(Date.now()); // Key for forcing input re-render

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map((file) => {
      // Check if the file is HEIC and rename its extension to .jpeg
      if (file.type === "image/heic" || file.name.endsWith(".HEIC")) {
        const renamedFile = new File([file], file.name.replace(/\.HEIC$/i, ".jpeg"), {
          type: "image/jpeg",
        });
        console.log("Renamed File:", renamedFile);
        return renamedFile;
      }
      console.log("Original File:", file);
      return file;
    });

    console.log("Selected Files:", files);
    setSelectedFiles(files);
    onFileChange(allowMultiple ? files : files[0]); // Send single file or array based on allowMultiple

    // Generate thumbnails for image files
    const fileReaders = files.map((file) => {
      if (!file.type.startsWith("image/")) {
        console.log("Skipping non-image file:", file);
        return null; // Skip non-image files
      }
      const reader = new FileReader();
      reader.onload = () => {
        console.log("Thumbnail generated for file:", file.name);
        setThumbnails((prev) => [...prev, { file, src: reader.result }]);
      };
      reader.readAsDataURL(file);
      return reader;
    });

    // Clean up unused readers
    return () => fileReaders.forEach((reader) => reader?.abort());
  };

  const handleRemoveFile = (index) => {
    console.log("Removing file at index:", index);
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedThumbnails = thumbnails.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setThumbnails(updatedThumbnails);
    onFileChange(allowMultiple ? updatedFiles : updatedFiles[0] || null); // Update parent component
  };

  useEffect(() => {
    if (clear && selectedFiles.length > 0) {
      console.log("Clearing all selected files and thumbnails");
      setSelectedFiles([]);
      setThumbnails([]);
      setInputKey(Date.now()); // Reset file input field
      onFileChange(allowMultiple ? [] : null); // Notify parent only when necessary
    }
  }, [clear]); // Only depend on `clear`

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <input
        key={inputKey} // Force re-render by changing the key
        type="file"
        onChange={handleFileChange}
        multiple={allowMultiple}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {thumbnails.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {thumbnails.map((thumb, index) => (
            <div key={index} className="relative">
              <img
                src={thumb.src}
                alt={thumb.file.name}
                className="w-full h-auto max-h-24 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <FontAwesomeIcon icon={faCircleXmark} size="lg" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
