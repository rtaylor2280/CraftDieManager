"use client";

import { useState } from "react";

export default function ImageUploader({ label, onFileChange, allowMultiple }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    onFileChange(allowMultiple ? files : files[0]); // Send single file or array based on allowMultiple
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFileChange(allowMultiple ? updatedFiles : updatedFiles[0] || null); // Update parent component
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
      <input
        type="file"
        onChange={handleFileChange}
        multiple={allowMultiple}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {selectedFiles.length > 0 && (
        <div className="mt-2">
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between text-sm text-gray-700">
                <span>{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
