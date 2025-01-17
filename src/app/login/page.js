"use client";

import { useState, useEffect } from "react";
import Spinner from "@/components/Spinner"; // Import the Spinner component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Import icons

export default function LoginPage() {
  const [readyToRender, setReadyToRender] = useState(false); // Track when to render inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // Track "Remember Me" checkbox state
  const [showPassword, setShowPassword] = useState(false); // Track password visibility
  const [error, setError] = useState("");

  // Delay rendering until the component is hydrated
  useEffect(() => {
    setReadyToRender(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending login request...");
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      console.log("Response received:", res.status); // Log status code

      if (res.ok) {
        console.log("Login successful, redirecting...");
        window.location.href = "/"; // Redirect to home page on success
      } else {
        const { error } = await res.json();
        console.error("Login failed:", error);
        setError(error || "Invalid username or password.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {readyToRender ? ( // Delay rendering inputs until the client is ready
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80">
          <h1 className="text-xl font-bold mb-4">Login</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {/* Username Field */}
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 pr-10 border rounded mb-4 text-black"
              required
              autoComplete="username"
            />
            {/* Placeholder for LastPass Icon Alignment */}
            <span className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500">
              <FontAwesomeIcon icon={faEyeSlash} className="opacity-0" /> {/* Invisible placeholder */}
            </span>
          </div>
          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 pr-10 border rounded mb-4 text-black"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-5 transform -translate-y-1/2 text-gray-500 hover:text-black"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {/* Remember Me Checkbox */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)} // Update state when checkbox is clicked
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-700">
              Remember Me
            </label>
          </div>
          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
