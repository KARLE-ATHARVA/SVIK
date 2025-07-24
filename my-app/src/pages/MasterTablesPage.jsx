import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function MasterTablesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const masterTables = [
    { name: "Tile Master", path: "/tileMaster" },
    { name: "Space Master", path: "/spaceMaster" },
    { name: "Color Master", path: "/colorMaster" },
    { name: "Category Master", path: "/categoryMaster" },
    { name: "Size Master", path: "/sizeMaster" },
    { name: "Profile Master", path: "/profileMaster" },
    { name: "Application Master", path: "/applicationMaster" },
    { name: "Finish Master", path: "/finishMaster" },
    { name: "User Master", path: "/userMaster" },
    { name: "Company Master", path: "/companyMaster" },
    { name: "Login Master", path: "/loginMaster" },
    { name: "Plan Master", path: "/planMaster" }
  ];

  const filteredTables = masterTables.filter((table) =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <div className="max-w-screen-xl w-full mx-auto my-10 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md font-sans">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-2 mb-6">
            Master Tables
          </h2>

          <input
            type="text"
            placeholder="Search master tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-6 px-4 py-2 text-base border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <ul className="space-y-4">
            {filteredTables.map((table, index) => (
              <li
                key={index}
                className="bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-slate-600 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 transition"
              >
                <Link
                  to={table.path}
                  className="block px-5 py-3 text-lg font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition"
                >
                  {table.name}
                </Link>
              </li>
            ))}
            {filteredTables.length === 0 && (
              <li className="text-gray-500 dark:text-gray-400">No matching tables found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
