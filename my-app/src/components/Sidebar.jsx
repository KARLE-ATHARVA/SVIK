// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ collapsed }) {
  return (
    <div className={`${collapsed ? 'hidden' : 'w-72'} bg-white dark:bg-gray-900 h-screen shadow flex flex-col p-4 transition-all duration-300 font-sans`}>
      
      {/* Brand */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
          <Link to="/dashboard">Ti</Link>
        </div>
        <h1 className="ml-1 text-xl font-bold text-gray-800 dark:text-gray-100">Vi</h1>
      </div>

      <hr className="border-gray-200 dark:border-gray-700 mb-4" />

      {/* Profile */}
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

      {/* Scrollable Section */}
      <div className="flex-1 overflow-y-auto">

        {/* Master Tables Direct Link */}
        <div className="mb-6">
          <Link
            to="/masterTables"
            className="block w-full px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-green-700 hover:text-white transition"
          >
            Master Tables
          </Link>
        </div>

        {/* Static Links */}
        <div className="flex flex-col gap-2">
          <Link to="/loginHistory" className="block px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 text-gray-700 dark:text-gray-200 text-sm">
            Login History
          </Link>
          <Link to="/userActivity" className="block px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 text-gray-700 dark:text-gray-200 text-sm">
            User Activity Log
          </Link>
          <Link to="/adminActivity" className="block px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 text-gray-700 dark:text-gray-200 text-sm">
            Admin Activity Log
          </Link>
        </div>

      </div>
    </div>
  );
}
