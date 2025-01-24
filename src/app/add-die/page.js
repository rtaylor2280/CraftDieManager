"use client";

import AddDieForm from "@/components/dies/AddDieForm";

export default function AddDiePage() {
  const handleSuccess = (id) => {
    // Perform redirection or other logic after success
    console.log(`Redirecting to /edit-die/${id}`);
    window.location.href = `/edit-die/${id}`; // Simple redirection
  };

  return <AddDieForm onSuccess={handleSuccess} />;
}
