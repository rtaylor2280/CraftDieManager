"use client";

import React, { useState } from "react";
import TagSelector from "@/components/dies/TagSelector";

const TestPage = () => {
  const [selectedTags, setSelectedTags] = useState([]); // Track selected tags

  const handleTagSelectionChange = (updatedSelectedTags) => {
    console.log("TestPage received updated selected tags:", updatedSelectedTags);
    setSelectedTags(updatedSelectedTags); // Update selected tags state
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tag Selector Test Page</h1>
      {/* Pass the dieId and handleTagSelectionChange handler */}
      <TagSelector
        onTagSelectionChange={handleTagSelectionChange}
        dieId={79} // Hardcoded dieId for testing
      />
      <div className="mt-4">
        <h3 className="text-lg font-bold">Selected Tags:</h3>
        {/* Display the updated selected tags */}
        <p>{selectedTags.length > 0 ? JSON.stringify(selectedTags) : "No tags selected"}</p>
      </div>
    </div>
  );
};

export default TestPage;
