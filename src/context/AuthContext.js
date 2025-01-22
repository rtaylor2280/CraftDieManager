"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

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

        if (data?.authenticated) {
          setIsAuthenticated(true);
          setUser({
            userId: data.userId,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role, // Ensure role is included in the response
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
      value={{
        isAuthenticated,
        user,
        loading,
        setIsAuthenticated,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook for consuming AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// Higher-Order Component for Protected Pages
export function withProtectedPage(WrappedComponent, requiredRole) {
  return function ProtectedPageWrapper(props) {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter(); // Ensure useRouter is imported and used

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push("/login"); // Redirect to login if not authenticated
        } else if (requiredRole && user?.role !== requiredRole) {
          router.push("/403"); // Redirect to access denied page if role mismatch
        }
      }
    }, [isAuthenticated, user, loading, requiredRole, router]);

    // Show a loading message while authentication is being verified
    if (
      loading ||
      !isAuthenticated ||
      (requiredRole && user?.role !== requiredRole)
    ) {
      return <p>Loading...</p>;
    }

    // Render the wrapped component if authenticated and authorized
    return <WrappedComponent {...props} />;
  };
}
