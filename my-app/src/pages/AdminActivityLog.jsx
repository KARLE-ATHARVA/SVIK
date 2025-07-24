import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function AdminActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const activityLogs = [
    { id: 1, name: 'Admin John', action: 'Created User', logDate: '2024-07-01 09:00' },
    { id: 2, name: 'Admin Jane', action: 'Deleted Product', logDate: '2024-07-02 10:30' },
    { id: 3, name: 'Admin Alice', action: 'Updated Settings', logDate: '2024-07-02 11:45' },
    { id: 4, name: 'Admin Bob', action: 'Viewed Reports', logDate: '2024-07-03 12:15' },
    { id: 5, name: 'Admin Charlie', action: 'Approved Order', logDate: '2024-07-03 14:20' },
  ];

  const filtered = activityLogs.filter((log) =>
    log.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActions = activityLogs.length;
  const uniqueUsers = [...new Set(activityLogs.map((log) => log.name))].length;

  return (
    // Added dark:text-gray-100 for consistent global text color
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600"></div>

        <Topbar />

        <div
          // Changed dark:bg-gray-800 to dark:bg-gray-900 for consistency with other pages' main content area
          className={`flex flex-col flex-1 p-6 bg-gray-50 dark:bg-gray-900 transform transition-all duration-700 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div>
              <h1
                // Changed dark:text-green-300 to dark:text-gray-100 for consistent heading color
                className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3"
              >
                Admin Activity Log
              </h1>

              <input
                type="text"
                placeholder="Search by admin name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                // Changed dark:bg-gray-700 to dark:bg-gray-800 for consistent search input background
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full md:w-[400px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex flex-row gap-4">
              <div className="relative flex items-center justify-between px-6 py-4 bg-green-700 rounded-lg text-white shadow-md overflow-hidden w-52">
                <div className="z-10">
                  <h2 className="text-sm font-medium">Total Actions</h2>
                  <p className="text-2xl font-bold">{totalActions}</p>
                </div>
                <div className="absolute right-0 -bottom-4 w-24 h-24 bg-green-600/30 rounded-full"></div>
              </div>

              <div className="relative flex items-center justify-between px-6 py-4 bg-emerald-700 rounded-lg text-white shadow-md overflow-hidden w-52">
                <div className="z-10">
                  <h2 className="text-sm font-medium">Unique Users</h2>
                  <p className="text-2xl font-bold">{uniqueUsers}</p>
                </div>
                <div className="absolute right-0 -bottom-4 w-24 h-24 bg-emerald-600/30 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Changed dark:bg-gray-700 to dark:bg-gray-900 for consistent table wrapper background */}
          <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 shadow">
            {/* Removed text-gray-900 dark:text-white from table as global dark:text-gray-100 is applied */}
            <table className="min-w-full text-sm text-left">
              <thead
                // Removed dark:bg-green-800 to use light mode green-700 for consistency
                // Changed dark:text-green-100 to text-white for consistent header text color
                className="bg-green-700 text-white text-xs uppercase sticky top-0 z-10"
              >
                <tr>
                  <th className="px-6 py-4 font-semibold">Log ID</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Log Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-6 text-center text-gray-500 dark:text-gray-300 italic"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr
                      key={log.id}
                      // Changed dark:hover:bg-green-900 to dark:hover:bg-gray-700 for consistent row hover
                      // Removed text-gray-900 dark:text-white from row as global dark:text-gray-100 is applied
                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">{log.id}</td>
                      <td className="px-6 py-4">{log.name}</td>
                      <td className="px-6 py-4">{log.action}</td>
                      <td className="px-6 py-4">{log.logDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}