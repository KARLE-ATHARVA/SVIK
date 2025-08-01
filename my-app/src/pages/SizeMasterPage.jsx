import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSortUp, FaSortDown } from 'react-icons/fa';
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

export default function SizeMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizes, setSizes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    size_name: '',
    created_by: '',
  });
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  const userId = localStorage.getItem('userid');

  const fetchSizes = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetSizeList`);
      setSizes(res.data);
    } catch (error) {
      console.error('Error fetching sizes:', error);
    }
  };

  useEffect(() => {
    setFadeIn(true);
    fetchSizes();
  }, []);

  const headers = [
    { key: 'size_id', label: 'Size ID' },
    { key: 'size_name', label: 'Size Name' },
    { key: 'block', label: 'Block' },
    { key: 'updated_by', label: 'Updated By' },
    { key: 'updated_date', label: 'Updated Date' },
  ];

  const filtered = sizes.filter(
    (size) =>
      size.size_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (size.block ? 'yes' : 'no').includes(searchTerm.toLowerCase()) ||
      (size.updated_by && size.updated_by.toLowerCase().includes(searchTerm.toLowerCase()))
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
  const currentSizes = sorted.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const startEditing = (size) => {
    setEditId(size.size_id);
    setEditData({ ...size });
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

          if (res.data === 'alreadyexists') {
            alert('Size already exists!');
            return;
          } else if (res.data === 'success') {
            fetchSizes();
          } else {
            alert(`Failed to update size: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
          alert('Error updating size');
        }

        setEditId(null);
        setEditData({});
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (sizeId) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this entry?',
      onConfirm: async () => {
        try {
          await axios.get(`${baseURL}/BlockSize/${userId}/${sizeId}/1`);
          fetchSizes();
        } catch (err) {
          console.error(err);
          alert('Error deleting size');
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const toggleBlock = async (size) => {
    try {
      await axios.get(`${baseURL}/BlockSize/${userId}/${size.size_id}/${size.block ? 0 : 1}`);
      fetchSizes();
    } catch (err) {
      console.error(err);
      alert('Error toggling block status');
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({
      size_name: '',
      created_by: userId,
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ size_name: '', created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.size_name) {
      alert('Please enter size name');
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

          if (res.data === 'alreadyexists') {
            alert('Size already exists!');
            return;
          } else if (res.data === 'success') {
            fetchSizes();
          } else {
            alert(`Failed to add size: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
          alert('Error adding size');
        }

        setIsAdding(false);
        setNewData({ size_name: '', created_by: '' });
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex flex-col flex-1 ml-70">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex flex-col flex-1 overflow-y-auto p-6 transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between mb-4 items-center">
            <h1 className="text-2xl font-bold text-green-800">Size Master</h1>
            <div className="flex space-x-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </button>
              {!isAdding && (
                <button
                  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center"
                  onClick={startAdding}
                >
                  <FaPlus className="mr-2" /> Add New Color
                </button>
              )}
            </div>
          </div>

                    <div className="mb-4">
            <input
              type="text"
              placeholder="Search by Color Name or Block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>



          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md">
            <table className="min-w-full text-sm text-gray-800">
              <thead className="bg-green-100 sticky top-0 z-10">
                <tr>
                  {headers.map(({ key, label }) => (
                    <th key={key} className="px-4 py-2 font-semibold cursor-pointer text-left" onClick={() => handleSort(key)}>
                      <div className="flex items-center gap-1">
                        {label}
                        {sortConfig.key === key && (
                          sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-2 font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <tr className="border-b hover:bg-green-50 transition duration-150">
                    <td className="px-4 py-2">New</td>
                    <td className="px-4 py-2">
                      <input
                        value={newData.size_name}
                        onChange={(e) => setNewData({ ...newData, size_name: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2">—</td>
                    <td className="px-4 py-2">{userId}</td>
                    <td className="px-4 py-2">—</td>
                    <td className="px-4 py-2 space-x-2 flex">
                      <button onClick={saveAdding} className="text-green-600 hover:text-green-800">
                        <FaSave size={18} />
                      </button>
                      <button onClick={cancelAdding} className="text-gray-600 hover:text-gray-800">
                        <FaTimes size={18} />
                      </button>
                    </td>
                  </tr>
                )}

                {currentSizes.map((size) => (
                  <tr key={size.size_id} className="border-b hover:bg-green-50 transition duration-150">
                    <td className="px-4 py-2">{size.size_id}</td>
                    <td className="px-4 py-2">
                      {editId === size.size_id ? (
                        <input
                          value={editData.size_name}
                          onChange={(e) => handleEditChange('size_name', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        size.size_name
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={size.block}
                        onChange={() => toggleBlock(size)}
                      />
                    </td>
                    <td className="px-4 py-2">{size.updated_by}</td>
                    <td className="px-4 py-2">{new Date(size.updated_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 space-x-2 flex">
                      {editId === size.size_id ? (
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
                          <button onClick={() => startEditing(size)} className="text-yellow-500 hover:text-yellow-700">
                            <FaEdit size={18} />
                          </button>
                          <button onClick={() => confirmDelete(size.size_id)} className="text-red-500 hover:text-red-700">
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

          <div className="flex justify-between mt-4 text-sm items-center">
            <span>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} 
                disabled={currentPage === 1} 
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages).keys()].map(num => (
                <button 
                  key={num + 1} 
                  onClick={() => setCurrentPage(num + 1)} 
                  className={`px-3 py-1 border rounded ${currentPage === num + 1 ? 'bg-green-600 text-white' : ''}`}
                >
                  {num + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} 
                disabled={currentPage === totalPages} 
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