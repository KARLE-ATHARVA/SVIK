import React, { useState, useEffect } from 'react';
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
          <button className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500" onClick={onCancel}>
            Cancel
          </button>
          <button className="bg-green-700 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 dark:hover:bg-green-700" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ColorMasterPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userid');

  const [searchTerm, setSearchTerm] = useState('');
  const [colors, setColors] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: () => {} });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ color_name: '', created_by: '' });
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetColorList`);
      setColors(res.data);
    } catch (error) {
      console.error('Error fetching colors:', error);
    }
  };

  const filtered = colors.filter(
    (color) =>
      color.color_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (color.block ? 'yes' : 'no').includes(searchTerm.toLowerCase()) ||
      (color.updated_by && color.updated_by.toLowerCase().includes(searchTerm.toLowerCase()))
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
  const currentColors = sorted.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const startEditing = (color) => {
    setEditId(color.color_id);
    setEditData({ ...color });
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
          formData.append('ColorId', editData.color_id);
          formData.append('ColorName', editData.color_name);
          formData.append('RequestBy', userId);
          const res = await axios.post(`${baseURL}/EditColor`, formData);
          if (res.data === 'success') {
            fetchColors();
            cancelEditing();
          } else {
            alert(res.data === 'alreadyexists' ? 'Color already exists!' : `Error: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
          alert('Error saving color');
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (colorId) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this color?',
      onConfirm: async () => {
        try {
          await axios.get(`${baseURL}/BlockColor/${userId}/${colorId}/1`);
          fetchColors();
        } catch (err) {
          console.error(err);
          alert('Error deleting color');
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const toggleBlock = async (color) => {
    try {
      await axios.get(`${baseURL}/BlockColor/${userId}/${color.color_id}/${color.block ? 0 : 1}`);
      fetchColors();
    } catch (err) {
      console.error(err);
      alert('Error toggling block status');
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({ color_name: '', created_by: userId });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ color_name: '', created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.color_name) {
      alert('Please enter a color name');
      return;
    }
    setConfirmation({
      show: true,
      message: 'Are you sure you want to add this color?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('ColorName', newData.color_name);
          formData.append('RequestBy', newData.created_by);
          const res = await axios.post(`${baseURL}/AddColor`, formData);
          if (res.data === 'success') {
            fetchColors();
            cancelAdding();
          } else {
            alert(res.data === 'alreadyexists' ? 'Color already exists!' : `Error: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
          alert('Error adding color');
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const headers = [
    { key: 'color_id', label: 'Color ID' },
    { key: 'color_name', label: 'Color Name' },
    { key: 'updated_by', label: 'Updated By' },
    { key: 'updated_date', label: 'Updated Date' },
    { key: 'block', label: 'Block' },
  ];

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <div className={`flex flex-col flex-1 overflow-y-auto p-6 transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">Colors</h2>
            <Breadcrumb />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-200"
            />
            {!isAdding && (
              <button
                className="bg-green-700 dark:bg-green-600 text-white px-4 py-1 rounded hover:bg-green-800 dark:hover:bg-green-700 flex items-center"
                onClick={startAdding}
              >
                <FaPlus className="mr-2" /> Add New Color
              </button>
            )}
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
                    <td className="px-4 py-2">—</td>
                    <td className="px-4 py-2">
                      <input
                        value={newData.color_name}
                        onChange={(e) => setNewData({ ...newData, color_name: e.target.value })}
                        className="border dark:border-gray-600 rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200"
                      />
                    </td>
                    <td className="px-4 py-2">{userId}</td>
                    <td className="px-4 py-2">—</td>
                    <td className="px-4 py-2">—</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={saveAdding} className="text-green-600 hover:text-green-800 dark:hover:text-green-500"><FaSave size={18} /></button>
                      <button onClick={cancelAdding} className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"><FaTimes size={18} /></button>
                    </td>
                  </tr>
                )}
                {currentColors.map((color) => (
                  <tr key={color.color_id} className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                    <td className="px-4 py-2">{color.color_id}</td>
                    <td className="px-4 py-2">
                      {editId === color.color_id ? (
                        <input
                          value={editData.color_name}
                          onChange={(e) => handleEditChange('color_name', e.target.value)}
                          className="border dark:border-gray-600 rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200"
                        />
                      ) : (
                        color.color_name
                      )}
                    </td>
                    <td className="px-4 py-2">{color.updated_by}</td>
                    <td className="px-4 py-2">{new Date(color.updated_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span
                        onClick={() => toggleBlock(color)}
                        className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${
                          color.block ? 'bg-red-600' : 'bg-green-600'
                        }`}
                      >
                        {color.block ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      {editId === color.color_id ? (
                        <>
                          <button onClick={confirmSave} className="text-green-600 hover:text-green-800 dark:hover:text-green-500"><FaSave size={18} /></button>
                          <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-400"><FaTimes size={18} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(color)} className="text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-300"><FaEdit size={18} /></button>
                          <button onClick={() => confirmDelete(color.color_id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-300"><FaTrash size={18} /></button>
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
              <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50">
                Previous
              </button>
              {[...Array(totalPages).keys()].map(num => (
                <button key={num + 1} onClick={() => setCurrentPage(num + 1)} className={`px-3 py-1 border dark:border-gray-700 rounded ${currentPage === num + 1 ? 'bg-green-600 text-white' : 'dark:text-gray-200'}`}>
                  {num + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border dark:border-gray-700 rounded disabled:opacity-50">
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