"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LazyImageGrid from "@/components/LazyImageGrid";
import ImageUploader from "@/components/dies/ImageUploader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import Spinner, { StarWithText } from "@/components/Spinner";

export default function UpdateDieForm({ dieId }) {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationId, setLocationId] = useState("");
  const [primaryImage, setPrimaryImage] = useState(null); // Existing primary image
  const [primaryImageFile, setPrimaryImageFile] = useState(null); // New primary image file
  const [additionalImages, setAdditionalImages] = useState([]); // File IDs for additional images
  const [additionalFiles, setAdditionalFiles] = useState([]); // New files to upload
  const [removedImages, setRemovedImages] = useState([]); // IDs of removed files
  const [locations, setLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  // Define fetchData as a reusable function
  const fetchData = async () => {
    try {
      const dieResponse = await fetch(`/api/dies?id=${dieId}`);
      const locationResponse = await fetch(`/api/locations`);

      if (dieResponse.ok && locationResponse.ok) {
        const dieData = await dieResponse.json();
        const locationData = await locationResponse.json();

        setName(dieData.name || "");
        setDescription(dieData.description || "");
        setLocationId(dieData.location_id || "");
        setLocations(locationData);

        if (dieData.primary_image) {
          // Fetch primary image data
          const primaryImageResponse = await fetch("/api/get-files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileIds: [dieData.primary_image] }),
          });

          if (primaryImageResponse.ok) {
            const primaryImageData = await primaryImageResponse.json();
            setPrimaryImage(primaryImageData.files[0]?.data || null); // Set base64 data
          }
        }

        if (dieData.additional_images?.length) {
          setAdditionalImages(dieData.additional_images);
        }
      } else {
        throw new Error("Failed to fetch data.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load die details or locations.");
    } finally {
      setLoading(false); // Set loading to false when data fetching is done
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [dieId]);

  const handleRemoveImage = (id) => {
    setRemovedImages((prev) => [...prev, id]); // Add to removed images
    setAdditionalImages((prev) => prev.filter((fileId) => fileId !== id)); // Update remaining images
  };

  const handleSubmit = async (e, closeAfterSave = false) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updates = { name, description, location_id: locationId };

      // Handle primary image replacement
      if (primaryImageFile) {
        const primaryFileIds = await uploadFiles([primaryImageFile], {
          folder: "DIES",
          prefix: dieId,
          startIndex: 1,
        });
        updates.primary_image = primaryFileIds[0];
      }

      // Handle new additional files
      if (additionalFiles.length > 0) {
        const additionalFileIds = await uploadFiles(additionalFiles, {
          folder: "DIES",
          prefix: dieId,
          startIndex: additionalImages.length + 2,
        });
        updates.additional_images = [...additionalImages, ...additionalFileIds];
      } else {
        updates.additional_images = additionalImages; // Keep the updated array
      }

      // Delete removed images
      if (removedImages.length > 0) {
        await fetch("/api/delete-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileIds: removedImages }),
        });
      }

      // Update die record
      const res = await fetch(`/api/dies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dieId, ...updates }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update die record.");
      }

      if (closeAfterSave) {
        alert("Die updated successfully!");
        // Navigate to /dies after successful save
        router.push(`/dies?message=Die updated successfully!`);
      } else {
        setMessage("Die updated successfully!");
        await fetchData(); // Refetch data if not closing
      }
    } catch (error) {
      console.error("Error updating die:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dies");
  };

  const uploadFiles = async (files, options) => {
    const { folder, prefix, startIndex } = options;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
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

  if (loading) {
    // Show Spinner while loading data
    return (
      <div className="flex flex-grow items-center justify-center bg-gray-100 p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md w-full max-w-lg"
        >
          <h1 className="text-2xl font-bold mb-4 text-center">Update Die</h1>
          <div className="flex items-center justify-center h-screen">
            <Spinner />
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-lg"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Update Die</h1>

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
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded text-black resize-none"
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
          <h3 className="text-gray-700 font-bold mb-2">Primary Image:</h3>
          {primaryImage ? (
            <div className="relative mb-4 flex justify-center items-center">
              <img
                src={`data:image/jpeg;base64,${primaryImage}`}
                alt="Primary Image"
                className="w-full max-w-[75%] h-auto max-h-[75%] rounded object-contain"
              />
              <button
                type="button"
                onClick={() => setPrimaryImage(null)}
                className="absolute top-2 right-2 text-gray-500"
              >
                <FontAwesomeIcon icon={faCircleXmark} />
              </button>
            </div>
          ) : (
            <ImageUploader
              onFileChange={(file) => setPrimaryImageFile(file)}
              allowMultiple={false}
            />
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-gray-700 font-bold mb-2">Additional Images:</h3>
          <div className="relative mb-4 flex justify-center items-center">
            <LazyImageGrid
              fileIds={additionalImages}
              onRemove={handleRemoveImage}
              deletable={true}
            />
          </div>
          <ImageUploader
            onFileChange={(files) => setAdditionalFiles(files)}
            allowMultiple={true}
          />
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-500 text-white p-2 rounded w-full flex items-center justify-center ${
              isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? <StarWithText /> : "Save"}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className={`bg-green-500 text-white p-2 rounded w-full flex items-center justify-center ${
              isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-green-600"
            }`}
          >
            {isSubmitting ? <StarWithText /> : "Save & Close"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white p-2 rounded w-full flex items-center justify-center hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
