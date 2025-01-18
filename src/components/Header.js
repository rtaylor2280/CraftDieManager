"use client"; // Required for client-side hooks

import Link from "next/link";
import LogoutButton from "./LogoutButton";
import Spinner from "@/components/Spinner";
import { useAuth } from "@/context/AuthContext"; // Import the useAuth hook

export default function Header() {
  const { isAuthenticated, user, loading } = useAuth(); // Use the AuthContext

  if (loading) {
    return (
      <header className="sticky top-0 z-10 bg-gray-800 text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Craft Die Manager</h1>
          <Spinner />
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
          <>
            <p className="mr-4">{`Welcome, ${user?.role || "User"}`}</p>
            <LogoutButton />
          </>
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
