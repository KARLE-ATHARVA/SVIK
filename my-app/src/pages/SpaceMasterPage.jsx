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
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end space-x-2">
          <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400" onClick={onCancel}>
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

export default function SpaceMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [spaces, setSpaces] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: () => {} });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ space_name: '', created_by: '' });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  const sortedSpaces = React.useMemo(() => {
    let sortable = [...spaces];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (typeof aVal === 'string') return (aVal.localeCompare(bVal)) * (sortConfig.direction === 'asc' ? 1 : -1);
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [spaces, sortConfig]);

  const filteredSpaces = sortedSpaces.filter(space =>
    space.space_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => (
    <span className="inline-block ml-1">
      <FaSortUp
        className={`text-xs ${
          sortConfig.key === key && sortConfig.direction === 'asc' ? 'text-blue-500' : 'text-gray-400'
        }`}
      />
      <FaSortDown
        className={`-mt-1 text-xs ${
          sortConfig.key === key && sortConfig.direction === 'desc' ? 'text-blue-500' : 'text-gray-400'
        }`}
      />
    </span>
  );

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
      }
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
      }
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
      }
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Space Master Table</h2>
            <Breadcrumb  className="text-2xl"/>
          </div>

          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search Space Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {!isAdding && (
              <button
                onClick={startAdding}
                className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 flex items-center"
              >
                <FaPlus className="mr-2" /> Add New Space
              </button>
            )}
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('space_id')}>
                    ID {getSortIcon('space_id')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('space_name')}>
                    Space Name {getSortIcon('space_name')}
                  </th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('updated_by')}>
                    Updated By {getSortIcon('updated_by')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => requestSort('updated_date')}>
                    Updated Date {getSortIcon('updated_date')}
                  </th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <tr>
                    <td className="px-4 py-3">New</td>
                    <td className="px-4 py-3">
                      <input
                        className="border px-2 py-1 rounded w-full"
                        value={newData.space_name}
                        onChange={(e) => setNewData({ ...newData, space_name: e.target.value })}
                      />
                    </td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">{userId}</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3 space-x-2">
                      <button onClick={saveAdding} className="text-green-600 hover:text-green-800">
                        <FaSave size={18} />
                      </button>
                      <button onClick={cancelAdding} className="text-gray-600 hover:text-gray-800">
                        <FaTimes size={18} />
                      </button>
                    </td>
                  </tr>
                )}
                {filteredSpaces.map((space) => (
                  <tr key={space.space_id} className="border-t">
                    <td className="px-4 py-3">{space.space_id}</td>
                    <td className="px-4 py-3">
                      {editId === space.space_id ? (
                        <input
                          className="border px-2 py-1 rounded w-full"
                          value={editData.space_name}
                          onChange={(e) => handleEditChange('space_name', e.target.value)}
                        />
                      ) : (
                        space.space_name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        onClick={() => toggleBlock(space)}
                        className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${
                          space.block ? 'bg-red-600' : 'bg-green-600'
                        }`}
                      >
                        {space.block ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{space.updated_by || '-'}</td>
                    <td className="px-4 py-3">{new Date(space.updated_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 space-x-2 flex">
                      {editId === space.space_id ? (
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
                          <button onClick={() => startEditing(space)} className="text-yellow-500 hover:text-yellow-700">
                            <FaEdit size={18} />
                          </button>
                          <button onClick={() => confirmDelete(space.space_id)} className="text-red-500 hover:text-red-700">
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

          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <div>Showing {filteredSpaces.length} entries</div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Previous</button>
              <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Next</button>
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
