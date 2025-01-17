"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// AuthProvider Component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
  const [user, setUser] = useState(null); // User details (e.g., userId, role)
  const [loading, setLoading] = useState(true); // Loading state for auth check

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/verify", { method: "GET", credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUser(data); // Store user details
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error("Error verifying auth:", err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for consuming AuthContext
export function useAuth() {
  return useContext(AuthContext);
}
