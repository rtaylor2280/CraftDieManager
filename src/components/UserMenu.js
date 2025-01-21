"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // Import the AuthContext

export default function UserMenu({ onCloseMenu }) {
  const { user, isAuthenticated, setIsAuthenticated, setUser } = useAuth(); // Access user from AuthContext
  const router = useRouter();

  const handlePasswordReset = async () => {
    if (!user || !user.userId) {
      console.error("User ID is not available.");
      alert("Unable to initiate password reset.");
      return;
    }

    try {
      console.log("User ID being sent:", user.userId);
      const res = await fetch("/api/auth/initiate-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId }), // Send user ID
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Redirecting to reset password...");
        window.location.href = `/reset-password?token=${data.token}&rememberMe=${data.rememberMe}`;
      } else {
        alert(data.error || "Failed to initiate password reset.");
      }
    } catch (error) {
      console.error("Error initiating password reset:", error);
      alert("An unexpected error occurred.");
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      const res = await fetch("/api/auth/logout", { method: "POST" });
      console.log("Logout Response Status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("Logout Response Data:", data);

        if (data.success) {
          console.log("Logout successful.");
          setIsAuthenticated(false);
          setUser(null);
          onCloseMenu(); // Close the menu
          router.push("/login"); // Redirect to login page
          return;
        } else {
          console.error("Logout failed (unexpected response):", data);
          alert("Logout failed. Please try again.");
        }
      } else {
        console.error("Logout failed with status:", res.status);
        alert("Logout failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during logout:", err);
      alert("An error occurred while logging out.");
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-md">
      <p className="px-4 py-2 border-b">{`Welcome, ${
        user?.firstName || "User"
      }`}</p>
      <button
        onClick={handlePasswordReset}
        className="block px-4 py-2 w-full text-left hover:bg-gray-100"
      >
        Change Password
      </button>
      <button
        onClick={handleLogout}
        className="block px-4 py-2 text-left w-full hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  );
}
