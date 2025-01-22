"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function UserMenu({ onCloseMenu }) {
  const { user, isAuthenticated, setIsAuthenticated, setUser } = useAuth();
  const router = useRouter();

  const handlePasswordReset = async () => {
    if (!user || !user.userId) {
      alert("Unable to initiate password reset.");
      return;
    }

    try {
      const res = await fetch("/api/auth/initiate-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId }),
      });

      const data = await res.json();

      if (res.ok) {
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
      const res = await fetch("/api/auth/logout", { method: "POST" });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(false);
          setUser(null);
          onCloseMenu();
          router.push("/login");
          return;
        } else {
          alert("Logout failed. Please try again.");
        }
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during logout:", err);
      alert("An error occurred while logging out.");
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-md">
      <p className="px-4 py-2 border-b">{`Welcome, ${user?.firstName || "User"}`}</p>
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
