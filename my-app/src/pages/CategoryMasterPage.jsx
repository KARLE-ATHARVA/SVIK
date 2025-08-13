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

export default function CategoryMasterPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: () => {} });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ cat_name: '', created_by: '' });
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '',direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetCategoryList`);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  useEffect(() => {
    setFadeIn(true)
    fetchCategories();
  }, []);

  const filtered = categories.filter(
    (cat) =>
      cat.cat_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.block ? 'yes' : 'no').includes(searchTerm.toLowerCase())
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


  const startEditing = (cat) => {
    setEditId(cat.cat_id);
    setEditData({ ...cat });
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
          formData.append('CatId', editData.cat_id);
          formData.append('CatName', editData.cat_name);
          formData.append('RequestBy', userId);

          const res = await axios.post(`${baseURL}/EditCategory`, formData);
          if (res.data === 'success') {
            fetchCategories();
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
          const res = await axios.get(`${baseURL}/BlockCategory/${userId}/${id}/1`);
          if (res.data === 'success') fetchCategories();
        } catch (err) {
          console.error('Delete failed', err);
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const toggleBlock = async (cat) => {
    try {
      const res = await axios.get(`${baseURL}/BlockCategory/${userId}/${cat.cat_id}/${cat.block ? 0 : 1}`);
      if (res.data === 'success') fetchCategories();
    } catch (err) {
      console.error('Block toggle failed', err);
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({ cat_name: '', created_by: userId });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ cat_name: '', created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.cat_name || !newData.created_by) {
      alert('Please fill all required fields');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new category?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('CatName', newData.cat_name);
          formData.append('RequestBy', newData.created_by);

          const res = await axios.post(`${baseURL}/AddCategory`, formData);
          if (res.data === 'success') {
            fetchCategories();
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
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800">Category</h2>
            <Breadcrumb />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search Category Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {!isAdding && (
              <button
                className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 flex items-center"
                onClick={startAdding}
              >
                <FaPlus className="mr-2" /> Add New Category
              </button>
            )}
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-100 text-grey-800">
                <tr>
                  <th className="px-4 py-2 font-semibold text-left">Category Name</th>
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
                        value={newData.cat_name}
                        onChange={(e) => setNewData({ ...newData, cat_name: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2"> -- </td>
                    <td className="px-4 py-2"> -- </td>
                    <td className="px-4 py-2"> -- </td>                                        

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

                {currentApps.map((cat) => (
                  <tr key={cat.cat_id} className="border-b hover:bg-green-50 transition duration-150">
                    <td className="px-4 py-2">
                      {editId === cat.cat_id ? (
                        <input
                          value={editData.cat_name}
                          onChange={(e) => handleEditChange('cat_name', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        cat.cat_name
                      )}
                    </td>
                    <td className="px-4 py-2">{cat.updated_by}</td>
                    <td className="px-4 py-2">{new Date(cat.updated_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span
                        onClick={() => toggleBlock(cat)}
                        className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${
                          cat.block ? 'bg-red-600' : 'bg-green-600'
                        }`}
                      >
                        {cat.block ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2 flex">
                      {editId === cat.cat_id ? (
                        <>
                          <button onClick={confirmSave} className="text-green-600 hover:text-green-800">
                            <FaSave size={22} />
                          </button>
                          <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800">
                            <FaTimes size={22} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(cat)} className="text-yellow-500 hover:text-yellow-700">
                            <FaEdit size={18} />
                          </button>
                          <button onClick={() => confirmDelete(cat.cat_id)} className="text-red-500 hover:text-red-700">
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
