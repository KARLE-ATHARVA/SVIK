import React, { useState } from 'react';
import {
  FiLogOut, FiBell, FiMessageSquare, FiMoon, FiStar,
  FiMaximize2, FiMinimize2
} from 'react-icons/fi';
import { MdLanguage } from 'react-icons/md';
import { FaMoon } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // <-- use global theme

export default function Topbar() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme(); // <-- from context
  const [language, setLanguage] = useState("EN");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [starred, setStarred] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

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

  return (
    <div className="flex justify-between items-center bg-white dark:bg-[#1f2937] border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 md:px-6 py-2 z-40 relative">
      <div className="hidden md:flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300" />
      <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-200 relative text-sm">
        {isFullscreen ? (
          <FiMinimize2 onClick={toggleFullscreen} className="w-5 h-5 cursor-pointer hover:text-green-600" title="Exit Fullscreen" />
        ) : (
          <FiMaximize2 onClick={toggleFullscreen} className="w-5 h-5 cursor-pointer hover:text-green-600" title="Enter Fullscreen" />
        )}

        <div onClick={toggleLanguage} className="flex items-center gap-1 cursor-pointer hover:text-green-600" title="Toggle Language">
          <MdLanguage className="w-5 h-5" />
          <span>{language}</span>
        </div>

        {/* Bookmarks */}
        <div className="relative">
          <FiStar onClick={() => { setStarred(!starred); setShowBookmarks(!showBookmarks); }} className={`w-5 h-5 cursor-pointer transition ${starred ? 'text-yellow-500' : 'hover:text-green-600'}`} title="Bookmarks" />
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

        {/* Notifications */}
        <div className="relative">
          <FiBell onClick={() => setShowNotifications(s => !s)} className="w-5 h-5 cursor-pointer hover:text-green-600" title="Notifications" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
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

        {/* Dark Mode Toggle */}
        {darkMode ? (
          <FaMoon onClick={toggleDarkMode} className="w-5 h-5 cursor-pointer text-white hover:text-green-600" title="Toggle Dark Mode" />
        ) : (
          <FiMoon onClick={toggleDarkMode} className="w-5 h-5 cursor-pointer hover:text-green-600" title="Toggle Dark Mode" />
        )}

        {/* Messages */}
        <div className="relative">
          <FiMessageSquare onClick={() => setShowMessages(s => !s)} className="w-5 h-5 cursor-pointer hover:text-green-600" title="Messages" />
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

        {/* Logout */}
        <button onClick={logout} className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1.5 rounded-md border border-green-200 hover:bg-green-100 transition">
          <FiLogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </div>
  );
}
