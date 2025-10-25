// hooks/useAuth.js
import { useEffect, useState } from "react";

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("authToken"));

  useEffect(() => {
    // On mount, sync isLoggedIn with localStorage
    setIsLoggedIn(!!localStorage.getItem("authToken"));
    // Listen for localStorage changes (cross-tab)
    const handleStorage = () => {
      setIsLoggedIn(!!localStorage.getItem("authToken"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return { isLoggedIn, setIsLoggedIn };
};

export default useAuth;
