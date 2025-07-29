// Dashboard.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MainContent from '../pages/LandingPage';

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className={darkMode ? "dark flex h-screen overflow-hidden" : "flex h-screen overflow-hidden"}>
      <div className="flex h-screen w-full bg-gray-100 text-black dark:bg-gray-900 dark:text-white overflow-hidden">
        <Sidebar darkMode={darkMode} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <MainContent darkMode={darkMode} />

      </div>
    </div>
    </div>
  );
}
