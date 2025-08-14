import React from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen } from 'react-icons/fa';
import { FiGrid, FiActivity, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSidebar } from '../context/SidebarContext';
import BrandLogo from '../assets/brand_logo.PNG';

export default function Sidebar({ darkMode }) {
  const { sidebarCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className="relative overflow-visible z-50">
      {/* Sidebar container */}
      <div
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-60'
        } h-screen bg-white dark:bg-gray-900 shadow-2xl border-r border-gray-200 dark:border-gray-700 
        rounded-br-3xl flex flex-col justify-between p-3 transition-all duration-300 ease-in-out`}
        style={{ borderTopLeftRadius: '0px' }}
      >
        {/* Header: Logo + Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img
              src={BrandLogo}
              alt="Brand Logo"
              className="w-10 h-10 object-contain rounded-sm"
            />
            {!sidebarCollapsed && (
              <span className="text-2xl font-semibold text-gray-800 dark:text-gray-100 tracking-wide font-sans">
                TiVi
              </span>
            )}
          </div>

          {/* User card */}
          {!sidebarCollapsed && (
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative w-20 h-20 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center shadow-inner mb-2">
                <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-500" />
                <span className="absolute bottom-0 right-0 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow">
                  New
                </span>
              </div>
              <h2 className="text-sm font-medium text-gray-800 dark:text-gray-100">Emay Walter</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Human Resources Department</p>
              <div className="flex w-full text-center text-xs divide-x divide-gray-300 dark:divide-gray-700">
                <div className="flex-1 px-2">
                  <p className="font-bold text-gray-800 dark:text-gray-100">19.8k</p>
                  <p className="text-gray-500 dark:text-gray-400">Follow</p>
                </div>
                <div className="flex-1 px-2">
                  <p className="font-bold text-gray-800 dark:text-gray-100">2 yr</p>
                  <p className="text-gray-500 dark:text-gray-400">Experience</p>
                </div>
                <div className="flex-1 px-2">
                  <p className="font-bold text-gray-800 dark:text-gray-100">95.2k</p>
                  <p className="text-gray-500 dark:text-gray-400">Follower</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2 mt-2">
            {/* Products */}
            <Link
              to="/tileMaster"
              title="Products"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-green-700 hover:text-white transition"
            >
              <FaBoxOpen className="text-xl" />
              {!sidebarCollapsed && <span className="text-sm font-medium">Products</span>}
            </Link>

            {/* Masters */}
            <Link
              to="/masterTables"
              title="Masters"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-green-700 hover:text-white transition"
            >
              <FiGrid className="text-xl" />
              {!sidebarCollapsed && <span className="text-sm font-medium">Masters</span>}
            </Link>

            {/* Logs */}
            <Link
              to="/reportsPage"
              title="Logs"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-800 dark:text-gray-100 hover:bg-green-700 hover:text-white transition"
            >
              <FiActivity className="text-xl" />
              {!sidebarCollapsed && <span className="text-sm font-medium">Logs</span>}
            </Link>
          </nav>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute top-8 -right-5 z-[999] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
          shadow-md p-1.5 rounded-full hover:bg-green-600 hover:text-white transition"
        title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {sidebarCollapsed ? (
          <FiChevronRight className="text-lg text-gray-800 dark:text-gray-100" />
        ) : (
          <FiChevronLeft className="text-lg text-gray-800 dark:text-gray-100" />
        )}
      </button>
    </div>
  );
}