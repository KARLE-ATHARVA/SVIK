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
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Topbar />

        <div className="flex-1 flex justify-center items-center px-4 py-6 overflow-hidden">
          <div className="w-full max-w-screen-xl h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col overflow-hidden">
            <h2 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
              Master Tables
            </h2>

            <input
              type="text"
              placeholder="Search master tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full mb-4 px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Scrollable List - Only vertical scroll */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-green-500 dark:scrollbar-thumb-green-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-700 rounded-md">
              <ul className="space-y-4">
                {filteredTables.map((table, index) => (
                  <li
                    key={index}
                    className="bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-md transform transition duration-200 hover:scale-[1.02] overflow-hidden"
                  >
                    <Link
                      to={table.path}
                      className="block px-6 py-4 text-lg font-semibold text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition duration-150 truncate"
                    >
                      {table.name}
                    </Link>
                  </li>
                ))}
                {filteredTables.length === 0 && (
                  <li className="text-gray-500 dark:text-gray-400 text-center mt-4">
                    No matching tables found.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
