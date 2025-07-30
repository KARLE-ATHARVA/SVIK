import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import Breadcrumb from '../components/Breadcrumb';

export default function UserActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });

  const activityLogs = [
    { id: 1, name: 'Admin John', action: 'Created User', logDate: '2024-07-01 09:00' },
    { id: 2, name: 'Admin Jane', action: 'Deleted Product', logDate: '2024-07-02 10:30' },
    { id: 3, name: 'Admin Alice', action: 'Updated Settings', logDate: '2024-07-02 11:45' },
    { id: 4, name: 'Admin Bob', action: 'Viewed Reports', logDate: '2024-07-03 12:15' },
    { id: 5, name: 'Admin Charlie', action: 'Approved Order', logDate: '2024-07-03 14:20' },
    { id: 6, name: 'Admin John', action: 'Created User', logDate: '2024-07-01 09:00' },
    { id: 7, name: 'Admin Jane', action: 'Deleted Product', logDate: '2024-07-02 10:30' },
    { id: 8, name: 'Admin Alice', action: 'Updated Settings', logDate: '2024-07-02 11:45' },
    { id: 9, name: 'Admin Bob', action: 'Viewed Reports', logDate: '2024-07-03 12:15' },
    { id: 10, name: 'Admin Charlie', action: 'Approved Order', logDate: '2024-07-03 14:20' },
    { id: 11, name: 'Admin John', action: 'Created User', logDate: '2024-07-01 09:00' },
    { id: 12, name: 'Admin Jane', action: 'Deleted Product', logDate: '2024-07-02 10:30' },
    { id: 13, name: 'Admin Alice', action: 'Updated Settings', logDate: '2024-07-02 11:45' },
    { id: 14, name: 'Admin Bob', action: 'Viewed Reports', logDate: '2024-07-03 12:15' },
    { id: 15, name: 'Admin Charlie', action: 'Approved Order', logDate: '2024-07-03 14:20' },
  ];

  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Source' },
    { key: 'action', label: 'Action' },
    { key: 'logDate', label: 'Log Date' },
  ];

  const filtered = activityLogs.filter(
    (log) =>
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.logDate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = useMemo(() => {
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
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <div className="flex flex-col flex-1 overflow-y-auto p-6">
          <div className="flex justify-between mb-4 items-center">
            <h1 className="text-2xl font-bold text-green-800 dark:text-gray-100">Admin Activity Log</h1>
            <Breadcrumb />
          </div>

          <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-4">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded px-2 py-1"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[10, 25, 50, 100].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <span>entries</span>
            </div>

            <input
              type="text"
              placeholder="Search Name, Action, Date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded w-full max-w-xs"
            />
          </div>

          <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-green-700 text-white text-xs uppercase sticky top-0 z-10">
                <tr>
                  {headers.map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-4 py-3 font-semibold cursor-pointer"
                      onClick={() => handleSort(key)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {sortConfig.key === key &&
                          (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 italic">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-4 py-3">{log.id}</td>
                      <td className="px-4 py-3">{log.name}</td>
                      <td className="px-4 py-3">{log.action}</td>
                      <td className="px-4 py-3">{log.logDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4 text-sm items-center">
            <span>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages).keys()].map((num) => (
                <button
                  key={num + 1}
                  onClick={() => setCurrentPage(num + 1)}
                  className={`px-3 py-1 border border-gray-300 dark:border-gray-600 rounded ${
                    currentPage === num + 1 ? 'bg-green-600 text-white' : ''
                  }`}
                >
                  {num + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
