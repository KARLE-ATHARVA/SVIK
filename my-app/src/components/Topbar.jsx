import React, { useState, useEffect } from 'react';
import {
  FiLogOut,
  FiBell,
  FiMessageSquare,
  FiMoon,
  FiStar,
  FiMaximize2,
  FiArrowLeft
} from 'react-icons/fi';
import { MdLanguage } from 'react-icons/md';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("theme") === "dark"
  );
  const [language, setLanguage] = useState("EN");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const logout = () => {
    navigate('/');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "EN" ? "FR" : "EN"));
    alert(`Language switched to ${language === "EN" ? "French" : "English"}`);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  const handleStarClick = () => alert("You clicked on Star!");
  const handleNotifications = () => alert("No new notifications!");
  const handleMessages = () => alert("No new messages!");

  return (
    <div className="flex justify-between items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-6 py-3">
      
      
      <div className="flex items-center">
        {location.pathname !== '/dashboard' && (
          <Link
  to="/dashboard"
  className="flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-md border border-green-200 hover:bg-green-100 transition text-sm font-medium"
>
  <FiArrowLeft className="w-5 h-5" />
  Return to Dashboard
</Link>

        )}
      </div>

      {/* Right Section: Controls */}
      <div className="flex items-center space-x-5 text-gray-700 dark:text-gray-200">
        <FiMaximize2
          onClick={toggleFullscreen}
          className="w-5 h-5 cursor-pointer hover:text-green-700 transition"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        />

        <div
          onClick={toggleLanguage}
          className="flex items-center gap-1 cursor-pointer hover:text-green-700 transition"
          title="Toggle Language"
        >
          <MdLanguage className="w-5 h-5" />
          <span className="text-sm">{language}</span>
        </div>

        <FiStar
          onClick={handleStarClick}
          className="w-5 h-5 cursor-pointer hover:text-green-700 transition"
          title="Star"
        />

        <div
          className="relative cursor-pointer"
          onClick={handleNotifications}
          title="Notifications"
        >
          <FiBell className="w-5 h-5 hover:text-green-700 transition" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        </div>

        <FiMoon
          onClick={toggleDarkMode}
          className="w-5 h-5 cursor-pointer hover:text-green-700 transition"
          title="Toggle Dark Mode"
        />

        <FiMessageSquare
          onClick={handleMessages}
          className="w-5 h-5 cursor-pointer hover:text-green-700 transition"
          title="Messages"
        />

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-md border border-green-200 hover:bg-green-100 transition"
        >
          <FiLogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );
}
