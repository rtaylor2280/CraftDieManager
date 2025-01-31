"use client";

import React, { useState } from "react";
import TagInputForm from "@/components/dies/AddTagForm";

const TagTestPage = () => {
  const [logMessages, setLogMessages] = useState([]); // For testing logs

  const handleSuccess = (newTagId) => {
    const newLog = `Tag created successfully with ID ${newTagId} at ${new Date().toLocaleTimeString()}`;
    setLogMessages((prevLogs) => [newLog, ...prevLogs]);
  };  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Tag Input Form</h1>

      {/* Tag Input Form */}
      <TagInputForm onSuccess={handleSuccess} />

      {/* Log Output */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Action Logs</h2>
        <ul className="list-disc pl-6">
          {logMessages.length > 0 ? (
            logMessages.map((log, index) => (
              <li key={index} className="text-gray-700">
                {log}
              </li>
            ))
          ) : (
            <li className="text-gray-500">No actions yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TagTestPage;
