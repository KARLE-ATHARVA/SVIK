import React, { useState, useEffect } from 'react';
import {
  FiLogOut,
  FiBell,
  FiMessageSquare,
  FiMoon,
  FiStar,
  FiMaximize2,
  FiMinimize2,
  FiArrowLeft
} from 'react-icons/fi';
import { MdLanguage } from 'react-icons/md';
import { FaMoon } from 'react-icons/fa';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Topbar({
  darkMode,
  toggleDarkMode,
  toggleSidebar = () => {}, // ✅ fallback function
  sidebarCollapsed = false
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [language, setLanguage] = useState("EN");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [starred, setStarred] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const logout = () => navigate('/');

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
    const nextLang = language === "EN" ? "FR" : "EN";
    setLanguage(nextLang);
    alert(`Language switched to ${nextLang === "EN" ? "English" : "French"}`);
  };

  const toggleStar = () => {
    setStarred(prev => !prev);
    setShowBookmarks(prev => !prev);
    setShowMessages(false);
    setShowNotifications(false);
  };

  const toggleMessages = () => {
    setShowMessages(prev => !prev);
    setShowBookmarks(false);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
    setShowMessages(false);
    setShowBookmarks(false);
  };

  return (
    <div className="flex justify-between items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-6 py-3 relative z-50">
      <div className="flex items-center space-x-4">
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
      <div className="flex items-center space-x-5 text-gray-700 dark:text-gray-200 relative">
        {isFullscreen ? (
          <FiMinimize2
            onClick={toggleFullscreen}
            className="w-5 h-5 cursor-pointer hover:text-green-700 transition"
            title="Exit Fullscreen"
          />
        ) : (
          <FiMaximize2
            onClick={toggleFullscreen}
            className="w-5 h-5 cursor-pointer hover:text-green-700 transition"
            title="Enter Fullscreen"
          />
        )}
        <div
          onClick={toggleLanguage}
          className="flex items-center gap-1 cursor-pointer hover:text-green-700 transition"
          title="Toggle Language"
        >
          <MdLanguage className="w-5 h-5" />
          <span className="text-sm">{language}</span>
        </div>
        <div className="relative">
          <FiStar
            onClick={toggleStar}
            className={`w-5 h-5 cursor-pointer transition ${
              starred ? 'text-yellow-500' : 'hover:text-green-700'
            }`}
            title="Bookmarks"
          />
          {showBookmarks && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 p-3 text-sm">
              <p className="mb-2 font-semibold text-gray-800 dark:text-white">📁 Bookmarks</p>
              <ul className="space-y-1 text-gray-700 dark:text-gray-200">
                <li>📧 Email</li>
                <li>📦 Widgets</li>
                <li>📊 Reports</li>
              </ul>
            </div>
          )}
        </div>
        <div className="relative">
          <FiBell
            onClick={toggleNotifications}
            className="w-5 h-5 cursor-pointer hover:text-green-700 transition"
            title="Notifications"
          />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 p-3 text-sm">
              <p className="mb-2 font-semibold text-gray-800 dark:text-white">🔔 Notifications</p>
              <ul className="space-y-1 text-gray-700 dark:text-gray-200">
                <li>🚚 Delivery pending</li>
                <li>💬 New comment on report</li>
                <li>📥 You have a new file</li>
              </ul>
            </div>
          )}
        </div>
        {darkMode ? (
          <FaMoon
            onClick={toggleDarkMode}
            className="w-5 h-5 cursor-pointer text-white hover:text-green-700 transition"
            title="Toggle Dark Mode"
          />
        ) : (
          <FiMoon
            onClick={toggleDarkMode}
            className="w-5 h-5 cursor-pointer hover:text-green-700 transition"
            title="Toggle Dark Mode"
          />
        )}
        <div className="relative">
          <FiMessageSquare
            onClick={toggleMessages}
            className="w-5 h-5 cursor-pointer hover:text-green-700 transition"
            title="Messages"
          />
          {showMessages && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 p-3 text-sm">
              <p className="mb-2 font-semibold text-gray-800 dark:text-white">📨 Messages</p>
              <ul className="space-y-1 text-gray-700 dark:text-gray-200">
                <li>📌 Hi, your report is ready.</li>
                <li>📌 Can we talk later?</li>
                <li>📌 Reminder: Client follow-up</li>
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-md border border-green-200 hover:bg-green-100 transition text-sm"
        >
          <FiLogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );
}
