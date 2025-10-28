// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { getToken } from "firebase/messaging";
// import { messaging } from "../firebase";
// import axiosInstance from "../utils/axios";

// function Login({ setIsLoggedIn }) {
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [serverError, setServerError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const vapidKey =
//     "BCI-Cu-Pg0FnXdyxDeR6LHozhMO_5Ft5I5VIi7bI8ofJhOrHMffJgNbPnHczr1Rtlu9rqVKalQRkQJ5pC6qsc6c";

//   const registerFcmToken = async (authToken) => {
//     try {
//       const currentToken = await getToken(messaging, { vapidKey });
//       if (currentToken) {
//         await axiosInstance.post(
//           "/save-token",
//           { token: currentToken },
//           { headers: { Authorization: `Bearer ${authToken}` } }
//         );
//         console.log("FCM token registered:", currentToken);
//       }
//     } catch (error) {
//       console.error("Error registering FCM token:", error);
//     }
//   };

//   const validateForm = async (e) => {
//     e.preventDefault();
//     setServerError("");

//     const email = e.target.email.value.trim();
//     const password = e.target.password.value.trim();

//     let valid = true;

//     if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
//       setEmailError("Enter a valid email address");
//       valid = false;
//     } else setEmailError("");

//     if (!password || password.length < 6) {
//       setPasswordError("Password must be at least 6 characters");
//       valid = false;
//     } else setPasswordError("");

//     if (!valid) return;

//     try {
//       setLoading(true);
//       const response = await axiosInstance.post("/auth/admin/login", {
//         email,
//         password,
//       });
//       const authToken = response.data.token;
//       localStorage.setItem("authToken", authToken);
//       navigate("/");
//       await registerFcmToken(authToken);
//       setIsLoggedIn(true);
//     } catch (err) {
//       const message =
//         err.response?.data?.message || "Login failed. Please try again.";
//       setServerError(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="min-h-screen flex items-center justify-center">
//       <div className="w-full max-w-lg p-10 rounded-2xl shadow-2xl bg-gradient-to-b from-slate-400 via-white to-white backdrop-blur-lg">
//         <div className="text-center">
//           <h1 className="text-4xl font-extrabold text-gray-800">
//             Welcome Back!
//           </h1>
//           <p className="text-sm text-gray-800 mt-2">
//             Sign in to access your dashboard
//           </p>
//         </div>

//         <form className="space-y-6 mt-8" onSubmit={validateForm} noValidate>
//           {/* Email */}
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-gray-800"
//             >
//               Email address
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               placeholder="you@example.com"
//               className={`mt-1 w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
//                 emailError ? "border border-red-400" : "border border-gray-200"
//               }`}
//               required
//             />
//             {emailError && (
//               <p className="text-sm text-red-500 mt-1">{emailError}</p>
//             )}
//           </div>

//           {/* Password */}
//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-gray-800"
//             >
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type={passwordVisible ? "text" : "password"}
//                 id="password"
//                 name="password"
//                 placeholder="••••••••"
//                 className={`mt-1 w-full px-4 py-3 pr-12 rounded-lg bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
//                   passwordError
//                     ? "border border-red-400"
//                     : "border border-gray-200"
//                 }`}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setPasswordVisible((prev) => !prev)}
//                 aria-label={passwordVisible ? "Hide password" : "Show password"}
//                 className="absolute top-1/2 right-4 transform -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
//               >
//                 {passwordVisible ? "Hide" : "Show"}
//               </button>
//             </div>
//             {passwordError && (
//               <p className="text-sm text-red-500 mt-1">{passwordError}</p>
//             )}
//           </div>

//           {/* Server Error */}
//           {serverError && (
//             <p className="text-center text-sm text-red-600">{serverError}</p>
//           )}

//           {/* Forgot password */}
//           <div className="flex justify-end text-sm">
//             <Link
//               to="/forgot-password"
//               className="text-gray-800 hover:text-gray-900 underline"
//             >
//               Forgot password?
//             </Link>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 bg-gradient-to-r from-slate-400 to-zinc-300 hover:opacity-90 text-gray-800 font-semibold rounded-lg transition duration-200 shadow-lg flex items-center justify-center"
//           >
//             {loading ? (
//               <span className="loader border-2 border-gray-800 border-t-transparent rounded-full w-5 h-5 animate-spin"></span>
//             ) : (
//               "Sign In"
//             )}
//           </button>
//         </form>
//       </div>
//     </section>
//   );
// }

// export default Login;



"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
import axiosInstance from "../utils/axios";
import { Eye, EyeOff, ChevronLeft, Send, LogIn, Lock, CheckCircle } from "lucide-react"; // Importing icons for a modern touch

function Auth({ setIsLoggedIn }) {
  const [step, setStep] = useState("loginEmail"); // loginEmail -> loginOtp -> forgotEmail -> forgotOtp
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const vapidKey =
    "BCI-Cu-Pg0FnXdyxDeR6LHozhMO_5Ft5I5VIi7bI8ofJhOrHMffJgNbPnHczr1Rtlu9rqVKalQRkQJ5pC6qsc6c";

  // 🔹 Save FCM Token
  const registerFcmToken = async (authToken) => {
    try {
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        await axiosInstance.post(
          "/save-token",
          { token: currentToken },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log("✅ FCM token registered:", currentToken);
      }
    } catch (err) {
      console.error("❌ Error registering FCM token:", err);
    }
  };

  // 🔹 LOGIN: Send OTP
  const handleLoginSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/auth/admin/send-login-otp", { email });
      setStep("loginOtp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
const deviceId = localStorage.getItem("deviceId") || (() => {
  const id = `device_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem("deviceId", id);
  return id;
})();
  // 🔹 LOGIN: Verify OTP + Password
  const handleLoginVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
     const response = await axiosInstance.post(
  "/auth/admin/verify-login-otp",
  { email, otp, password },
  {
    headers: {
      "x-device-id": deviceId, // ✅ Required by backend
    },
  }
);

      const { token, user } = response.data;

      if (!token) throw new Error("Token not found");

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      registerFcmToken(token);

      setIsLoggedIn(true);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 FORGOT PASSWORD: Send OTP
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/auth/admin/send-forgot-password-otp", { email });
      setStep("forgotOtp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 FORGOT PASSWORD: Verify OTP + Reset Password
  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/auth/admin/verify-forgot-password-otp", {
        email,
        otp,
        newPassword,
      });
      alert("Password reset successfully! Please login with your new password.");
      setStep("loginEmail");
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 BACK BUTTON
  const handleBack = () => {
    setError("");
    setOtp("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");

    switch (step) {
      case "loginOtp":
        setStep("loginEmail");
        break;
      case "forgotEmail":
        setStep("loginEmail");
        break;
      case "forgotOtp":
        setStep("forgotEmail");
        break;
      default:
        navigate("/"); // optional: navigate to home if on loginEmail
        break;
    }
  };

  const isLoginStep = step.startsWith("login");

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 transition-all duration-300 transform hover:shadow-3xl">
        {/* Back Button */}
        {step !== "loginEmail" && step !== "forgotEmail" && (
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
            type="button"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back
          </button>
        )}

        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {isLoginStep ? " Macstrom Admin Login " : "Reset Password"}
        </h1>
        <p className="text-gray-500 text-base mb-8">
          {isLoginStep
            ? step === "loginEmail"
              ? "Enter your email to receive a secure login code."
              : "Enter OTP and your password to sign in."
            : step === "forgotEmail"
            ? "Enter your email to receive a password reset code."
            : "Enter the OTP and your new password."}
        </p>

        {/* Error Message */}
        {error && (
          <div className="flex items-center p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg" role="alert">
            <svg
              className="flex-shrink-0 inline w-4 h-4 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 002 0v-3a1 1 0 00-2 0z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* LOGIN: Email */}
        {step === "loginEmail" && (
          <form onSubmit={handleLoginSendOtp} className="space-y-6">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out disabled:bg-gray-400 disabled:shadow-none"
            >
              {loading ? "Sending..." : "Send OTP"}
              {!loading && <Send size={20} className="ml-2" />}
            </button>
            <p className="text-center text-sm mt-4">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setStep("forgotEmail");
                }}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </p>
          </form>
        )}

        {/* LOGIN: OTP + Password */}
        {step === "loginOtp" && (
          <form onSubmit={handleLoginVerifyOtp} className="space-y-6">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full text-center text-2xl font-mono tracking-widest px-5 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-5 py-3 pr-12 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((prev) => !prev)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out disabled:bg-gray-400 disabled:shadow-none"
            >
              {loading ? "Verifying..." : "Verify & Login"}
              {!loading && <LogIn size={20} className="ml-2" />}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD: Email */}
        {step === "forgotEmail" && (
          <form onSubmit={handleForgotSendOtp} className="space-y-6">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out disabled:bg-gray-400 disabled:shadow-none"
            >
              {loading ? "Sending..." : "Send Reset Link"}
              {!loading && <Lock size={20} className="ml-2" />}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="w-full flex items-center justify-center py-3 text-gray-700 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 transition duration-300 ease-in-out"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back to Login
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD: OTP + New Password */}
        {step === "forgotOtp" && (
          <form onSubmit={handleForgotVerifyOtp} className="space-y-6">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full text-center text-2xl font-mono tracking-widest px-5 py-3 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password (min 6 chars)"
                className="w-full px-5 py-3 pr-12 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((prev) => !prev)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                aria-label={passwordVisible ? "Hide new password" : "Show new password"}
              >
                {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="w-full px-5 py-3 pr-12 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
              <button
                type="button"
                onClick={() => setConfirmPasswordVisible((prev) => !prev)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                aria-label={confirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
              >
                {confirmPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out disabled:bg-gray-400 disabled:shadow-none"
            >
              {loading ? "Resetting..." : "Reset Password"}
              {!loading && <CheckCircle size={20} className="ml-2" />}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="w-full flex items-center justify-center py-3 text-gray-700 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 transition duration-300 ease-in-out"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back to Forgot Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Auth;