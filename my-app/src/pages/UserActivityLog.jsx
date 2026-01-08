import React, { useState, useEffect, useMemo } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);
  const [userLogs, setUserLogs] = useState([]);

  /* ================= FETCH USER ACTIVITY (LATEST 100) ================= */
  const fetchUserLogs = async () => {
    try {
      const res = await axios.get(`${baseURL}/UserActivityLog/List`, {
        withCredentials: true
      });

      const mapped = Array.isArray(res.data)
        ? res.data
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
            .slice(0, 100)
            .map(log => ({
              id: log.hit_id,
              xsource: log.source,
              ip: log.ip_address,
              url: log.url,
              tileId: log.tile_id,
              created: new Date(log.created_date).toLocaleString(),
              block: Boolean(log.block)
            }))
        : [];

      setUserLogs(mapped);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch user activity logs');
    }
  };

  useEffect(() => {
    setFadeIn(true);
    fetchUserLogs();
  }, []);

  /* ================= BLOCK / UNBLOCK ================= */
  const toggleBlock = async (id, currentStatus) => {
    try {
      await axios.get(
        `${baseURL}/UserActivityLog/BlockUserActivity/${id}/${currentStatus ? 0 : 1}`,
        { withCredentials: true }
      );

      setUserLogs(prev =>
        prev.map(log =>
          log.id === id ? { ...log, block: !currentStatus } : log
        )
      );

      toast.success('Status updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  /* ================= FILTER ================= */
  const filtered = userLogs.filter(log =>
    log.xsource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.url.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filtered.length / entriesPerPage) || 1;
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentLogs = sorted.slice(indexOfFirst, indexOfLast);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className={`flex flex-col flex-1 overflow-y-auto p-6 transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between mb-4 items-center">
            <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">
              User Activity Log
            </h1>
            <Breadcrumb />
          </div>

          <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <span>Show</span>
              <select
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[10, 25, 50, 100].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <span>entries</span>
            </div>

            <input
              type="text"
              placeholder="Search Source, IP, URL..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded w-full max-w-xs dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
            <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
              <thead className="bg-green-100 dark:bg-green-900 sticky top-0 z-10">
                <tr>
                  {[
                    { key: 'id', label: 'ID' },
                    { key: 'xsource', label: 'Source' },
                    { key: 'ip', label: 'IP Address' },
                    { key: 'url', label: 'URL' },
                    { key: 'tileId', label: 'Tile ID' },
                    { key: 'created', label: 'Created At' }
                  ].map(h => (
                    <th
                      key={h.key}
                      onClick={() => handleSort(h.key)}
                      className="px-4 py-2 font-semibold cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-1">
                        {h.label}
                        {sortConfig.key === h.key && (
                          sortConfig.direction === 'ascending'
                            ? <FaSortUp />
                            : <FaSortDown />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-2 font-semibold text-left">Block</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentLogs.map(log => (
                  <tr key={log.id} className="hover:bg-green-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2">{log.id}</td>
                    <td className="px-4 py-2">{log.xsource}</td>
                    <td className="px-4 py-2">{log.ip}</td>
                    <td className="px-4 py-2">{log.url}</td>
                    <td className="px-4 py-2">{log.tileId}</td>
                    <td className="px-4 py-2">{log.created}</td>
                    <td className="px-4 py-2">
                      <span
                        onClick={() => toggleBlock(log.id, log.block)}
                        className="inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span className={`w-3 h-3 rounded-full ${log.block ? 'bg-green-600' : 'bg-red-500'}`}></span>
                        {log.block ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
            <span>
              Showing {filtered.length === 0 ? 0 : indexOfFirst + 1} to{' '}
              {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
            </span>

            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>

              {[...Array(totalPages).keys()].map(num => (
                <button
                  key={num + 1}
                  onClick={() => setCurrentPage(num + 1)}
                  className={`px-3 py-1 border dark:border-gray-700 rounded ${
                    currentPage === num + 1 ? 'bg-green-600 text-white' : ''
                  }`}
                >
                  {num + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50"
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
