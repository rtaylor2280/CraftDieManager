"use client"; // Required for client-side hooks

import { useState, useEffect } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
  const [loading, setLoading] = useState(true); // Loading state for auth check

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/verify", { method: "GET", credentials: "include" });
        setIsAuthenticated(res.ok); // Update state based on response
      } catch (err) {
        console.error("Error verifying auth:", err);
        setIsAuthenticated(false); // Default to unauthenticated on error
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <header className="sticky top-0 z-10 bg-gray-800 text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Craft Die Manager</h1>
          <div>Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 bg-gray-800 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer">Craft Die Manager</h1>
        </Link>
        {isAuthenticated ? (
          <LogoutButton />
        ) : (
          <a
            href="/login"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Login
          </a>
        )}
      </div>
    </header>
  );
}
