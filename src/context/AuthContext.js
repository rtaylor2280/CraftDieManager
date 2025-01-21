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
        const res = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          console.error("Auth Verify Failed:", res.statusText);
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        const data = await res.json();
        console.log("Auth Verify Response:", data);

        if (data?.authenticated) {
          setIsAuthenticated(true);
          setUser({
            userId: data.userId,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
          });
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error("Error in Auth Verification:", err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, setIsAuthenticated, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook for consuming AuthContext
export function useAuth() {
  return useContext(AuthContext);
}
