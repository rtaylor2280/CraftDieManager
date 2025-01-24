"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

export default function ProtectedPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const files = e.target.filesInput.files; // Access files from input
    const prefix = e.target.prefixInput.value; // Access prefix from input
    const folderId = e.target.folderIdInput.value; // Access folderId from input
    const startIndex = e.target.startIndexInput.value || "1"; // Access startIndex from input

    if (!files.length) {
      alert("Please select at least one file to upload.");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));
    if (prefix) formData.append("prefix", prefix);
    if (folderId) formData.append("folderId", folderId);
    formData.append("startIndex", startIndex);

    try {
      const response = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const data = await response.json();
      setMessage("Files uploaded successfully!");
      setUploadStatus(data.fileIds);
    } catch (error) {
      console.error("Error during file upload:", error);
      setError(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md w-80"
        >
          <h1 className="text-xl font-bold mb-4">File Upload</h1>
          {message && (
            <div className="flex items-center text-green-500 mb-4">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              <p>{message}</p>
            </div>
          )}
          {error && (
            <div className="flex items-center text-red-500 mb-4">
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
              <p>{error}</p>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="filesInput" className="block font-semibold">
              Select Files:
            </label>
            <input
              type="file"
              id="filesInput"
              name="filesInput"
              multiple
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="prefixInput" className="block font-semibold">
              File Name Prefix (Optional):
            </label>
            <input
              type="text"
              id="prefixInput"
              name="prefixInput"
              placeholder="e.g., 21"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="folderIdInput" className="block font-semibold">
              Google Drive Folder ID (Optional):
            </label>
            <input
              type="text"
              id="folderIdInput"
              name="folderIdInput"
              placeholder="Leave blank for root folder"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="startIndexInput" className="block font-semibold">
              Starting Index (Optional):
            </label>
            <input
              type="number"
              id="startIndexInput"
              name="startIndexInput"
              placeholder="1"
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Upload Files
          </button>
        </form>
        {uploadStatus && (
          <div className="mt-4 bg-white p-4 rounded shadow-md w-80">
            <h2 className="text-green-500 font-bold mb-2">Uploaded File IDs</h2>
            <ul className="list-disc pl-5">
              {uploadStatus.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
