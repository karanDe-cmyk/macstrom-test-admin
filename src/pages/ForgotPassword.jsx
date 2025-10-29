// import React, { useState } from "react";
// import axiosInstance from "../utils/axios"; 
// import { Link } from "react-router-dom";

// function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setEmailError("");
//     setMessage("");

//     if (!email.trim()) {
//       setEmailError("Email is required");
//       return;
//     } else if (!validateEmail(email)) {
//       setEmailError("Enter a valid email");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await axiosInstance.post("/auth/admin/forgot-password", { email });
//       setMessage(response.data.message || "Reset link sent successfully!");
//       setEmail("");
//     } catch (error) {
//       const msg = error.response?.data?.message || "Failed to send reset link.";
//       setEmailError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="min-h-screen flex items-center justify-center">
//       {/* Glassmorphism Card */}
//       <div className="w-full max-w-lg p-10 rounded-2xl shadow-2xl bg-gradient-to-b from-slate-400 via-white to-white backdrop-blur-lg">
//         <div className="text-center">
//           <h1 className="text-4xl font-extrabold text-gray-800">Forgot Password 🔑</h1>
//           <p className="text-sm text-gray-800 mt-2">
//             Enter your email to receive a reset link
//           </p>
//         </div>

//         <form className="space-y-6 mt-8" onSubmit={handleSubmit} noValidate>
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
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className={`mt-1 w-full px-4 py-3 rounded-lg bg-gray-100 border-t-2 border-black text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 ${
//                 emailError ? "border border-red-400" : "border border-white/30"
//               }`}
//               required
//             />
//             {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
//             {message && <p className="text-sm text-green-500 mt-1">{message}</p>}
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 bg-gradient-to-r from-slate-400 to-zinc-300 hover:opacity-90 text-gray-800 font-semibold rounded-lg transition duration-200 shadow-lg"
//           >
//             {loading ? "Sending..." : "Send Reset Link"}
//           </button>

//           {/* Footer */}
//           <p className="text-center text-sm text-gray-800">
//             Remember your password?{" "}
//             <Link
//               to="/login"
//               className="text-gray-800 font-medium underline hover:text-pink-200"
//             >
//               Sign in
//             </Link>
//           </p>
//         </form>
//       </div>
//     </section>
//   );
// }

// export default ForgotPassword;

"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axiosInstance from "../utils/axios"

function ForgotPassword() {
  const [step, setStep] = useState("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [otpError, setOtpError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [serverError, setServerError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setServerError("")
    setEmailError("")

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Enter a valid email address")
      return
    }

    try {
      setLoading(true)
      await axiosInstance.post("/auth/admin/send-forgot-password-otp", {
        email,
      })
      setStep("otp")
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send OTP. Please try again."
      setServerError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setServerError("")
    setOtpError("")
    setPasswordError("")

    let valid = true

    if (!otp || otp.length < 6) {
      setOtpError("OTP must be 6 digits")
      valid = false
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      valid = false
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      valid = false
    }

    if (!valid) return

    try {
      setLoading(true)
      await axiosInstance.post("/auth/admin/verify-forgot-password-otp", {
        email,
        otp,
        newPassword,
      })
      setServerError("")
      alert("Password reset successfully! Please login with your new password.")
      navigate("/login")
    } catch (err) {
      const message = err.response?.data?.message || "Password reset failed. Please try again."
      setServerError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep("email")
    setOtp("")
    setNewPassword("")
    setConfirmPassword("")
    setOtpError("")
    setPasswordError("")
    setServerError("")
  }

  return (
    <div className="min-h-screen  w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h1>
            <p className="text-slate-600 text-sm">Enter your email to reset your password</p>
          </div>

          {/* Step 1: Email */}
          {step === "email" && (
            <form className="space-y-5" onSubmit={handleSendOtp} noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white text-slate-900 placeholder-slate-400 focus:outline-none ${
                    emailError ? "border-red-500 focus:border-red-600" : "border-slate-200 focus:border-blue-500"
                  }`}
                  required
                />
                {emailError && <p className="text-red-600 text-sm mt-2 font-medium">{emailError}</p>}
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-medium">{serverError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP & New Password */}
          {step === "otp" && (
            <form className="space-y-5" onSubmit={handleVerifyOtp} noValidate>
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-slate-700 mb-2">
                  One-Time Password
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  maxLength="6"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors bg-white text-slate-900 placeholder-slate-400 focus:outline-none text-center text-2xl tracking-widest font-mono ${
                    otpError ? "border-red-500 focus:border-red-600" : "border-slate-200 focus:border-blue-500"
                  }`}
                  required
                />
                {otpError && <p className="text-red-600 text-sm mt-2 font-medium">{otpError}</p>}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors bg-white text-slate-900 placeholder-slate-400 focus:outline-none ${
                      passwordError ? "border-red-500 focus:border-red-600" : "border-slate-200 focus:border-blue-500"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible((prev) => !prev)}
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                  >
                    {passwordVisible ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-colors bg-white text-slate-900 placeholder-slate-400 focus:outline-none ${
                      passwordError ? "border-red-500 focus:border-red-600" : "border-slate-200 focus:border-blue-500"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible((prev) => !prev)}
                    aria-label={confirmPasswordVisible ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                  >
                    {confirmPasswordVisible ? "Hide" : "Show"}
                  </button>
                </div>
                {passwordError && <p className="text-red-600 text-sm mt-2 font-medium">{passwordError}</p>}
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-medium">{serverError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToEmail}
                className="w-full py-2 text-slate-700 hover:text-slate-900 font-medium text-sm border border-slate-300 rounded-lg transition-colors hover:bg-slate-50"
              >
                Back
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-sm mt-6">
          Remember your password?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword

