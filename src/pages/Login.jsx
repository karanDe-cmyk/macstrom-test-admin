import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
import axiosInstance from "../utils/axios";
import { toast } from "react-toastify";

function Login({ setIsLoggedIn }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const vapidKey =
    "BCI-Cu-Pg0FnXdyxDeR6LHozhMO_5Ft5I5VIi7bI8ofJhOrHMffJgNbPnHczr1Rtlu9rqVKalQRkQJ5pC6qsc6c";

  const registerFcmToken = async (authToken) => {
    try {
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        await axiosInstance.post(
          "/save-token",
          { token: currentToken },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log("FCM token registered:", currentToken);
      }
    } catch (error) {
      console.error("Error registering FCM token:", error);
    }
  };

  const validateForm = async (e) => {
    e.preventDefault();
    setServerError("");

    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    let valid = true;

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Enter a valid email address");
      valid = false;
    } else setEmailError("");

    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    } else setPasswordError("");

    if (!valid) return;

    try {
      setLoading(true);
      const response = await axiosInstance.post("/auth/admin/login", {
        email,
        password,
      });
      const authToken = response.data.token;
      localStorage.setItem("authToken", authToken);
      navigate("/");
      await registerFcmToken(authToken);
      setIsLoggedIn(true);
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setServerError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg p-10 rounded-2xl shadow-2xl bg-gradient-to-b from-slate-400 via-white to-white backdrop-blur-lg">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Welcome Back!
          </h1>
          <p className="text-sm text-gray-800 mt-2">
            Sign in to access your dashboard
          </p>
        </div>

        <form className="space-y-6 mt-8" onSubmit={validateForm} noValidate>
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
              name="email"
              placeholder="you@example.com"
              className={`mt-1 w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                emailError ? "border border-red-400" : "border border-gray-200"
              }`}
              required
            />
            {emailError && (
              <p className="text-sm text-red-500 mt-1">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-800"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                placeholder="••••••••"
                className={`mt-1 w-full px-4 py-3 pr-12 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
                  passwordError
                    ? "border border-red-400"
                    : "border border-gray-200"
                }`}
                required
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
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <p className="text-center text-sm text-red-600">{serverError}</p>
          )}

          {/* Forgot password */}
          <div className="flex justify-end text-sm">
            <Link
              to="/forgot-password"
              className="text-gray-800 hover:text-gray-900 underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-slate-400 to-zinc-300 hover:opacity-90 text-gray-800 font-semibold rounded-lg transition duration-200 shadow-lg flex items-center justify-center"
          >
            {loading ? (
              <span className="loader border-2 border-gray-800 border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;


