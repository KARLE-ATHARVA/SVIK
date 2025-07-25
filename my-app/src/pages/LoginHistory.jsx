import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import { FaSortUp, FaSortDown } from 'react-icons/fa';

export default function LoginHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
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
    { id: 6, name: 'Jane Smith', loginDate: '2024-07-02 08:45', logoutDate: '' },
    { id: 7, name: 'Alice Johnson', loginDate: '2024-07-02 09:15', logoutDate: '2024-07-02 18:00' },
    { id: 8, name: 'Bob Williams', loginDate: '2024-07-03 08:55', logoutDate: '' },
    { id: 9, name: 'Bob Williams', loginDate: '2024-07-03 08:55', logoutDate: '' },
    { id: 10, name: 'John Doe', loginDate: '2024-07-01 09:00', logoutDate: '2024-07-01 17:00' },
    { id: 11, name: 'Jane Smith', loginDate: '2024-07-02 08:45', logoutDate: '' },
    { id: 12, name: 'Alice Johnson', loginDate: '2024-07-02 09:15', logoutDate: '2024-07-02 18:00' },
    { id: 13, name: 'Bob Williams', loginDate: '2024-07-03 08:55', logoutDate: '' },
    { id: 14, name: 'Bob Williams', loginDate: '2024-07-03 08:55', logoutDate: '' },
  ];

  const filtered = loginHistory.filter(
    (log) =>
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.loginDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.logoutDate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = React.useMemo(() => {
    let sortableItems = [...filtered];
    if (sortConfig.key !== '') {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filtered, sortConfig]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentLogs = sorted.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-70">
        <Topbar />
        <div className={`flex flex-col flex-1 overflow-y-auto p-6 transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between mb-4 items-center">
            <h1 className="text-2xl font-bold text-green-800">Login History</h1>
            <Breadcrumb />
          </div>

          <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-4">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                className="border border-gray-300 rounded px-2 py-1"
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                {[10, 25, 50, 100].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <span>entries</span>
            </div>
            <input
              type="text"
              placeholder="Search Name, Logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded w-full max-w-xs"
            />
          </div>

          <div className="overflow-x-auto bg-white shadow rounded">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-green-100 text-green-900 text-xs uppercase sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('id')}>
                    ID {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                  </th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('name')}>
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                  </th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('loginDate')}>
                    Login Date {sortConfig.key === 'loginDate' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                  </th>
                  <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('logoutDate')}>
                    Logout Date {sortConfig.key === 'logoutDate' && (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                  </th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-green-50 transition duration-150">
                    <td className="px-4 py-2">{log.id}</td>
                    <td className="px-4 py-2">{log.name}</td>
                    <td className="px-4 py-2">{log.loginDate}</td>
                    <td className="px-4 py-2">{log.logoutDate || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`w-3 h-3 inline-block rounded-full ${log.logoutDate ? 'bg-green-600' : 'bg-red-500'}`}></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4 text-sm items-center">
            <span>
              Showing {filtered.length === 0 ? 0 : indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">
                Previous
              </button>
              {[...Array(totalPages).keys()].map(num => (
                <button key={num + 1} onClick={() => setCurrentPage(num + 1)} className={`px-3 py-1 border rounded ${currentPage === num + 1 ? 'bg-green-600 text-white' : ''}`}>
                  {num + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">
                Next
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
