import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[400px]">
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

export default function UserMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    CompId: '',
    UserName: '',
    EmailId: '',
    ContNumber: '',
    ProfileId: '',
    RequestBy: '',
  });
  const [confirmation, setConfirmation] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  });
  const [error, setError] = useState('');

  const API_BASE_URL = 'https://svikinfotech.com/clients/visualizer/api/';

  // Current timestamp in IST (2025-08-03T15:30:00+05:30)
  const currentDateTime = '2025-08-03T15:30:00+05:30';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/GetUserList`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('API Response:', data);
        if (Array.isArray(data)) {
          const mappedUsers = data.map(user => ({
            user_id: user.user_id || 0,
            comp_id: user.comp_id || '',
            user_name: user.user_name || '',
            email_id: user.email_id || '',
            cont_number: user.cont_number || '',
            profile_id: user.profile_id || 0,
            block: user.block || false,
            created_by: user.created_by || 0,
            created_date: user.created_date || currentDateTime,
            modify_by: user.modify_by || 0,
            modify_date: user.modify_date || currentDateTime,
            updated_by: user.updated_by || '',
            updated_date: user.updated_date || currentDateTime,
          }));
          setUsers(mappedUsers);
        } else {
          setError('Failed to fetch user list: Invalid response format');
        }
      } catch (err) {
        setError('Error fetching user list: ' + err.message);
      }
    };
    fetchUsers();
  }, []);

  const startEditing = (user) => {
    setEditId(user.user_id);
    setEditData({
      UserId: user.user_id,
      CompId: user.comp_id,
      UserName: user.user_name,
      EmailId: user.email_id,
      ContNumber: user.cont_number,
      ProfileId: user.profile_id,
      RequestBy: user.modify_by,
    });
  };

  const cancelEditing = () => {
    setEditId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const saveEdit = async () => {
    const formData = new FormData();
    Object.keys(editData).forEach(key => {
      formData.append(key, editData[key]);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/EditUser`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.text();
      if (result === 'success') {
        setUsers(users.map(user =>
          user.user_id === editId
            ? {
                ...user,
                comp_id: parseInt(editData.CompId),
                user_name: editData.UserName,
                email_id: editData.EmailId,
                cont_number: editData.ContNumber,
                profile_id: parseInt(editData.ProfileId),
                modify_by: parseInt(editData.RequestBy),
                modify_date: currentDateTime,
              }
            : user
        ).sort((a, b) => a.user_id - b.user_id));
        setEditId(null);
        setEditData({});
        setConfirmation({ ...confirmation, show: false });
      } else if (result === 'alreadyexists') {
        setError('User already exists');
      } else {
        setError(result);
      }
    } catch (err) {
      setError('Error editing user: ' + err.message);
    }
  };

  const confirmSave = () => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save changes?',
      onConfirm: saveEdit,
    });
  };

  const confirmDelete = (id) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this user?',
      onConfirm: async () => {
        setUsers(users.filter(user => user.user_id !== id));
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({
      CompId: '',
      UserName: '',
      EmailId: '',
      ContNumber: '',
      ProfileId: '',
      RequestBy: '',
    });
  };

  const saveAdding = async () => {
    if (!newData.UserName || !newData.EmailId) {
      setError('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    Object.keys(newData).forEach(key => {
      formData.append(key, newData[key]);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/AddUser`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.text();
      if (result === 'success') {
        const newUser = {
          user_id: users.length ? Math.max(...users.map(u => u.user_id)) + 1 : 1,
          comp_id: parseInt(newData.CompId),
          user_name: newData.UserName,
          email_id: newData.EmailId,
          cont_number: newData.ContNumber,
          profile_id: parseInt(newData.ProfileId),
          block: false,
          created_by: parseInt(newData.RequestBy),
          created_date: currentDateTime,
          modify_by: parseInt(newData.RequestBy),
          modify_date: currentDateTime,
          updated_by: newData.UserName,
          updated_date: currentDateTime,
        };
        setUsers([...users, newUser].sort((a, b) => a.user_id - b.user_id));
        cancelAdding();
        setConfirmation({ ...confirmation, show: false });
      } else if (result === 'alreadyexists') {
        setError('User already exists');
      } else {
        setError(result);
      }
    } catch (err) {
      setError('Error adding user: ' + err.message);
    }
  };

  const confirmAdd = () => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new user?',
      onConfirm: saveAdding,
    });
  };

  const toggleBlock = async (user) => {
    const status = user.block ? 0 : 1;
    try {
      const response = await fetch(
        `${API_BASE_URL}/BlockUser/${user.modify_by || 0}/${user.user_id}/${status}`,
        {
          method: 'GET',
        }
      );
      const result = await response.text();
      if (result === 'success') {
        setUsers(users.map(u =>
          u.user_id === user.user_id
            ? { ...u, block: status === 1, modify_date: currentDateTime }
            : u
        ));
      } else {
        setError('Error toggling block status: ' + result);
      }
    } catch (err) {
      setError('Error toggling block status: ' + err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const userName = user.user_name || '';
    const emailId = user.email_id || '';
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emailId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="p-5 flex-1">
                  <Breadcrumbs currentPage="Tile Master" />
        <div className="flex flex-col flex-1 p-6 overflow-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button
                className="ml-4 text-red-700 hover:text-red-900"
                onClick={() => setError('')}
              >
                Close
              </button>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">User Master Table</h2>
            <div className="flex space-x-2">
              {!isAdding && (
                <button
                  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center"
                  onClick={startAdding}
                >
                  <FaPlus className="mr-2" /> Add New User
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by User Name or Email ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value || '')}
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Company ID</th>
                  <th className="px-4 py-3">User Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Contact Number</th>
                  <th className="px-4 py-3">Profile ID</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              {filteredUsers.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan="9" className="px-4 py-3 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="bg-white divide-y divide-gray-200">
                  {isAdding && (
                    <tr>
                      <td className="px-4 py-3">New</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={newData.CompId}
                          onChange={e =>
                            setNewData({ ...newData, CompId: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={newData.UserName}
                          onChange={e =>
                            setNewData({ ...newData, UserName: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={newData.EmailId}
                          onChange={e =>
                            setNewData({ ...newData, EmailId: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={newData.ContNumber}
                          onChange={e =>
                            setNewData({ ...newData, ContNumber: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={newData.ProfileId}
                          onChange={e =>
                            setNewData({ ...newData, ProfileId: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={newData.block}
                          onChange={e =>
                            setNewData({ ...newData, block: e.target.checked })
                          }
                          disabled
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={newData.RequestBy}
                          onChange={e =>
                            setNewData({ ...newData, RequestBy: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="px-4 py-3 flex space-x-2">
                        <button
                          onClick={confirmAdd}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaSave size={20} />
                        </button>
                        <button
                          onClick={cancelAdding}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <FaTimes size={20} />
                        </button>
                      </td>
                    </tr>
                  )}
                  {filteredUsers.map(user => (
                    <tr key={user.user_id}>
                      <td className="px-4 py-3">{user.user_id}</td>
                      <td className="px-4 py-3">{user.comp_id}</td>
                      <td className="px-4 py-3">{user.user_name}</td>
                      <td className="px-4 py-3">{user.email_id}</td>
                      <td className="px-4 py-3">{user.cont_number}</td>
                      <td className="px-4 py-3">{user.profile_id}</td>
                      <td className="px-4 py-3">
                        {editId === user.user_id ? (
                          <input
                            type="checkbox"
                            checked={editData.block}
                            onChange={e =>
                              handleEditChange('block', e.target.checked)
                            }
                          />
                        ) : (
                          <button
                            onClick={() => toggleBlock(user)}
                            className={`px-2 py-1 rounded ${
                              user.block
                                ? 'bg-yellow-500 hover:bg-yellow-600'
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white`}
                          >
                            {user.block ? 'Unblock' : 'Block'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">{user.created_by}</td>
                      <td className="px-4 py-3 flex space-x-2">
                        {editId === user.user_id ? (
                          <>
                            <button
                              onClick={confirmSave}
                              className="text-green-600 hover:text-green-800"
                            >
                              <FaSave size={20} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <FaTimes size={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(user)}
                              className="text-yellow-500 hover:text-yellow-700"
                            >
                              <FaEdit size={20} />
                            </button>
                            <button
                              onClick={() => confirmDelete(user.user_id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash size={20} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
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
