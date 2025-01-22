"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function ResetPasswordForm() {
  const [tokenValid, setTokenValid] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const rememberMe = searchParams.get("rememberMe") === "true";
  const firstTimeLogin = searchParams.get("firstTimeLogin") === "true";

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        console.error("No token provided");
        setTokenValid(false);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await res.json();
        setTokenValid(res.ok && data.valid);
      } catch (error) {
        console.error("Error validating token:", error);
        setTokenValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
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
        body: JSON.stringify({ token, newPassword, rememberMe }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password updated successfully!");
        router.push("/");
      } else {
        setErrorMessage(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrorMessage("An unexpected error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center bg-gray-100">
        <Spinner />
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="flex flex-grow items-center justify-center bg-gray-100">
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Process only elements with the "include-enter" class
      if (!e.target.className.includes("include-enter")) {
        return; // Skip processing Enter key for other elements
      }

      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);

      if (form.elements[index + 1]) {
        form.elements[index + 1].focus();
      } else {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        {firstTimeLogin && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 text-sm font-medium rounded">
            Password reset is required on first login.
          </div>
        )}
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        <div className="mb-4 relative">
          <label
            htmlFor="newPassword"
            className="block text-gray-700 font-medium mb-2"
          >
            New Password
          </label>
          <input
            id="newPassword"
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 pr-10 border rounded text-black"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-14 transform -translate-y-1/2 text-gray-500 hover:text-black"
            onClick={() => setShowPasswords((prev) => !prev)}
            tabIndex={-1} // Excludes this button from the tab order
          >
            <FontAwesomeIcon icon={showPasswords ? faEyeSlash : faEye} />
          </button>
        </div>
        <div className="mb-4 relative">
          <label
            htmlFor="confirmPassword"
            className="block text-gray-700 font-medium mb-2"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPasswords ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 pr-10 border rounded text-black"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-14 transform -translate-y-1/2 text-gray-500 hover:text-black"
            onClick={() => setShowPasswords((prev) => !prev)}
            tabIndex={-1} // Excludes this button from the tab order
          >
            <FontAwesomeIcon icon={showPasswords ? faEyeSlash : faEye} />
          </button>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
        >
          Submit Password
        </button>
      </form>
    </div>
  );
}
