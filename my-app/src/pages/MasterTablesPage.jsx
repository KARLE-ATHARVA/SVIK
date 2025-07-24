import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './MasterTablesPage.css'; 

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

        
        <div className="master-container">
          <h2 className="master-heading">Master Tables</h2>

          <input
            type="text"
            placeholder="Search master tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <ul className="master-list">
            {filteredTables.map((table, index) => (
              <li key={index}>
                <Link to={table.path}>{table.name}</Link>
              </li>
            ))}
            {filteredTables.length === 0 && <li>No matching tables found.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}