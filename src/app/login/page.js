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
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isEmailValid, setIsEmailValid] = useState(false);

  useEffect(() => {
    setReadyToRender(true);
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsEmailValid(validateEmail(value));

    setIsTyping(true);

    if (typingTimeout) clearTimeout(typingTimeout);

    setTypingTimeout(
      setTimeout(() => {
        setIsTyping(false);
        setEmailError(
          value && !validateEmail(value) ? "Invalid email format" : ""
        );
      }, 3000)
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await res.json();
      if (res.status === 403 && data.firstTimeLogin) {
        window.location.href = `/reset-password?token=${data.resetToken}&rememberMe=${rememberMe}&firstTimeLogin=${data.firstTimeLogin}`;
      } else if (res.ok) {
        window.location.href = "/";
      } else {
        setError(data.error || "Invalid username or password.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  const handleForgotPassword = async () => {
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMessage(
        `If this email (${email}) is registered, we will send a reset link. Please check your inbox and spam folder.`
      );
    } catch {
      setMessage(
        "If this email is registered, we have sent a reset link. Please check your inbox and spam folder."
      );
    }
  };

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
      {readyToRender ? (
        <div className="flex flex-col items-center">
          {showForgotPassword ? (
            <div className="bg-white p-6 rounded shadow-md w-80">
              <h1 className="text-xl font-bold mb-4">Forgot Password</h1>
              {message ? (
                <div className="text-center">
                  <p className="mb-4 text-gray-700">{message}</p>
                  <button
                    onClick={() => setShowForgotPassword(false)}
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
                    disabled={!email || !isEmailValid}
                    className={`w-full p-2 rounded mb-2 ${
                      email && isEmailValid
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Send Reset Link
                  </button>
                  <button
                    onClick={() => setShowForgotPassword(false)}
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
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1} // Excludes this button from the tab order
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
                disabled={!username || !password}
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
                onClick={() => setShowForgotPassword(true)}
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
