"use client";

import { useState, useEffect } from "react";
import ImageUploader from "@/components/dies/ImageUploader";
import { StarWithText } from "@/components/Spinner";

export default function AddDieForm() {
  const [name, setName] = useState(""); // Stores the name of the die, required for submission
  const [description, setDescription] = useState(""); // Holds the description of the die, optional field
  const [locationId, setLocationId] = useState(""); // Tracks the selected location for the die
  const [primaryImageFile, setPrimaryImageFile] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch locations when component mounts
  useEffect(() => {
    // Fetches available locations when the component mounts
    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/locations");
        if (res.ok) {
          const data = await res.json();
          setLocations(data);
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
    // Handles the form submission for creating a new die
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Step 1: Create a new die record
      const dieResponse = await fetch("/api/dies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          location_id: locationId,
        }),
      });

      if (!dieResponse.ok) {
        const dieError = await dieResponse.json();
        throw new Error(dieError.error || "Failed to create die record");
      }

      const { id: dieId } = await dieResponse.json();

      // Step 2: Upload primary image (if any)
      if (primaryImageFile) {
        const primaryFileIds = await uploadFiles([primaryImageFile], {
          folder: "DIES",
          prefix: dieId,
          startIndex: 1,
        });

        await updateDie(dieId, { primary_image: primaryFileIds[0] });
      }

      // Step 3: Upload additional files (if any)
      if (additionalFiles.length > 0) {
        const additionalFileIds = await uploadFiles(additionalFiles, {
          folder: "DIES",
          prefix: dieId,
          startIndex: 2,
        });

        await updateDie(dieId, { additional_images: additionalFileIds });
      }

      // Step 4: Redirect to edit form
      setMessage("Die created successfully!");
      if (onSuccess) onSuccess(dieId); // Trigger parent callback for navigation
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFiles = async (files, options) => {
    // Handles file uploads to the server for primary and additional files
    const { folder, prefix, startIndex } = options;

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("files", file);
    });
    formData.append("prefix", prefix);
    formData.append("folder", folder);
    formData.append("startIndex", startIndex);

    const res = await fetch("/api/upload-file", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to upload files");
    }

    const { fileIds } = await res.json();
    return fileIds;
  };

  const updateDie = async (dieId, updates) => {
    // Updates the die record with the given updates, such as file IDs
    const res = await fetch("/api/dies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: dieId, ...updates }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update die");
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-lg"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Add New Die</h1>

        {message && <div className="text-green-500 mb-4">{message}</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);

              // Adjust the height of the textarea
              const target = e.target;
              target.style.height = "auto"; // Reset height to calculate the new height
              target.style.height = `${target.scrollHeight}px`; // Dynamically adjust based on content
            }}
            onInput={(e) => {
              // Adjust height when input is loaded
              const target = e.target;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`; // Dynamically adjust based on content
            }}
            className="w-full p-2 border rounded text-black resize-none overflow-hidden"
            style={{ overflow: "hidden" }}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Location
          </label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select a location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <ImageUploader
            label="Primary Image"
            onFileChange={(file) => setPrimaryImageFile(file)}
            allowMultiple={false}
          />
        </div>

        <div className="mb-4">
          <ImageUploader
            label="Additional Files"
            onFileChange={(files) => setAdditionalFiles(files)}
            allowMultiple={true}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-500 text-white p-2 rounded w-full flex items-center justify-center ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
        >
          {isSubmitting ? <StarWithText /> : "Add Die"}
        </button>
      </form>
    </div>
  );
}
