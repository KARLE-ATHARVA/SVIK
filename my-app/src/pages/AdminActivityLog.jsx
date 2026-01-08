import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import Breadcrumb from '../components/Breadcrumb';
import axios from 'axios';
import { toast } from 'react-toastify';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function UserActivityLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);

  /* ================= FETCH LOGS (LIMIT TO 100 LATEST) ================= */
  const fetchActivityLogs = async () => {
    try {
      const res = await axios.get(`${baseURL}/ListAdminActivityLog`, {
        withCredentials: true
      });

      const mapped = Array.isArray(res.data)
        ? res.data
            .sort((a, b) => new Date(b.log_date) - new Date(a.log_date)) // latest first
            .slice(0, 100) // 🔥 ONLY 100 RECORDS
            .map(log => ({
              id: log.log_id,
              name: `Login ID: ${log.login_id}`,
              action: log.log_details,
              logDate: new Date(log.log_date).toLocaleString()
            }))
        : [];

      setActivityLogs(mapped);
      setCurrentPage(1); // reset page safely
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch activity logs');
    }
  };

  useEffect(() => {
    setFadeIn(true);
    fetchActivityLogs();
  }, []);

  /* ================= FILTER ================= */
  const filtered = activityLogs.filter(log =>
    log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.logDate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= SORT ================= */
  const sorted = useMemo(() => {
    const items = [...filtered];
    if (sortConfig.key) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filtered, sortConfig]);

  /* ================= PAGINATION (CORRECT & FINAL) ================= */
  const totalPages = Math.ceil(filtered.length / entriesPerPage) || 1;
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentLogs = sorted.slice(indexOfFirst, indexOfLast);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending'
      ? <FaSortUp className="ml-1" />
      : <FaSortDown className="ml-1" />;
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <div className={`flex flex-col flex-1 p-6 overflow-hidden transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>

          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
              Admin Activity Log
            </h1>
            <Breadcrumb />
          </div>

          <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[75vh] overflow-hidden">

            {/* TOP CONTROLS */}
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-sm text-gray-800 dark:text-gray-200">
                <span>Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-200"
                >
                  {[10, 25, 50, 100].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                <span>entries</span>
              </div>

              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 dark:border-gray-600 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto overflow-y-auto flex-1 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
                <thead className="bg-green-100 dark:bg-green-900 sticky top-0 z-10">
                  <tr>
                    {[
                      { key: 'id', label: 'ID' },
                      { key: 'name', label: 'Source' },
                      { key: 'action', label: 'Action' },
                      { key: 'logDate', label: 'Log Date' }
                    ].map(h => (
                      <th
                        key={h.key}
                        onClick={() => handleSort(h.key)}
                        className="px-4 py-2 text-left font-semibold cursor-pointer"
                      >
                        <div className="flex items-center">
                          {h.label}
                          {getSortIcon(h.key)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {currentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center italic text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    currentLogs.map(log => (
                      <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-2">{log.id}</td>
                        <td className="px-4 py-2">{log.name}</td>
                        <td className="px-4 py-2">{log.action}</td>
                        <td className="px-4 py-2">{log.logDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION (EXACT LIKE USERMASTER) */}
            <div className="flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
              <span>
                Showing {filtered.length === 0 ? 0 : indexOfFirst + 1} to{' '}
                {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
              </span>

              <div className="flex gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
                >
                  Previous
                </button>

                {[...Array(totalPages).keys()].map((num) => (
                  <button
                    key={num + 1}
                    onClick={() => setCurrentPage(num + 1)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === num + 1
                        ? 'bg-green-600 text-white dark:bg-green-500'
                        : 'dark:border-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {num + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
