"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Import the useAuth hook
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons"; // Import hamburger icon
import { useState, useEffect } from "react";
import UserMenu from "./UserMenu"; // Import UserMenu component

export default function Header() {
  const { isAuthenticated, loading } = useAuth(); // Use the AuthContext
  const [menuOpen, setMenuOpen] = useState(false); // Track menu state
  const [isSmallScreen, setIsSmallScreen] = useState(false); // Track screen width

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Update screen size state on resize
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    handleResize(); // Check initially
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <header className="sticky top-0 z-10 bg-gray-800 text-white py-4 shadow-md">
        <div className="container mx-auto flex justify-center items-center">
          <h1 className="text-2xl font-bold px-4">Craft Die Manager</h1>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 bg-gray-800 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <img
            src="/CraftDieManagerLogoWH.svg" // Path to the SVG file
            alt="Craft Die Manager Logo"
            className="h-10 w-10 object-contain"
          />
          {!isSmallScreen && (
            <h1 className="text-2xl font-bold">Craft Die Manager</h1>
          )}
        </Link>

        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            {menuOpen && <UserMenu onCloseMenu={() => setMenuOpen(false)} />}
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
