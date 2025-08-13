import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL;

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
            onClick={onConfirm}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

const userId = localStorage.getItem('userid');

export default function SizeMasterPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sizes, setSizes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: () => {} });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ size_name: '', created_by: '' });
  const [entriesPerPage] = useState(10); // fixed 10 entries per page
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  const fetchSizes = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetSizeList`);
      setSizes(res.data);
    } catch (err) {
      console.error('Error fetching sizes', err);
    }
  };

  useEffect(() => {
    setFadeIn(true);
    fetchSizes();
  }, []);

  const filtered = sizes.filter(
    (sz) =>
      sz.size_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sz.block ? 'yes' : 'no').includes(searchTerm.toLowerCase())
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

  const totalPages = Math.ceil(sorted.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentApps = sorted.slice(indexOfFirst, indexOfLast);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const startEditing = (sz) => {
    setEditId(sz.size_id);
    setEditData({ ...sz });
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
          formData.append('SizeId', editData.size_id);
          formData.append('SizeName', editData.size_name);
          formData.append('RequestBy', userId);

          const res = await axios.post(`${baseURL}/EditSize`, formData);
          if (res.data === 'success') {
            fetchSizes();
            cancelEditing();
          } else {
            alert(res.data);
          }
        } catch (err) {
          console.error('Edit failed', err);
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (id) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this entry?',
      onConfirm: async () => {
        try {
          const res = await axios.get(`${baseURL}/BlockSize/${userId}/${id}/1`);
          if (res.data === 'success') fetchSizes();
        } catch (err) {
          console.error('Delete failed', err);
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const toggleBlock = async (sz) => {
    try {
      const res = await axios.get(`${baseURL}/BlockSize/${userId}/${sz.size_id}/${sz.block ? 0 : 1}`);
      if (res.data === 'success') fetchSizes();
    } catch (err) {
      console.error('Block toggle failed', err);
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({ size_name: '', created_by: userId });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ size_name: '', created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.size_name || !newData.created_by) {
      alert('Please fill all required fields');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new size?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('SizeName', newData.size_name);
          formData.append('RequestBy', newData.created_by);

          const res = await axios.post(`${baseURL}/AddSize`, formData);
          if (res.data === 'success') {
            fetchSizes();
            cancelAdding();
          } else {
            alert(res.data);
          }
        } catch (err) {
          console.error('Add failed', err);
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar theme="light" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar theme="light" />

        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800">Size</h2>
            <Breadcrumb />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search Size Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {!isAdding && (
              <button
                className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 flex items-center"
                onClick={startAdding}
              >
                <FaPlus className="mr-2" /> Add New Size
              </button>
            )}
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-100 text-grey-800 sticky top-0">
                <tr>
                  <th className="px-4 py-2 font-semibold text-left">Size Name</th>
                  <th className="px-4 py-2 font-semibold text-left">Updated By</th>
                  <th className="px-4 py-2 font-semibold text-left">Updated Date</th>
                  <th className="px-4 py-2 font-semibold text-left">Block</th>
                  <th className="px-4 py-2 font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAdding && (
                  <tr className="border-b hover:bg-green-50 transition duration-150">
                    <td className="px-4 py-2">
                      <input
                        value={newData.size_name}
                        onChange={(e) => setNewData({ ...newData, size_name: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2">--</td>
                    <td className="px-4 py-2">--</td>
                    <td className="px-4 py-2">--</td>
                    <td colSpan="2" className="px-4 py-2 space-x-2 flex">
                      <button onClick={saveAdding} className="text-green-600 hover:text-green-800">
                        <FaSave size={22} />
                      </button>
                      <button onClick={cancelAdding} className="text-gray-600 hover:text-gray-800">
                        <FaTimes size={22} />
                      </button>
                    </td>
                  </tr>
                )}

                {currentApps.map((sz) => (
                  <tr key={sz.size_id} className="border-b hover:bg-green-50 transition duration-150">
                    <td className="px-4 py-2">
                      {editId === sz.size_id ? (
                        <input
                          value={editData.size_name}
                          onChange={(e) => handleEditChange('size_name', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        sz.size_name
                      )}
                    </td>
                    <td className="px-4 py-2">{sz.updated_by}</td>
                    <td className="px-4 py-2">{new Date(sz.updated_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span
                        onClick={() => toggleBlock(sz)}
                        className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${
                          sz.block ? 'bg-red-600' : 'bg-green-600'
                        }`}
                      >
                        {sz.block ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2 flex">
                      {editId === sz.size_id ? (
                        <>
                          <button onClick={confirmSave} className="text-green-600 hover:text-green-800">
                            <FaSave size={18} />
                          </button>
                          <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800">
                            <FaTimes size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(sz)} className="text-yellow-500 hover:text-yellow-700">
                            <FaEdit size={18} />
                          </button>
                          <button onClick={() => confirmDelete(sz.size_id)} className="text-red-500 hover:text-red-700">
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

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4 text-sm items-center">
            <span>
              Showing {sorted.length === 0 ? 0 : indexOfFirst + 1} to {Math.min(indexOfLast, sorted.length)} of {sorted.length} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages).keys()].map((num) => (
                <button
                  key={num + 1}
                  onClick={() => setCurrentPage(num + 1)}
                  className={`px-3 py-1 border rounded ${currentPage === num + 1 ? 'bg-green-600 text-white' : ''}`}
                >
                  {num + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
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
