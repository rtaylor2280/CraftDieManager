"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

export default function TestPage() {
  const [dieId, setDieId] = useState("");
  const [links, setLinks] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchExistingLinks = async () => {
    if (!dieId.trim()) {
      setError("Please enter a valid die ID.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/dies?id=${encodeURIComponent(dieId)}&field=links`);
      if (!response.ok) {
        throw new Error("Failed to fetch existing links");
      }
      const data = await response.json();
      setLinks(data.links || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchTitle = async (index) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/url-title-fetcher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: links[index].url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch title");
      }

      const data = await response.json();
      setLinks((prevLinks) => {
        const updatedLinks = [...prevLinks];
        updatedLinks[index].title = data.title || "";
        return updatedLinks;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/dies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: dieId,
          links: links?.filter((link) => link.url.trim() && link.title.trim()) || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update links");
      }

      setSuccessMessage("Links updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = () => {
    setLinks((prevLinks) => [...prevLinks, { url: "", title: "", editable: true }]);
  };

  const handleLinkChange = (index, field, value) => {
    setLinks((prevLinks) => {
      const updatedLinks = [...prevLinks];
      updatedLinks[index][field] = value;
      return updatedLinks;
    });
  };

  const handleBlur = (index) => {
    setLinks((prevLinks) => {
      const updatedLinks = [...prevLinks];
      if (updatedLinks[index].url.trim() === "") {
        updatedLinks[index].editable = true;
      } else {
        updatedLinks[index].editable = false;
      }
      return updatedLinks;
    });
    if (links[index].url.trim() !== "") {
      handleFetchTitle(index);
    }
  };

  const handleDelete = (index) => {
    setLinks((prevLinks) => prevLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Links for Die</h1>

      <div className="mb-4 w-full max-w-md">
        <label className="block text-gray-700 font-medium mb-2">Enter Die ID:</label>
        <input
          type="text"
          className="w-full p-2 border rounded text-black mb-2"
          value={dieId}
          onChange={(e) => setDieId(e.target.value)}
          placeholder="Enter Die ID"
        />
        <button
          onClick={fetchExistingLinks}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Load Links
        </button>
      </div>

      {isLoading && <p className="text-blue-500 mb-4">Loading...</p>}

      {links && links.map((link, index) => (
        <div key={index} className="mb-6 w-full max-w-md relative">
          {link.url.trim() && (
            <button
              onClick={() => handleDelete(index)}
              className="absolute top-0 right-0 text-red-500"
            >
              <FontAwesomeIcon icon={faCircleXmark} />
            </button>
          )}
          {link.editable ? (
            <input
              type="text"
              className="w-full p-2 border rounded text-black mb-2"
              value={link.url}
              onChange={(e) => handleLinkChange(index, "url", e.target.value)}
              onBlur={() => handleBlur(index)}
              placeholder="Paste URL"
            />
          ) : (
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline mb-2 block"
            >
              {link.url}
            </a>
          )}

          <input
            type="text"
            className="w-full p-2 border rounded text-black"
            value={link.title}
            onChange={(e) => handleLinkChange(index, "title", e.target.value)}
            placeholder="Link Title"
          />
        </div>
      ))}

      <button
        onClick={handleAddLink}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-4"
      >
        Add Another Link
      </button>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Submit All"}
      </button>
    </div>
  );
}