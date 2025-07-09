// Sidebar.js
import React from 'react';
import { Link,useNavigate } from 'react-router-dom';

export default function Sidebar({ collapsed }) {
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
  // Add others here later if needed
};

  return (
    <div className={`${collapsed ? 'hidden' : 'w-72'} bg-white h-screen shadow flex flex-col p-4 transition-all duration-300 font-sans`}>
      {/* Brand */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
        <Link to="/dashboard">
          Ti
        </Link>
        </div>
        <h1 className="ml-1 text-xl font-bold text-gray-800">Vi</h1>
      </div>

      <hr className="border-gray-200 mb-4" />

      {/* Profile - Non-scrollable section */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-2">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
            <div className="w-16 h-16 rounded-full bg-gray-300"></div>
          </div>
          <span className="absolute bottom-0 right-0 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow">New</span>
        </div>
        <h2 className="text-base font-semibold text-gray-800">Emay Walter</h2>
        <p className="text-xs text-gray-500 mb-3">Human Resources Department</p>

        <div className="flex justify-between w-full text-center text-xs">
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

      {/* Scrollable section starts here */}
      <div className="flex-1 overflow-y-auto">
        {/* Master Tables */}
        <div className="mb-6">
          <button
            onClick={() => setIsMasterOpen(!isMasterOpen)}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition ${
              isMasterOpen ? 'bg-green-700 text-white' : 'text-gray-700 hover:bg-green-700 hover:text-white'
            }`}
          >
            <span>Master Tables</span>
            <svg
              className={`w-4 h-4 ml-auto transition-transform ${isMasterOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {isMasterOpen && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 mb-2 border rounded-md text-sm"
              />
              <div className="flex flex-col gap-1">
                {filteredTables.map((table, idx) => (
  <Link
    to={tableRoutes[table] || '#'}
    key={idx}
    className="block px-3 py-1 rounded hover:bg-green-100 text-gray-700 text-sm"
  >
    {table}
  </Link>
))}

                {filteredTables.length === 0 && (
                  <p className="text-xs text-gray-400 px-3 py-1">No tables found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Standalone Links */}
        <div className="flex flex-col gap-2">
          <Link to="/loginHistory" className="block px-3 py-2 rounded hover:bg-green-100 text-gray-700 text-sm">
          Login History
          </Link>
          <Link to="/userActivity" className="block px-3 py-2 rounded hover:bg-green-100 text-gray-700 text-sm">
            User Activity Log
          </Link>
          <Link to="/adminActivity" className="block px-3 py-2 rounded hover:bg-green-100 text-gray-700 text-sm">
            Admin Activity Log
          </Link>
        </div>
      </div>
      {/* Scrollable section ends here */}
    </div>
  );
}