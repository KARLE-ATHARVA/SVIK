import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function LoginMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logins] = useState([
    {
      login_id: 1,
      comp_id: 101,
      user_id: 201,
      login_name: 'admin',
      login_password: 'password123',
      block: false,
    },
  ]);

  const filteredLogins = logins.filter((login) =>
    login.login_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Added dark:text-gray-100 to align with ApplicationMasterPage and SizeMasterPage
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Login Master Table</h2>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by Login Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Changed dark:bg-gray-800 to dark:bg-gray-900 and dark:border-gray-700 to dark:border-gray-600 */}
          <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-600">
            {/* Changed dark:divide-gray-700 to dark:divide-gray-600 and text-gray-900 dark:text-white to text-black dark:text-gray-100 */}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600 text-sm text-black dark:text-gray-100">
              {/* Removed dark:bg-green-800 to keep consistent with SizeMasterPage and ApplicationMasterPage */}
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">Login ID</th>
                  <th className="px-4 py-3">Comp ID</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Login Name</th>
                  <th className="px-4 py-3">Password</th>
                  <th className="px-4 py-3">Block</th>
                </tr>
              </thead>
              {/* Changed dark:bg-gray-800 to dark:bg-gray-900 and dark:divide-gray-700 to dark:divide-gray-600 */}
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-600">
                {filteredLogins.map((login) => (
                  <tr key={login.login_id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3">{login.login_id}</td>
                    <td className="px-4 py-3">{login.comp_id}</td>
                    <td className="px-4 py-3">{login.user_id}</td>
                    <td className="px-4 py-3">{login.login_name}</td>
                    <td className="px-4 py-3">{login.login_password}</td>
                    <td className="px-4 py-3">{login.block ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}