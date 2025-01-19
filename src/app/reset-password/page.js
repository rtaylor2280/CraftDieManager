"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [tokenValid, setTokenValid] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch("/api/auth/validate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok && data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setTokenValid(false);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      validateToken();
    } else {
      setTokenValid(false);
      setLoading(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password reset successfully!");
        router.push("/login");
      } else {
        setErrorMessage(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMessage("An unexpected error occurred");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!tokenValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md w-80 text-center">
          <p className="text-red-500 text-lg font-bold mb-4">Link Expired</p>
          <p className="text-gray-700 mb-4">
            The password reset link is invalid or has expired. Please request a
            new reset link.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h1 className="text-xl font-bold mb-4">Reset Password</h1>
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        <div className="mb-4">
          <label
            htmlFor="newPassword"
            className="block text-gray-700 font-medium mb-2"
          >
            New Password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-gray-700 font-medium mb-2"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
