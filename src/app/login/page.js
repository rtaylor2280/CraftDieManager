"use client";

import { useState, useEffect } from "react";
import Spinner from "@/components/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
  const [readyToRender, setReadyToRender] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Track if the user is typing
  const [typingTimeout, setTypingTimeout] = useState(null); // Timeout for validation delay

  useEffect(() => {
    setReadyToRender(true);
    console.log("Component initialized.");
  }, []);

  const validateEmail = (email) => {
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsTyping(true); // User is typing
  
    // Clear any existing timeout
    if (typingTimeout) clearTimeout(typingTimeout);
  
    // Set a new timeout to validate after the user stops typing
    setTypingTimeout(
      setTimeout(() => {
        setIsTyping(false); // User has stopped typing
        if (!validateEmail(value)) {
          setEmailError("Invalid email format");
        } else {
          setEmailError(""); // Clear error if valid
        }
      }, 3000) // Adjust delay as needed
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Attempting login for:", username);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      if (res.ok) {
        console.log("Login successful, redirecting...");
        window.location.href = "/";
      } else {
        const { error } = await res.json();
        setError(error || "Invalid username or password.");
        console.error("Login failed:", error);
      }
    } catch (err) {
      console.error("Network error during login:", err);
      setError("An unexpected error occurred.");
    }
  };

  const handleForgotPassword = async () => {
    console.log("Forgot Password for email:", email);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      console.log("Reset link sent for email:", email);
      setMessage(
        `If this email (${email}) is registered, we will send a reset link. Please check your inbox and spam folder.`
      );
    } catch (err) {
      console.error("Forgot Password network error:", err);
      setMessage(
        "If this email is registered, we have sent a reset link. Please check your inbox and spam folder."
      );
    }
  };  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {readyToRender ? (
        <div className="flex flex-col items-center">
          {showForgotPassword ? (
            <div className="bg-white p-6 rounded shadow-md w-80">
              <h1 className="text-xl font-bold mb-4">Forgot Password</h1>
              {message ? (
                <div className="text-center">
                  <p className="mb-4 text-gray-700">{message}</p>
                  <button
                    onClick={() => {
                      console.log("Redirecting to login after Forgot Password.");
                      window.location.href = "/";
                    }}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full p-2 border rounded mb-2 text-black"
                    required
                  />
                  {!isTyping && emailError && (
                    <p className="text-red-500 text-sm mb-4">{emailError}</p>
                  )}
                  <button
                    onClick={handleForgotPassword}
                    disabled={!email || emailError} // Disable until email is valid
                    className={`w-full p-2 rounded mb-2 ${
                      email && !emailError
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Send Reset Link
                  </button>
                  <button
                    onClick={() => {
                      console.log("Cancel Forgot Password modal.");
                      setShowForgotPassword(false);
                    }}
                    className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleLogin}
              className="bg-white p-6 rounded shadow-md w-80"
            >
              <h1 className="text-xl font-bold mb-4">Login</h1>
              {error && <p className="text-red-500 mb-4">{error}</p>}
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
              </div>
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
                  onClick={() => {
                    console.log("Toggling password visibility.");
                    setShowPassword((prev) => !prev);
                  }}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-700">
                  Remember Me
                </label>
              </div>
              <button
                type="submit"
                disabled={!username || !password} // Disable until both fields are filled
                className={`w-full p-2 rounded ${
                  username && password
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Login
              </button>
              <p
                className="text-center mt-4 text-blue-500 cursor-pointer"
                onClick={() => {
                  console.log("Opening Forgot Password modal.");
                  setShowForgotPassword(true);
                }}
              >
                Forgot Password?
              </p>
            </form>
          )}
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
