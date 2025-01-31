"use client";

import React, { useState, useEffect } from "react";
import AddTagForm from "@/components/dies/AddTagForm";

const TagSelector = ({ onTagSelectionChange, dieId }) => {
  const [categories, setCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]); // Start with an empty selection
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Fetch categories (tags grouped by categories)
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  // Fetch initial selected tags based on dieId
  useEffect(() => {
    console.log("dieId in useEffect:", dieId); // Log dieId
    if (dieId) {
      const fetchDieTags = async () => {
        try {
          console.log(`Fetching tags for dieId: ${dieId}`); // Debug fetch call
          const response = await fetch(`/api/die-tags?die_id=${dieId}&_=${new Date().getTime()}`);
          const data = await response.json();
          console.log("Fetched tags:", data); // Log fetched data
          setSelectedTags(data); // Ensure fetched data is an array of tag IDs
        } catch (error) {
          console.error("Error fetching die tags:", error);
        }
      };

      fetchDieTags();
    }
  }, [dieId]);

  // Handle tag selection
  const toggleTagSelection = (tagId) => {
    const updatedSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId) // Remove if already selected
      : [...selectedTags, tagId]; // Add if not selected

    setSelectedTags(updatedSelectedTags);

    // Notify the parent component of the change
    if (onTagSelectionChange) {
      onTagSelectionChange(updatedSelectedTags);
    }
  };

  // Handle adding new tags
  const handleTagAdded = (newTagId) => {
    // Fetch the latest categories to include the new tag
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();

    // Automatically select the newly added tag
    const updatedSelectedTags = [...selectedTags, newTagId];
    setSelectedTags(updatedSelectedTags);

    // Notify the parent component of the change
    if (onTagSelectionChange) {
      onTagSelectionChange(updatedSelectedTags);
    }

    // Collapse the accordion after adding a tag
    setIsAccordionOpen(false);
  };

  return (
    <div className="p-4">
      {/* Display Existing Categories and Tags */}
      {categories.map((category) => (
        <div key={category.id || category.category_name} className="mb-4">
          <h2 className="text-lg font-bold mb-2" style={{ color: "black" }}>
            {category.category_name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {category.tags.map((tag) => (
              <button
                type="button" // Ensures this button does not act as a submit button
                key={`tag-${tag.tag_id}`}
                className={`px-2 py-1 border rounded text-sm`}
                style={{
                  backgroundColor: selectedTags.includes(tag.tag_id)
                    ? "#007BFF" // Blue when selected
                    : "#f0f0f0", // Grey when not selected
                  color: selectedTags.includes(tag.tag_id) ? "white" : "black",
                  borderColor: selectedTags.includes(tag.tag_id)
                    ? "#007BFF"
                    : "#ccc",
                }}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default behavior
                  e.stopPropagation(); // Stop the event from propagating to the form
                  toggleTagSelection(tag.tag_id);
                }}
              >
                {tag.tag_name}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Add Tag Form Accordion */}
      <div className="flex flex-col items-start gap-2">
        <div className="mt-4 pt-4">
          <button
            type="button" // Explicitly define the button type
            className={`px-2 py-1 border rounded text-sm bg-blue-500 text-white hover:bg-blue-600`}
            onClick={() => setIsAccordionOpen((prev) => !prev)}
          >
            {isAccordionOpen ? "Cancel Adding Tag" : "Add New Tag"}
          </button>
        </div>
        {isAccordionOpen && (
          <div className="w-full mt-4 border-t pt-4">
            <AddTagForm onSuccess={handleTagAdded} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;
