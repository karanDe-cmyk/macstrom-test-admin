import React, { useState } from "react";
import axiosInstance from "../utils/axios"; 
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setMessage("");

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    } else if (!validateEmail(email)) {
      setEmailError("Enter a valid email");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post("/auth/admin/forgot-password", { email });
      setMessage(response.data.message || "Reset link sent successfully!");
      setEmail("");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send reset link.";
      setEmailError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-lg p-10 rounded-2xl shadow-2xl bg-gradient-to-b from-slate-400 via-white to-white backdrop-blur-lg">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">Forgot Password 🔑</h1>
          <p className="text-sm text-gray-800 mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        <form className="space-y-6 mt-8" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-800"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 w-full px-4 py-3 rounded-lg bg-gray-100 border-t-2 border-black text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                emailError ? "border border-red-400" : "border border-white/30"
              }`}
              required
            />
            {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
            {message && <p className="text-sm text-green-500 mt-1">{message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-slate-400 to-zinc-300 hover:opacity-90 text-gray-800 font-semibold rounded-lg transition duration-200 shadow-lg"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-800">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-gray-800 font-medium underline hover:text-pink-200"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default ForgotPassword;
