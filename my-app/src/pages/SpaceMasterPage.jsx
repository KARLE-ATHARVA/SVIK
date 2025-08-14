import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSortUp, FaSortDown } from 'react-icons/fa';
import axios from 'axios';
import Breadcrumb from '../components/Breadcrumb';

const baseURL = process.env.REACT_APP_API_BASE_URL;

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-green-700 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 dark:hover:bg-green-700"
            onClick={onConfirm}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpaceMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [spaces, setSpaces] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({
    show: false,
    message: '',
    onConfirm: () => { },
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ space_name: '', created_by: '' });
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  const userId = localStorage.getItem('userid');

  const fetchSpaces = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetSpaceList`);
      setSpaces(res.data);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const filtered = spaces.filter((sz) =>
    (sz.space_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    ((sz.block ? 'yes' : 'no').toLowerCase()).includes(searchTerm.toLowerCase())
  );

  const sorted = React.useMemo(() => {
    let sortableItems = [...filtered];
    if (sortConfig.key !== '') {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === 'ascending' ? 1 : -1;
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

  const startEditing = (space) => {
    setEditId(space.space_id);
    setEditData({ ...space });
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
          formData.append('SpaceId', editData.space_id);
          formData.append('SpaceName', editData.space_name);
          formData.append('RequestBy', userId);
          await axios.post(`${baseURL}/EditSpace`, formData);
          fetchSpaces();
        } catch (err) {
          console.error(err);
        }
        setEditId(null);
        setEditData({});
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (spaceId) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this entry?',
      onConfirm: async () => {
        try {
          await axios.get(`${baseURL}/BlockSpace/${userId}/${spaceId}/1`);
          fetchSpaces();
        } catch (err) {
          console.error(err);
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const toggleBlock = async (space) => {
    try {
      await axios.get(`${baseURL}/BlockSpace/${userId}/${space.space_id}/${space.block ? 0 : 1}`);
      fetchSpaces();
    } catch (err) {
      console.error(err);
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({ space_name: '', created_by: userId });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ space_name: '', created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.space_name || !newData.created_by) {
      alert('Please fill all required fields');
      return;
    }
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new space?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('SpaceName', newData.space_name);
          formData.append('RequestBy', newData.created_by);
          await axios.post(`${baseURL}/AddSpace`, formData);
          fetchSpaces();
        } catch (err) {
          console.error(err);
        }
        setIsAdding(false);
        setNewData({ space_name: '', created_by: '' });
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">Space</h2>
            <Breadcrumb className="text-2xl" />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search Space Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-200"
            />
            {!isAdding && (
              <button
                onClick={startAdding}
                className="bg-green-700 dark:bg-green-600 text-white px-4 py-1 rounded hover:bg-green-800 dark:hover:bg-green-700 flex items-center"
              >
                <FaPlus className="mr-2" /> Add New Space
              </button>
            )}
          </div>

          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-gray-800 dark:text-gray-200">
              <thead className="bg-green-100 dark:bg-green-900">
                <tr>
                  <th className="px-4 py-2 font-semibold text-left">Space Name</th>
                  <th className="px-4 py-2 font-semibold text-left">Updated By</th>
                  <th className="px-4 py-2 font-semibold text-left">Updated Date</th>
                  <th className="px-4 py-2 font-semibold text-left">Block</th>
                  <th className="px-4 py-2 font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isAdding && (
                  <tr className="hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                    <td className="px-4 py-2">
                      <input
                        className="border dark:border-gray-600 px-2 py-1 rounded w-full dark:bg-gray-700 dark:text-gray-200"
                        value={newData.space_name}
                        onChange={(e) =>
                          setNewData({ ...newData, space_name: e.target.value })
                        }
                      />
                    </td>
                    <td className="px-4 py-2">{userId}</td>
                    <td className="px-4 py-2">—</td>
                    <td className="px-4 py-2">
                      <span className="px-3 py-1 rounded-full text-white text-xs bg-green-600">No</span>
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={saveAdding}
                        className="text-green-600 hover:text-green-800 dark:hover:text-green-500"
                      >
                        <FaSave size={22} />
                      </button>
                      <button
                        onClick={cancelAdding}
                        className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"
                      >
                        <FaTimes size={22} />
                      </button>
                    </td>
                  </tr>
                )}
                {currentApps.map((space) => (
                  <tr key={space.space_id} className="border-t dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                    <td className="px-4 py-2">
                      {editId === space.space_id ? (
                        <input
                          className="border dark:border-gray-600 px-2 py-1 rounded w-full dark:bg-gray-700 dark:text-gray-200"
                          value={editData.space_name}
                          onChange={(e) =>
                            handleEditChange('space_name', e.target.value)
                          }
                        />
                      ) : (
                        space.space_name
                      )}
                    </td>
                    <td className="px-4 py-2">{space.updated_by || '-'}</td>
                    <td className="px-4 py-2">
                      {space.updated_date
                        ? new Date(space.updated_date).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        onClick={() => toggleBlock(space)}
                        className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${
                          space.block ? 'bg-red-600' : 'bg-green-600'
                        }`}
                      >
                        {space.block ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2 flex">
                      {editId === space.space_id ? (
                        <>
                          <button
                            onClick={confirmSave}
                            className="text-green-600 hover:text-green-800 dark:hover:text-green-500"
                          >
                            <FaSave size={18} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"
                          >
                            <FaTimes size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(space)}
                            className="text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-300"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(space.space_id)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <FaTrash size={18} />
                          </button>
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
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of{' '}
              {filtered.length} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages).keys()].map((num) => (
                <button
                  key={num + 1}
                  onClick={() => setCurrentPage(num + 1)}
                  className={`px-3 py-1 border dark:border-gray-700 rounded ${
                    currentPage === num + 1 ? 'bg-green-600 text-white' : 'dark:text-gray-200'
                  }`}
                >
                  {num + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50"
              >
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