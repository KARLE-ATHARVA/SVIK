import React, { useState, useEffect } from 'react';
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

export default function UserMasterPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: () => {} });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ 
    CompId: '', 
    UserName: '', 
    EmailId: '', 
    ContNumber: '', 
    ProfileId: '', 
    RequestBy: userId,
    block: false
  });
  const [error, setError] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetUserList`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err);
      setError('Error fetching users: ' + err.message);
    }
  };

  useEffect(() => {
    setFadeIn(true);
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (user) =>
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.block ? 'yes' : 'no').includes(searchTerm.toLowerCase())
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
  const currentUsers = sorted.slice(indexOfFirst, indexOfLast);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const startEditing = (user) => {
    setEditId(user.user_id);
    setEditData({ 
      UserId: user.user_id,
      CompId: user.comp_id,
      UserName: user.user_name,
      EmailId: user.email_id,
      ContNumber: user.cont_number,
      ProfileId: user.profile_id,
      RequestBy: userId,
      block: user.block
    });
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
          formData.append('UserId', editData.UserId);
          formData.append('CompId', editData.CompId);
          formData.append('UserName', editData.UserName);
          formData.append('EmailId', editData.EmailId);
          formData.append('ContNumber', editData.ContNumber);
          formData.append('ProfileId', editData.ProfileId);
          formData.append('RequestBy', editData.RequestBy);
          formData.append('block', editData.block ? '1' : '0');

          const res = await axios.post(`${baseURL}/EditUser`, formData);
          if (res.data === 'success') {
            fetchUsers();
            cancelEditing();
          } else {
            setError(res.data === 'alreadyexists' ? 'User already exists' : res.data);
          }
        } catch (err) {
          console.error('Edit failed', err);
          setError('Edit failed: ' + err.message);
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (id) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this user?',
      onConfirm: async () => {
        try {
          const res = await axios.get(`${baseURL}/DeleteUser/${id}`);
          if (res.data === 'success') fetchUsers();
        } catch (err) {
          console.error('Delete failed', err);
          setError('Delete failed: ' + err.message);
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const toggleBlock = async (user) => {
    try {
      const status = user.block ? 0 : 1;
      const res = await axios.get(`${baseURL}/BlockUser/${userId}/${user.user_id}/${status}`);
      if (res.data === 'success') fetchUsers();
    } catch (err) {
      console.error('Block toggle failed', err);
      setError('Block toggle failed: ' + err.message);
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({ 
      CompId: '', 
      UserName: '', 
      EmailId: '', 
      ContNumber: '', 
      ProfileId: '', 
      RequestBy: userId,
      block: false
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ 
      CompId: '', 
      UserName: '', 
      EmailId: '', 
      ContNumber: '', 
      ProfileId: '', 
      RequestBy: userId,
      block: false
    });
  };

  const saveAdding = () => {
    if (!newData.UserName || !newData.EmailId) {
      setError('Please fill all required fields');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new user?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('CompId', newData.CompId);
          formData.append('UserName', newData.UserName);
          formData.append('EmailId', newData.EmailId);
          formData.append('ContNumber', newData.ContNumber);
          formData.append('ProfileId', newData.ProfileId);
          formData.append('RequestBy', newData.RequestBy);
          formData.append('block', newData.block ? '1' : '0');

          const res = await axios.post(`${baseURL}/AddUser`, formData);
          if (res.data === 'success') {
            fetchUsers();
            cancelAdding();
          } else {
            setError(res.data === 'alreadyexists' ? 'User already exists' : res.data);
          }
        } catch (err) {
          console.error('Add failed', err);
          setError('Add failed: ' + err.message);
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
            <h2 className="text-2xl font-bold text-green-800">User </h2>
            <Breadcrumb />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              <button 
                className="float-right font-bold" 
                onClick={() => setError('')}
              >
                ×
              </button>
            </div>
          )}

<div className="mb-4 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
  {/* Show Entries - Leftmost */}
  <div className="flex items-center bg-white rounded-lg border border-gray-300 px-3 py-1.5">
    <span className="text-sm text-gray-600 mr-2 whitespace-nowrap">Show</span>
    <select
      value={entriesPerPage}
      onChange={(e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
      }}
      className="border-none focus:ring-2 focus:ring-green-600 rounded text-sm"
    >
      {[5, 10, 25, 50, 100].map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    <span className="text-sm text-gray-600 ml-2 whitespace-nowrap">entries</span>
  </div>

  {/* Search Input - Middle with controlled width */}
  <div className="relative w-full sm:w-64">
    <input
      type="text"
      placeholder="Search by name or email..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
    />
  </div>

  {/* Add New User Button - Rightmost */}
  {!isAdding && (
    <div className="w-full sm:w-auto ml-auto">
      <button
        className="inline-flex items-center bg-green-700 hover:bg-green-800 text-white px-4 py-1.5 rounded-lg transition-colors duration-200"
        onClick={startAdding}
      >
        <FaPlus className="mr-2" /> Add New User
      </button>
    </div>
  )}
</div>
          <div className="overflow-x-auto bg-white rounded-lg shadow" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-100 text-grey-800 sticky top-0">
                <tr>
                  <th className="px-4 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort('user_name')}>
                    User Name
                    {sortConfig.key === 'user_name' && (
                      <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-2 font-semibold text-left">Email</th>
                  <th className="px-4 py-2 font-semibold text-left">Contact</th>
                  <th className="px-4 py-2 font-semibold text-left">Company ID</th>
                  <th className="px-4 py-2 font-semibold text-left">Profile ID</th>
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
                        value={newData.UserName}
                        onChange={(e) => setNewData({ ...newData, UserName: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="User Name"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={newData.EmailId}
                        onChange={(e) => setNewData({ ...newData, EmailId: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Email"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={newData.ContNumber}
                        onChange={(e) => setNewData({ ...newData, ContNumber: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Contact"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={newData.CompId}
                        onChange={(e) => setNewData({ ...newData, CompId: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Company ID"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={newData.ProfileId}
                        onChange={(e) => setNewData({ ...newData, ProfileId: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="Profile ID"
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

                {currentUsers.map((user) => (
                  <tr key={user.user_id} className="border-b hover:bg-green-50 transition duration-150">
                    <td className="px-4 py-2">
                      {editId === user.user_id ? (
                        <input
                          value={editData.UserName}
                          onChange={(e) => handleEditChange('UserName', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        user.user_name
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editId === user.user_id ? (
                        <input
                          value={editData.EmailId}
                          onChange={(e) => handleEditChange('EmailId', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        user.email_id
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editId === user.user_id ? (
                        <input
                          value={editData.ContNumber}
                          onChange={(e) => handleEditChange('ContNumber', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        user.cont_number
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editId === user.user_id ? (
                        <input
                          value={editData.CompId}
                          onChange={(e) => handleEditChange('CompId', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        user.comp_id
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {editId === user.user_id ? (
                        <input
                          value={editData.ProfileId}
                          onChange={(e) => handleEditChange('ProfileId', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        user.profile_id
                      )}
                    </td>
                    <td className="px-4 py-2">{user.updated_by}</td>
                    <td className="px-4 py-2">{new Date(user.updated_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span
                        onClick={() => toggleBlock(user)}
                        className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${
                          user.block ? 'bg-red-600' : 'bg-green-600'
                        }`}
                      >
                        {user.block ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2 flex">
                      {editId === user.user_id ? (
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
                          <button onClick={() => startEditing(user)} className="text-yellow-500 hover:text-yellow-700">
                            <FaEdit size={18} />
                          </button>
                          <button onClick={() => confirmDelete(user.user_id)} className="text-red-500 hover:text-red-700">
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