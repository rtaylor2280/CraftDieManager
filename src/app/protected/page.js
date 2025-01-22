"use client";

import { withProtectedPage } from "@/context/AuthContext";

function ProtectedPage() {
  return (
    <div>
      <h1>Admin Only Page</h1>
      <p>This page is restricted to users with the "admin" role.</p>
    </div>
  );
}

export default withProtectedPage(ProtectedPage, "admin");
