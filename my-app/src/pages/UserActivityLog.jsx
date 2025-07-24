import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function UserActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const userLogs = [
    { id: 1, xsource: 'Web', ip: '192.168.0.1', url: '/home', tileId: 101, created: '2024-07-01 10:00', block: 0 },
    { id: 2, xsource: 'API', ip: '192.168.0.2', url: '/api/data', tileId: 102, created: '2024-07-01 11:30', block: 1 },
    { id: 3, xsource: 'Web', ip: '192.168.0.3', url: '/about', tileId: 103, created: '2024-07-02 09:15', block: 1 },
    { id: 4, xsource: 'Mobile', ip: '192.168.0.4', url: '/login', tileId: 104, created: '2024-07-02 14:00', block: 0 },
    { id: 5, xsource: 'Web', ip: '192.168.0.5', url: '/contact', tileId: 105, created: '2024-07-03 12:45', block: 1 },
    { id: 6, xsource: 'API', ip: '192.168.0.6', url: '/api/user', tileId: 106, created: '2024-07-03 15:30', block: 0 },
  ];

  const filtered = userLogs.filter(
    (log) =>
      log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalHits = userLogs.length;
  const blockedHits = userLogs.filter((log) => log.block === 0).length;

  return (
    // Changed dark:text-white to dark:text-gray-100 for global text color consistency
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600"></div>

        <Topbar />

        <div
          // Changed dark:bg-gray-800 to dark:bg-gray-900 for consistent main content area background
          className={`flex flex-col flex-1 p-6 transform transition-all duration-700 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } bg-gray-50 dark:bg-gray-900`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div>
              <h1
                // Changed dark:text-green-400 to dark:text-gray-100 for consistent heading color
                className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3"
              >
                User Activity Log
              </h1>

              <input
                type="text"
                placeholder="Search by IP or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                // Changed dark:bg-gray-700 to dark:bg-gray-800 for consistent search input background
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-md w-full md:w-[400px] focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex flex-row gap-4">
              <div className="relative flex items-center justify-between px-6 py-4 bg-green-700 rounded-lg text-white shadow-md overflow-hidden w-52">
                <div className="z-10">
                  <h2 className="text-sm font-medium">Total Hits</h2>
                  <p className="text-2xl font-bold">{totalHits}</p>
                </div>
                <div className="absolute right-0 -bottom-4 w-24 h-24 bg-green-600/30 rounded-full"></div>
              </div>

              <div className="relative flex items-center justify-between px-6 py-4 bg-emerald-700 rounded-lg text-white shadow-md overflow-hidden w-52">
                <div className="z-10">
                  <h2 className="text-sm font-medium">Blocked Hits</h2>
                  <p className="text-2xl font-bold">{blockedHits}</p>
                </div>
                <div className="absolute right-0 -bottom-4 w-24 h-24 bg-emerald-600/30 rounded-full"></div>
              </div>
            </div>
          </div>

          <div
            // Changed dark:border-gray-700 to dark:border-gray-600 for consistent table border color
            className="flex-1 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 shadow"
          >
            {/* Removed text-gray-800 as global dark:text-gray-100 is applied, kept dark:text-gray-100 */}
            <table className="min-w-full text-sm text-left text-black dark:text-gray-100">
              <thead
                // Removed dark:bg-green-900 to use light mode green-700 for consistency
                // Changed dark:text-green-300 to text-white for consistent header text color
                className="bg-green-700 text-white text-xs uppercase sticky top-0 z-10"
              >
                <tr>
                  <th className="px-6 py-4 font-semibold">Hit ID</th>
                  <th className="px-6 py-4 font-semibold">Source</th>
                  <th className="px-6 py-4 font-semibold">IP Address</th>
                  <th className="px-6 py-4 font-semibold">URL</th>
                  <th className="px-6 py-4 font-semibold">Tile ID</th>
                  <th className="px-6 py-4 font-semibold">Created Date</th>
                  <th className="px-6 py-4 font-semibold">Block</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-6 text-center text-gray-500 dark:text-gray-400 italic"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr
                      key={log.id}
                      // Changed dark:border-gray-700 to dark:border-gray-600 for consistent row border color
                      // Changed dark:hover:bg-green-900 to dark:hover:bg-gray-700 for consistent row hover background
                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">{log.id}</td>
                      <td className="px-6 py-4">{log.xsource}</td>
                      <td className="px-6 py-4">{log.ip}</td>
                      <td className="px-6 py-4">{log.url}</td>
                      <td className="px-6 py-4">{log.tileId}</td>
                      <td className="px-6 py-4">{log.created}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            log.block === 0 ? 'bg-red-500' : 'bg-green-600'
                          }`}
                        ></span>
                      </td>
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