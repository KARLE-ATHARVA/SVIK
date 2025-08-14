import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSortUp, FaSortDown, FaSun, FaMoon } from 'react-icons/fa';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext'; // Import your custom hook

const baseURL = process.env.REACT_APP_API_BASE_URL;

// Confirmation modal component
function ConfirmationModal({ message, onConfirm, onCancel }) {
  const { darkMode } = useTheme();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-end space-x-2">
          <button className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600" onClick={onCancel}>
            Cancel
          </button>
          <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

// Main component
export default function ApplicationMasterPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userid');
  const { darkMode, toggleDarkMode } = useTheme();

  const [searchTerm, setSearchTerm] = useState('');
  const [apps, setApps] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: () => {} });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ app_name: '', created_by: '' });
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  const headers = [
    { key: 'app_name', label: 'Application Name' },
    { key: 'updated_by', label: 'Updated By' },
    { key: 'updated_date', label: 'Updated Date' },
    { key: 'block', label: 'Block' },
  ];

  useEffect(() => {
    setFadeIn(true);
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetApplicationList`);
      setApps(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const filtered = apps.filter(
    (app) =>
      app.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.block ? 'yes' : 'no').includes(searchTerm.toLowerCase()) ||
      (app.updated_by && app.updated_by.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentApps = sorted.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
    }
    return null;
  };

  const startEditing = (app) => {
    setEditId(app.app_id);
    setEditData({ ...app });
  };

  const cancelEditing = () => {
    setEditId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const confirmSave = () => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save changes?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('AppId', editData.app_id);
          formData.append('AppName', editData.app_name);
          formData.append('RequestBy', userId);

          const res = await axios.post(`${baseURL}/EditApplication`, formData);

          if (res.data === 'success') {
            fetchApps();
            cancelEditing();
          } else {
            alert(res.data === 'alreadyexists' ? 'Application already exists!' : `Error: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
          alert('Error saving application');
        }

        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (appId) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this application?',
      onConfirm: async () => {
        try {
          await axios.get(`${baseURL}/BlockApplication/${userId}/${appId}/1`);
          fetchApps();
        } catch (err) {
          console.error(err);
          alert('Error deleting application');
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const toggleBlock = async (app) => {
    try {
      await axios.get(`${baseURL}/BlockApplication/${userId}/${app.app_id}/${app.block ? 0 : 1}`);
      fetchApps();
    } catch (err) {
      console.error(err);
      alert('Error toggling block status');
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({ app_name: '', created_by: userId });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ app_name: '', created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.app_name) {
      alert('Please enter application name');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to add this application?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('AppName', newData.app_name);
          formData.append('RequestBy', newData.created_by);

          const res = await axios.post(`${baseURL}/AddApplication`, formData);

          if (res.data === 'success') {
            fetchApps();
            cancelAdding();
          } else {
            alert(res.data === 'alreadyexists' ? 'Application already exists!' : `Error: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
          alert('Error adding application');
        }

        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <div className={`flex flex-col flex-1 overflow-y-auto p-6 transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-500">Applications</h2>
            <Breadcrumb />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-gray-200"
            />
            <div className="flex space-x-2">
                {!isAdding && (
                <button
                    className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 flex items-center"
                    onClick={startAdding}
                >
                    <FaPlus className="mr-2" /> Add New Application
                </button>
                )}
                
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
            <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
              <thead className="bg-green-100 dark:bg-green-900 sticky top-0 z-10">
                <tr>
                    {headers.map(header => (
                        <th 
                            key={header.key}
                            className="px-4 py-2 font-semibold text-left cursor-pointer"
                            onClick={() => handleSort(header.key)}
                        >
                            <div className="flex items-center">
                                {header.label}
                                {getSortIcon(header.key)}
                            </div>
                        </th>
                    ))}
                    <th className="px-4 py-2 font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <tr className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                    <td className="px-4 py-2">
                      <input
                        value={newData.app_name}
                        onChange={(e) => setNewData({ ...newData, app_name: e.target.value })}
                        className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-2">--</td>
                    <td className="px-4 py-2">--</td>
                    <td className="px-4 py-2">--</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={saveAdding} className="text-green-600 hover:text-green-800 dark:hover:text-green-500"><FaSave size={22} /></button>
                      <button onClick={cancelAdding} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"><FaTimes size={22} /></button>
                    </td>
                  </tr>
                )}

                {currentApps.map((app) => (
                  <tr key={app.app_id} className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                    <td className="px-4 py-2">
                      {editId === app.app_id ? (
                        <input
                          value={editData.app_name}
                          onChange={(e) => handleEditChange('app_name', e.target.value)}
                          className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                        />
                      ) : (
                        app.app_name
                      )}
                    </td>
                    <td className="px-4 py-2">{app.updated_by}</td>
                    <td className="px-4 py-2">{new Date(app.updated_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span
                        onClick={() => toggleBlock(app)}
                        className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${
                          app.block ? 'bg-red-600' : 'bg-green-600'
                        }`}
                      >
                        {app.block ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      {editId === app.app_id ? (
                        <>
                          <button onClick={confirmSave} className="text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400"><FaSave size={22} /></button>
                          <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"><FaTimes size={22} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(app)} className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"><FaEdit size={18} /></button>
                          <button onClick={() => confirmDelete(app.app_id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><FaTrash size={18} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
            <span>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:disabled:text-gray-500">
                Previous
              </button>
              {[...Array(totalPages).keys()].map(num => (
                <button key={num + 1} onClick={() => setCurrentPage(num + 1)} className={`px-3 py-1 border rounded ${currentPage === num + 1 ? 'bg-green-600 text-white dark:bg-green-500' : 'dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'}`}>
                  {num + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:disabled:text-gray-500">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmation.show && (
        <ConfirmationModal
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={() => setConfirmation({ ...confirmation, show: false })}
        />
      )}
    </div>
  );
}