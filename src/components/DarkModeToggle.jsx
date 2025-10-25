import React, { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';


const DarkModeToggle = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="
        p-2 sm:p-3
        rounded-full
        bg-gray-200 dark:bg-gray-800
        transition-colors duration-300
        shadow-md hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500
      "
    >
      {darkMode ? (
        <Sun className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
      ) : (
        <Moon className="text-gray-700 w-5 h-5 sm:w-6 sm:h-6" />
      )}
    </button>
  );
};

export default DarkModeToggle;
