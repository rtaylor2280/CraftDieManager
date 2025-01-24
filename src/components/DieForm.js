"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { sortLocations } from "@/utils/sortLocations";
import Spinner from "@/components/Spinner";

export default function DieForm({ die = null, onSuccess }) {
  const [name, setName] = useState(die?.name || "");
  const [description, setDescription] = useState(die?.description || "");
  const [locationId, setLocationId] = useState(die?.location_id || "");
  const [locations, setLocations] = useState([]);
  const [primaryImageFile, setPrimaryImageFile] = useState(null); // File for primary image
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]); // Files for additional images
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/locations");
        if (res.ok) {
          const data = await res.json();
          setLocations(sortLocations(data));
        } else {
          console.error("Failed to fetch locations");
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const method = die ? "PUT" : "POST";
    const endpoint = "/api/dies";

    const body = {
      id: die?.id,
      name,
      description,
      location_id: locationId,
    };

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        const updates = {};

        // Upload primary image
        if (primaryImageFile) {
          const primaryFileIds = await uploadFiles(data.id, "primary_image");
          if (primaryFileIds.length > 0) {
            updates.primary_image = primaryFileIds[0]; // First file ID for primary_image
          }
        }

        // Upload additional images
        if (additionalImageFiles.length > 0) {
          const additionalFileIds = await uploadFiles(
            data.id,
            "additional_images"
          );
          if (additionalFileIds.length > 0) {
            updates.additional_images = additionalFileIds; // All file IDs for additional_images
          }
        }

        // Send a single PUT request to update the die record
        if (Object.keys(updates).length > 0) {
          await updateDie(data.id, updates);
        }

        setMessage(
          die ? "Die updated successfully!" : "Die added successfully!"
        );
        if (!die && onSuccess) {
          onSuccess(data.id);
        }
      } else {
        setError(data.error || "An error occurred.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFiles = async (dieId, field) => {
    try {
      const formData = new FormData();
      const files =
        field === "primary_image" ? [primaryImageFile] : additionalImageFiles;

      files.forEach((file) => formData.append("files", file));
      formData.append("prefix", dieId);
      formData.append("folder", "DIES");

      const res = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`${field} upload failed: ${errorData.error}`);
      }

      const data = await res.json();
      console.log(`${field} uploaded, File IDs:`, data.fileIds);
      return data.fileIds; // Return the array of file IDs
    } catch (error) {
      console.error(`Error uploading ${field}:`, error);
      throw error;
    }
  };

  const updateDie = async (id, updates) => {
    if (!id || !updates || Object.keys(updates).length === 0) {
      throw new Error("ID and updates are required to update the die.");
    }

    console.log(`Updating die ${id} with:`, updates);

    try {
      const res = await fetch("/api/dies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...updates, // Spread the updates into the request body
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Failed to update die record: ${errorData.error}`);
      }

      console.log(`Die record ${id} updated successfully.`);
    } catch (error) {
      console.error("Error updating die:", error);
      throw error;
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-100">
      {isUploading && <Spinner />}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <h1 className="text-xl font-bold mb-4">
          {die ? "Update Die" : "Add New Die"}
        </h1>
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
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded text-black include-enter"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);

              // Adjust the height of the textarea
              const target = e.target;
              target.style.height = "auto"; // Reset height to calculate the new height
              target.style.height = `${target.scrollHeight}px`; // Correct template literals
            }}
            onInput={(e) => {
              // Adjust height when input is loaded
              const target = e.target;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`; // Correct template literals
            }}
            className="w-full p-2 border rounded text-black include-enter resize-none"
            style={{ overflow: "hidden" }} // Hide scrollbars for a clean look
          />
        </div>
        <div className="mb-4">
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full p-2 border rounded text-black include-enter"
          >
            <option value="">Select a Location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label>Primary Image:</label>
          <input
            type="file"
            onChange={(e) => setPrimaryImageFile(e.target.files[0])}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label>Additional Images:</label>
          <input
            type="file"
            multiple
            onChange={(e) =>
              setAdditionalImageFiles(Array.from(e.target.files))
            }
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {die ? "Save Updates" : "Create"}
        </button>
      </form>
    </div>
  );
}
