import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
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

export default function ColorMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [colors, setColors] = useState([]);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    color_name: '',
    created_by: '',
  });

  const userId = localStorage.getItem('userid');

  const fetchColors = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetColorList`);
      setColors(res.data);
    } catch (error) {
      console.error('Error fetching colors:', error);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const filteredColors = colors.filter(
    (color) =>
      color.color_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (color.block ? 'yes' : 'no').includes(searchTerm.toLowerCase())
  );

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

          if (res.data === 'alreadyexists') {
            alert('Color already exists!');
            return;
          } else if (res.data === 'success') {
            fetchColors();
          } else {
            alert(`Failed to update color: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
        }

        setEditId(null);
        setEditData({});
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (colorId) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this entry?',
      onConfirm: async () => {
        try {
          await axios.get(`${baseURL}/BlockColor/${userId}/${colorId}/1`);
          fetchColors();
        } catch (err) {
          console.error(err);
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
    if (!newData.color_name || !newData.created_by) {
      alert('Please fill all required fields');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new color?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('ColorName', newData.color_name);
          formData.append('RequestBy', newData.created_by);

          const res = await axios.post(`${baseURL}/AddColor`, formData);

          if (res.data === 'alreadyexists') {
            alert('Color already exists!');
            return;
          } else if (res.data === 'success') {
            fetchColors();
          } else {
            alert(`Failed to add color: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
        }

        setIsAdding(false);
        setNewData({ color_name: '', created_by: '' });
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Color Master Table</h2>
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

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">Color ID</th>
                  <th className="px-4 py-3">Color Name</th>
                  <th className="px-4 py-3">Block</th>

                  <th className="px-4 py-3">Updated By</th>
                  <th className="px-4 py-3">Updated Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAdding && (
                  <tr>
                    <td className="px-4 py-3">New</td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.color_name}
                        onChange={(e) =>
                          setNewData({ ...newData, color_name: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={newData.block}
                        onChange={(e) =>
                          setNewData({ ...newData, block: e.target.checked })
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={newData.created_by}
                        onChange={(e) =>
                          setNewData({ ...newData, created_by: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td colSpan="4" className="px-4 py-3 space-x-2 flex">
                      <button
                        onClick={saveAdding}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaSave size={22} />
                      </button>
                      <button
                        onClick={cancelAdding}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <FaTimes size={22} />
                      </button>
                    </td>
                  </tr>
                )}

                {filteredColors.map((color) => (
                  <tr key={color.color_id}>
                    <td className="px-4 py-3">{color.color_id}</td>
                    <td className="px-4 py-3">
                      {editId === color.color_id ? (
                        <input
                          value={editData.color_name}
                          onChange={(e) =>
                            handleEditChange('color_name', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        color.color_name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={color.block}
                        onChange={() => toggleBlock(color)}
                      />
                    </td>

                    <td className="px-4 py-3">{color.updated_by}</td>
                    <td className="px-4 py-3">
                      {new Date(color.updated_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 space-x-2 flex">
                      {editId === color.color_id ? (
                        <>
                          <button
                            onClick={confirmSave}
                            className="text-green-600 hover:text-green-800"
                          >
                            <FaSave size={22} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <FaTimes size={22} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(color)}
                            className="text-yellow-500 hover:text-yellow-700"
                          >
                            <FaEdit size={22} />
                          </button>
                          <button
                            onClick={() => confirmDelete(color.color_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash size={22} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
