
import React from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiLogIn, FiActivity, FiUserCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSidebar } from '../context/SidebarContext'; // Updated path

export default function Sidebar({ darkMode }) {
  const { sidebarCollapsed, toggleSidebar } = useSidebar();
  console.log('Sidebar collapsed state:', sidebarCollapsed); // Debug line

  return (
    <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-gray-900 h-screen shadow flex flex-col p-4 transition-all duration-300 font-sans`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
            <Link to="/dashboard">Ti</Link>
          </div>
          {!sidebarCollapsed && <h1 className="ml-2 text-xl font-bold text-gray-800 dark:text-gray-100">Vi</h1>}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded hover:bg-green-100 dark:hover:bg-gray-800"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? (
            <FiChevronRight className="w-6 h-6 text-gray-800 dark:text-gray-100" />
          ) : (
            <FiChevronLeft className="w-6 h-6 text-gray-800 dark:text-gray-100" />
          )}
        </button>
      </div>

      <hr className="border-gray-200 dark:border-gray-700 mb-4" />

      {!sidebarCollapsed && (
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-2">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center shadow-inner">
              <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-500"></div>
            </div>
            <span className="absolute bottom-0 right-0 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow">New</span>
          </div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Emay Walter</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Human Resources Department</p>

          <div className="flex justify-between w-full text-center text-xs">
            <div className="flex-1">
              <p className="font-bold text-gray-800 dark:text-gray-100">19.8k</p>
              <p className="text-gray-500 dark:text-gray-400">Follow</p>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 dark:text-gray-100">2 yr</p>
              <p className="text-gray-500 dark:text-gray-400">Experience</p>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800 dark:text-gray-100">95.2k</p>
              <p className="text-gray-500 dark:text-gray-400">Follower</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2">
        <Link
          to="/masterTables"
          className="flex items-center justify-center gap-3 px-2 py-2 rounded-md text-gray-800 dark:text-gray-100 hover:bg-green-700 hover:text-white transition"
        >
          <FiGrid className={`${sidebarCollapsed ? 'text-2xl' : 'text-lg'}`} />
          {!sidebarCollapsed && <span>Master Tables</span>}
        </Link>

        <Link
          to="/loginHistory"
          className="flex items-center justify-center gap-3 px-2 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 text-gray-800 dark:text-gray-100 text-sm"
        >
          <FiLogIn className={`${sidebarCollapsed ? 'text-2xl' : 'text-lg'}`} />
          {!sidebarCollapsed && <span>Login History</span>}
        </Link>

        <Link
          to="/userActivity"
          className="flex items-center justify-center gap-3 px-2 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 text-gray-800 dark:text-gray-100 text-sm"
        >
          <FiUserCheck className={`${sidebarCollapsed ? 'text-2xl' : 'text-lg'}`} />
          {!sidebarCollapsed && <span>User Activity Log</span>}
        </Link>

        <Link
          to="/adminActivity"
          className="flex items-center justify-center gap-3 px-2 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 text-gray-800 dark:text-gray-100 text-sm"
        >
          <FiActivity className={`${sidebarCollapsed ? 'text-2xl' : 'text-lg'}`} />
          {!sidebarCollapsed && <span>Admin Activity Log</span>}
        </Link>
      </div>
    </div>
  );
}
