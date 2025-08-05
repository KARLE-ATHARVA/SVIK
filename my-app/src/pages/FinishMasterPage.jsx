import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';
import ConfirmationModal from '../components/ConfirmationModal';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaKey } from 'react-icons/fa';

const baseURL = process.env.REACT_APP_API_BASE_URL;

function ChangePasswordModal({ show, onClose, onSave, userId }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!oldPassword || !newPassword) {
      setError('Please fill all fields');
      return;
    }
    onSave({ userId, oldPassword, newPassword });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Change Password</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="mb-2 w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-4 w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function LoginMasterPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logins, setLogins] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newData, setNewData] = useState({
    CompId: '',
    UserId: '',
    LoginName: '',
    LoginPassword: '',
    RequestBy: '',
    block: false,
  });
  const [confirmation, setConfirmation] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  });
  const [error, setError] = useState('');

  // Current timestamp in IST
  const currentDateTime = '2025-08-05T23:37:00+05:30';

  useEffect(() => {
    const fetchLogins = async () => {
      try {
        const response = await fetch(`${baseURL}/GetLoginList`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('API Response:', data);
        if (Array.isArray(data)) {
          const mappedLogins = data.map(login => ({
            login_id: login.LoginId || 0,
            comp_id: login.CompId || 0,
            user_id: login.UserId || 0,
            login_name: login.LoginName || '',
            login_password: login.LoginPassword || '',
            block: login.Block || false,
            created_by: login.CreatedBy || 0,
            created_date: login.CreatedDate || currentDateTime,
            modify_by: login.ModifyBy || 0,
            modify_date: login.ModifyDate || currentDateTime,
          }));
          setLogins(mappedLogins);
        } else {
          setError('Failed to fetch login list: Invalid response format');
        }
      } catch (err) {
        setError('Error fetching login list: ' + err.message);
      }
    };
    fetchLogins();
  }, []);

  const startEditing = (login) => {
    setEditId(login.login_id);
    setEditData({
      LoginId: login.login_id,
      CompId: login.comp_id,
      UserId: login.user_id,
      LoginName: login.login_name,
      LoginPassword: login.login_password,
      RequestBy: login.modify_by,
      block: login.block,
    });
  };

  const handlePasswordChange = async ({ userId, oldPassword, newPassword }) => {
    const formData = new FormData();
    formData.append('UserId', userId);
    formData.append('OldPassword', oldPassword);
    formData.append('NewPassword', newPassword);

    try {
      const response = await fetch(`${baseURL}/ChangePassword`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.text();
      if (result === 'success') {
        setShowPasswordModal(false);
        setSelectedUserId(null);
        setError('');
      } else {
        setError(result);
      }
    } catch (err) {
      setError('Error changing password: ' + err.message);
    }
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
    formData.append('LoginId', editData.LoginId);
    formData.append('CompId', editData.CompId);
    formData.append('UserId', editData.UserId);
    formData.append('LoginName', editData.LoginName);
    formData.append('LoginPassword', editData.LoginPassword);
    formData.append('RequestBy', editData.RequestBy);
    formData.append('Block', editData.block);

    try {
      const response = await fetch(`${baseURL}/EditLogin`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.text();
      if (result === 'success') {
        setLogins(logins.map(login =>
          login.login_id === editId
            ? {
                ...login,
                comp_id: parseInt(editData.CompId) || login.comp_id,
                user_id: parseInt(editData.UserId) || login.user_id,
                login_name: editData.LoginName || login.login_name,
                login_password: editData.LoginPassword || login.login_password,
                modify_by: parseInt(editData.RequestBy) || login.modify_by,
                modify_date: currentDateTime,
                block: editData.block || login.block,
              }
            : login
        ).sort((a, b) => a.login_id - b.login_id));
        setEditId(null);
        setEditData({});
        setConfirmation({ show: false, message: '', onConfirm: () => {} });
      } else if (result === 'alreadyexists') {
        setError('Login already exists');
      } else {
        setError(result);
      }
    } catch (err) {
      setError('Error editing login: ' + err.message);
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
      message: 'Are you sure you want to delete this login?',
      onConfirm: async () => {
        try {
          const response = await fetch(`${baseURL}/DeleteLogin/${id}`, {
            method: 'POST',
          });
          const result = await response.text();
          if (result === 'success') {
            setLogins(logins.filter(login => login.login_id !== id));
            setConfirmation({ show: false, message: '', onConfirm: () => {} });
          } else {
            setError('Error deleting login: ' + result);
          }
        } catch (err) {
          setError('Error deleting login: ' + err.message);
        }
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({
      CompId: '',
      UserId: '',
      LoginName: '',
      LoginPassword: '',
      RequestBy: '',
      block: false,
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({
      CompId: '',
      UserId: '',
      LoginName: '',
      LoginPassword: '',
      RequestBy: '',
      block: false,
    });
  };

  const saveAdding = async () => {
    if (!newData.LoginName || !newData.LoginPassword || !newData.CompId || !newData.UserId || !newData.RequestBy) {
      setError('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    Object.keys(newData).forEach(key => {
      formData.append(key, newData[key]);
    });

    try {
      const response = await fetch(`${baseURL}/AddLogin`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.text();
      if (result === 'success') {
        const newLogin = {
          login_id: logins.length ? Math.max(...logins.map(l => l.login_id)) + 1 : 1,
          comp_id: parseInt(newData.CompId) || 0,
          user_id: parseInt(newData.UserId) || 0,
          login_name: newData.LoginName,
          login_password: newData.LoginPassword,
          block: newData.block || false,
          created_by: parseInt(newData.RequestBy) || 0,
          created_date: currentDateTime,
          modify_by: parseInt(newData.RequestBy) || 0,
          modify_date: currentDateTime,
        };
        setLogins([...logins, newLogin].sort((a, b) => a.login_id - b.login_id));
        cancelAdding();
        setConfirmation({ show: false, message: '', onConfirm: () => {} });
      } else if (result === 'alreadyexists') {
        setError('Login already exists');
      } else {
        setError(result);
      }
    } catch (err) {
      setError('Error adding login: ' + err.message);
    }
  };

  const confirmAdd = () => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new login?',
      onConfirm: saveAdding,
    });
  };

  const toggleBlock = async (login) => {
    const status = login.block ? 0 : 1;
    try {
      const response = await fetch(
        `${baseURL}/BlockLogin/${login.modify_by || 0}/${login.login_id}/${status}`,
        {
          method: 'POST',
        }
      );
      const result = await response.text();
      if (result === 'success') {
        setLogins(logins.map(l =>
          l.login_id === login.login_id
            ? { ...l, block: status === 1, modify_date: currentDateTime }
            : l
        ));
      } else {
        setError('Error toggling block status: ' + result);
      }
    } catch (err) {
      setError('Error toggling block status: ' + err.message);
    }
  };

  const filteredLogins = logins.filter(login => {
    const loginName = login.login_name || '';
    return loginName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Login</h2>
            <Breadcrumbs currentPage="Login Master" />
          </div>
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
          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by Login Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value || '')}
              className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 w-1/3"
            />
            {!isAdding && (
              <button
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center"
                onClick={startAdding}
              >
                <FaPlus className="mr-2" /> Add New Login
              </button>
            )}
          </div>
          <div className="overflow-x-auto rounded-lg shadow border border-gray-400 dark:border-gray-600">
            <table className="min-w-full text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">Login ID</th>
                  <th className="px-4 py-3">Comp ID</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Login Name</th>
                  <th className="px-4 py-3">Password</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900">
                {isAdding && (
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3">New</td>
                    {[
                      'CompId',
                      'UserId',
                      'LoginName',
                      'LoginPassword',
                    ].map(field => (
                      <td key={field} className="px-4 py-3">
                        <input
                          value={newData[field]}
                          onChange={e =>
                            setNewData({ ...newData, [field]: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                          type={field === 'CompId' || field === 'UserId' ? 'number' : 'text'}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={newData.block}
                        onChange={e =>
                          setNewData({ ...newData, block: e.target.checked })
                        }
                        disabled
                        className="dark:bg-gray-800 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={newData.RequestBy}
                        onChange={e =>
                          setNewData({ ...newData, RequestBy: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      />
                    </td>
                    <td className="px-4 py-3 flex space-x-2">
                      <button
                        onClick={confirmAdd}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaSave size={22} />
                      </button>
                      <button
                        onClick={cancelAdding}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <FaTimes size={22} />
                      </button>
                    </td>
                  </tr>
                )}
                {filteredLogins.map(login => (
                  <tr key={login.login_id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3">{login.login_id}</td>
                    {[
                      'comp_id',
                      'user_id',
                      'login_name',
                      'login_password',
                    ].map(field => (
                      <td key={field} className="px-4 py-3">
                        {editId === login.login_id ? (
                          <input
                            value={editData[field]}
                            onChange={e =>
                              handleEditChange(field, e.target.value)
                            }
                            className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                            type={field === 'comp_id' || field === 'user_id' ? 'number' : 'text'}
                          />
                        ) : (
                          login[field]
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {editId === login.login_id ? (
                        <input
                          type="checkbox"
                          checked={editData.block}
                          onChange={e =>
                            handleEditChange('block', e.target.checked)
                          }
                          className="dark:bg-gray-800 dark:border-gray-600"
                        />
                      ) : (
                        <button
                          onClick={() => toggleBlock(login)}
                          className={`px-2 py-1 rounded ${
                            login.block
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white`}
                        >
                          {login.block ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === login.login_id ? (
                        <input
                          type="number"
                          value={editData.RequestBy}
                          onChange={e => handleEditChange('RequestBy', e.target.value)}
                          className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                      ) : (
                        login.created_by
                      )}
                    </td>
                    <td className="px-4 py-3 flex space-x-2">
                      {editId === login.login_id ? (
                        <>
                          <button
                            onClick={confirmSave}
                            className="text-green-600 hover:text-green-800"
                          >
                            <FaSave size={22} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <FaTimes size={22} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(login)}
                            className="text-yellow-500 hover:text-yellow-700"
                          >
                            <FaEdit size={22} />
                          </button>
                          <button
                            onClick={() => confirmDelete(login.login_id)}
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
            {filteredLogins.length === 0 && !isAdding && (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                No logins found
              </div>
            )}
          </div>
        </div>
      </div>
      {confirmation.show && (
        <ConfirmationModal
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={() => setConfirmation({ show: false, message: '', onConfirm: () => {} })}
        />
      )}
    </div>
  );
}
