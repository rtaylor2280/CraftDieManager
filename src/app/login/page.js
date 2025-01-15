"use client";

import { useState, useEffect } from "react";

export default function LoginPage() {
  const [readyToRender, setReadyToRender] = useState(false); // Track when to render inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Delay rendering until the component is hydrated
  useEffect(() => {
    setReadyToRender(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("Sending login request...");
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      console.log("Response received:", res.status); // Log status code

      if (res.ok) {
        console.log("Login successful, redirecting...");
        window.location.href = "/protected"; // Redirect to the protected area on success
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
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-black"
            required
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-black"
            required
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      ) : (
        <p>Loading...</p> // Optional: Add a loading message or spinner
      )}
    </div>
  );
}
