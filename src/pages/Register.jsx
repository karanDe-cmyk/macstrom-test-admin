import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axios";

function Register() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (/\d/.test(formData.name)) {
      newErrors.name = "Name should not contain numbers";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/auth/admin/register",
        formData
      );
      console.log("✅ Registration successful:", response.data);
      navigate("/login");
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Try again.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-lg m-3 p-10 rounded-2xl shadow-2xl bg-gradient-to-b from-slate-400 via-white to-white backdrop-blur-lg">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Create Account ✨
          </h1>
          <p className="text-sm text-gray-800 mt-2">
            Join us and start your journey
          </p>
        </div>

        <form className="space-y-6 mt-8" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`mt-1 w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                errors.name ? "border border-red-400" : "border border-gray-200"
              }`}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`mt-1 w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                errors.email ? "border border-red-400" : "border border-gray-200"
              }`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="1234567890"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={`mt-1 w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                errors.phone ? "border border-red-400" : "border border-gray-200"
              }`}
            />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={`mt-1 w-full px-4 py-3 pr-12 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                  errors.password
                    ? "border border-red-400"
                    : "border border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((prev) => !prev)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
              >
                {passwordVisible ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <p className="text-center text-sm text-red-600">{serverError}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-slate-400 to-zinc-300 hover:opacity-90 text-gray-800 font-semibold rounded-lg transition duration-200 shadow-lg flex items-center justify-center"
          >
            {loading ? (
              <span className="loader border-2 border-gray-800 border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
            ) : (
              "Register"
            )}
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-800">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-gray-800 font-medium underline hover:text-pink-500"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Register;
