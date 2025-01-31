"use client";

import React, { useState, useEffect } from "react";

const TagInputForm = ({ onSuccess }) => {
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setAllCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateTag = async () => {
    try {
      if (!newTagName.trim()) {
        setMessage({ text: "Tag name is required.", type: "error" });
        return;
      }

      console.log(
        "Checking if tag exists before creating category:",
        newTagName.trim()
      );
      const tagExistsResponse = await fetch(
        `/api/tags?checkTag=true&tagName=${encodeURIComponent(
          newTagName.trim()
        )}`
      );
      const tagExistsData = await tagExistsResponse.json();
      console.log("Tag existence check response:", tagExistsData);

      if (tagExistsData.exists) {
        setMessage({
          text: `Tag "${newTagName.trim()}" already exists.`,
          type: "error",
        });
        return;
      }

      let categoryId = selectedCategory ? parseInt(selectedCategory, 10) : null;

      if (!categoryId && newCategoryName.trim()) {
        const existingCategory = allCategories.find(
          (cat) =>
            cat.category_name.toLowerCase() ===
            newCategoryName.trim().toLowerCase()
        );
        if (existingCategory) {
          setMessage({
            text: `Category "${existingCategory.category_name}" already exists.`,
            type: "error",
          });
          return;
        }

        console.log("Creating new category:", newCategoryName.trim());
        const categoryResponse = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategoryName.trim() }),
        });

        const categoryData = await categoryResponse.json();

        if (categoryData.error) {
          setMessage({ text: `Error: ${categoryData.error}`, type: "error" });
          return;
        }

        categoryId = categoryData.id;
        setAllCategories((prev) => [
          ...prev,
          { category_id: categoryId, category_name: newCategoryName.trim() },
        ]);
        setSelectedCategory(categoryId.toString());
      }

      if (categoryId) {
        console.log(
          "Creating new tag:",
          newTagName.trim(),
          "in category ID:",
          categoryId
        );
        const tagResponse = await fetch("/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newTagName.trim(),
            category_id: categoryId,
          }),
        });

        const tagData = await tagResponse.json();

        if (tagData.error) {
          setMessage({ text: `Error: ${tagData.error}`, type: "error" });
        } else {
          setMessage({
            text: `Tag "${tagData.name}" created successfully in category "${tagData.category_name}".`,
            type: "success",
          });

          // Invoke the success callback if provided
          if (onSuccess) {
            onSuccess(tagData.id);
          }

          setNewTagName("");
          setNewCategoryName("");
          setSelectedCategory("");
        }
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      setMessage({
        text: "An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Create a New Tag</h2>

      <div className="mb-4">
        <label className="block mb-1">Tag Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Enter tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Category</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedCategory || ""}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setNewCategoryName("");
          }}
        >
          <option value="">Select an existing category</option>
          {allCategories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </option>
          ))}
        </select>
        <p className="text-gray-500 text-sm mt-2">OR</p>
        <input
          type="text"
          className="w-full p-2 border rounded mt-2"
          placeholder="Type a new category name"
          value={newCategoryName || ""}
          onChange={(e) => {
            setNewCategoryName(e.target.value);
            setSelectedCategory("");
          }}
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <button
        type="button" // Explicitly define the button type
        className={`w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 ${
          !newTagName.trim() || (!selectedCategory && !newCategoryName.trim())
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
        onClick={(e) => {
          e.preventDefault(); // Prevent the form from submitting
          handleCreateTag();
        }}
        disabled={
          !newTagName.trim() || (!selectedCategory && !newCategoryName.trim())
        }
      >
        Create Tag
      </button>

      {message.text && (
        <div
          className={`mt-4 p-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default TagInputForm;
