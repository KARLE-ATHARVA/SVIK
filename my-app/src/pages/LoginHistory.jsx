import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function LoginHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const loginHistory = [
    { id: 1, name: 'John Doe', loginDate: '2024-07-01 09:00', logoutDate: '2024-07-01 17:00' },
    { id: 2, name: 'Jane Smith', loginDate: '2024-07-02 08:45', logoutDate: '' },
    { id: 3, name: 'Alice Johnson', loginDate: '2024-07-02 09:15', logoutDate: '2024-07-02 18:00' },
    { id: 4, name: 'Bob Williams', loginDate: '2024-07-03 08:55', logoutDate: '' },
    { id: 5, name: 'Bob Williams', loginDate: '2024-07-03 08:55', logoutDate: '' },

  ];

  const filtered = loginHistory.filter((log) =>
    log.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentLogins = loginHistory.filter((log) => !log.logoutDate).length;
  const totalLogouts = loginHistory.filter((log) => log.logoutDate).length;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600"></div>

        <Topbar />

        <div
          className={`flex flex-col flex-1 p-6 bg-gray-50 transform transition-all duration-700 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-green-800 mb-3">
                Login History
              </h1>

              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[400px] focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex flex-row gap-4">
              <div className="relative flex items-center justify-between px-6 py-4 bg-green-700 rounded-lg text-white shadow-md overflow-hidden w-52">
                <div className="z-10">
                  <h2 className="text-sm font-medium">Current Logins</h2>
                  <p className="text-2xl font-bold">{currentLogins}</p>
                </div>
                <div className="absolute right-0 -bottom-4 w-24 h-24 bg-green-600/30 rounded-full"></div>
              </div>

              <div className="relative flex items-center justify-between px-6 py-4 bg-emerald-700 rounded-lg text-white shadow-md overflow-hidden w-52">
                <div className="z-10">
                  <h2 className="text-sm font-medium">Logouts</h2>
                  <p className="text-2xl font-bold">{totalLogouts}</p>
                </div>
                <div className="absolute right-0 -bottom-4 w-24 h-24 bg-emerald-600/30 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Scrollable Table Container */}
          <div className="bg-white shadow rounded-lg overflow-hidden max-h-[500px] overflow-y-auto border border-gray-200">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-green-100 text-green-900 text-xs uppercase sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Log ID</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Login Date</th>
                  <th className="px-6 py-4 font-semibold">Logout Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-6 text-center text-gray-500 italic"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b hover:bg-green-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">{log.id}</td>
                      <td className="px-6 py-4">{log.name}</td>
                      <td className="px-6 py-4">{log.loginDate}</td>
                      <td className="px-6 py-4">
                        {log.logoutDate || (
                          <span className="italic text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block w-3 h-3 rounded-full ${
                            log.logoutDate ? 'bg-green-600' : 'bg-red-500'
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
