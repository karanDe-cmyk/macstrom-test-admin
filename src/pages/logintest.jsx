'use client'

import { useState } from "react";
// Ensure you have bcryptjs installed: npm install bcryptjs

// --- Client-Side Hashing/Formatting Logic (Provided by user) ---

// Helper to base64 encode in browser
function toBase64(str) {
  // btoa works on binary strings, so we use encodeURIComponent/unescape/atob for full Unicode safety
  return btoa(unescape(encodeURIComponent(str)));
}

// Deterministic custom format (as provided by the user)
function customFormatClient(password, salt, rounds = 3) {
  // salt: string provided by server (should be sufficiently random)
  let s = `${salt}:${password}`;

  for (let i = 0; i < rounds; i++) {
    // 1) reverse
    s = s.split('').reverse().join('');

    // 2) base64 encode
    s = toBase64(s);

    // 3) interleave small chunk of salt at interval
    const chunk = salt.slice(i % salt.length, (i % salt.length) + 3) || salt.slice(0, 3);
    let out = '';
    for (let j = 0; j < s.length; j++) {
      out += s[j];
      if ((j + 1) % 4 === 0) out += chunk; // insert chunk every 4 chars
    }
    s = out;
  }

  // final shrink: limit length
  return s.slice(0, 256);
}

// --- Main Component ---

export default function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'

  // --- Utility Functions ---

  const getSalt = async () => {
    const saltRes = await fetch(`http://localhost:5000/api/auth/salt`);
    if (!saltRes.ok) throw new Error("Failed to fetch salt for registration.");
    const { salt } = await saltRes.json();
    return salt;
  };

  // --- Handler Functions ---

  const handleRegistration = async () => {
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    try {
      // 1️⃣ Get a new salt from the server for the new user
      // The server is expected to generate a random salt and return it.
      const saltRes = await fetch(`http://localhost:5000/api/auth/salt`);
      const { salt } = await saltRes.json();

      // 2️⃣ Hash password locally using the custom format
      const formattedPassword = customFormatClient(password, salt);

      // 3️⃣ Send to backend (as per the provided API structure)
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, formattedPassword, salt }),
      });

      const data = await res.json();
      alert(data.message || (res.ok ? "Registration successful!" : "Registration failed."));

      if (res.ok) {
        setUsername("");
        setPassword("");
        setActiveTab("login"); // Switch to login tab after successful registration
      }

    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration attempt failed due to a network or server error.");
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    try {
      const saltRes = await fetch(`http://localhost:5000/api/auth/salt?username=${username}`);
      if (!saltRes.ok) {
        const errorData = await saltRes.json();
        alert(`Error fetching salt: ${errorData.message || 'User not found'}`);
        return;
      }

      const { salt } = await saltRes.json();

      // Create formatted password (same as registration)
      const formattedPassword = customFormatClient(password, salt);

      // Send login request
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, formattedPassword }),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        setUsername("");
        setPassword("");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login attempt failed due to a network or server error.");
    }
  };


  const TabButton = ({ tabName, label }) => (
    <button
      onClick={() => {
        setActiveTab(tabName);
        setUsername("");
        setPassword("");
      }}
      className={`flex-1 py-3 text-center text-lg font-semibold transition-all duration-200 border-b-4 ${activeTab === tabName
        ? 'text-indigo-600 border-indigo-600'
        : 'text-gray-500 border-transparent hover:text-indigo-400'
        }`}
    >
      {label}
    </button>
  );

  return (
    // Outer container for centering and background
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">

      {/* Auth Card/Form Container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-0">

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <TabButton tabName="login" label="Sign In" />
          <TabButton tabName="register" label="Register" />
        </div>

        {/* Form Content */}
        <div className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center text-indigo-700">
            {activeTab === 'login' ? '🔒 Welcome Back' : '🚀 Create Account'}
          </h1>

          {/* Username Input */}
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
          />

          {/* Password Input */}
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
          />

          {/* Action Button */}
          <button
            onClick={activeTab === 'login' ? handleLogin : handleRegistration}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            {activeTab === 'login' ? 'Sign In' : 'Register'}
          </button>

          {/* Footer Text */}
          <p className="text-sm text-center text-gray-500 pt-2">
            This system uses client-side hashing/formatting for enhanced security.
          </p>
        </div>
      </div>
    </div>
  );
}