import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isMasterOpen, setIsMasterOpen] = React.useState(false);

  const masterTables = [
    'Tile Master', 'Size Master', 'Application Master', 'Space Master',
    'Finish Master', 'Color Master', 'User Master', 'Company Master',
    'Login Master', 'Plan Master', 'Category Master', 'Profile Master',
  ];

  const filteredTables = masterTables.filter((table) =>
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableRoutes = {
    'Size Master': '/sizeMaster',
    'Application Master': '/applicationMaster',
    'Tile Master': '/tileMaster',
    'Profile Master': '/profileMaster',
    'Category Master': '/categoryMaster',
    'Space Master': '/spaceMaster',
    'Finish Master': '/finishMaster',
    'Color Master': '/colorMaster',
    'User Master': '/userMaster',
    'Company Master': '/companyMaster',
    'Login Master': '/loginMaster',
    'Plan Master': '/planMaster',
  };

  return (
    <div className="w-60 bg-white text-gray-800 h-screen fixed top-0 left-0 flex flex-col border-r border-gray-200 shadow">
      {/* Brand */}
      <div className="h-16 bg-white flex items-center justify-start px-6 border-b border-gray-200 z-10 mb-4">
        <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
        <Link to="/dashboard">Ti</Link>
      </div>
      <h1 className="ml-1 text-xl font-bold text-gray-800">Vi</h1>
    </div>


      {/* Profile card */}
      <div className="px-4 pb-4 \ border-b border-gray-200">
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
              <div className="w-16 h-16 rounded-full bg-gray-300"></div>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow">New</span>
          </div>
          <h2 className="text-base font-semibold">Emay Walter</h2>
          <p className="text-xs text-gray-500">Human Resources Department</p>

          <div className="flex justify-between w-full text-center text-xs mt-3">
            <div className="flex-1">
              <p className="font-bold">19.8k</p>
              <p className="text-gray-500">Follow</p>
            </div>
            <div className="flex-1">
              <p className="font-bold">2 yr</p>
              <p className="text-gray-500">Experience</p>
            </div>
            <div className="flex-1">
              <p className="font-bold">95.2k</p>
              <p className="text-gray-500">Follower</p>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex-1 overflow-y-auto p-4">
        <button
          onClick={() => setIsMasterOpen(!isMasterOpen)}
          className="w-full text-left px-3 py-2 rounded-md font-medium text-gray-700 bg-gray-100 hover:bg-green-50 mb-2"
        >
          Master Tables
        </button>

        {isMasterOpen && (
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 mb-2 rounded border border-gray-300 text-sm"
            />
            {filteredTables.map((table) => (
              <Link
                key={table}
                to={tableRoutes[table] || '#'}
                className="block px-3 py-2 mb-1 rounded hover:bg-green-50 text-sm text-gray-700"
              >
                {table}
              </Link>
            ))}
          </div>
        )}

        <Link to="/loginHistory" className="block px-3 py-2 mb-1 rounded hover:bg-green-50 text-sm">Login History</Link>
        <Link to="/userActivity" className="block px-3 py-2 mb-1 rounded hover:bg-green-50 text-sm">User Activity Log</Link>
        <Link to="/adminActivity" className="block px-3 py-2 mb-1 rounded hover:bg-green-50 text-sm">Admin Activity Log</Link>
      </div>
    </div>
  );
}
