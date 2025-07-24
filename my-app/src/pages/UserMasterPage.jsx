import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-[400px]"> {/* Added dark:bg-gray-800 here */}
        <p className="mb-4 text-gray-800 dark:text-white">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
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
  const [users, setUsers] = useState([
    {
      user_id: 1,
      comp_id: 101,
      user_name: 'John Doe',
      email_id: 'john@example.com',
      cont_number: '1234567890',
      profile_id: 1,
      block: false,
      created_by: 999,
      created_date: '2025-07-07T12:34:56',
      modify_by: 999,
      modify_date: '2025-07-07T12:34:56',
    },
  ]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    comp_id: '',
    user_name: '',
    email_id: '',
    cont_number: '',
    profile_id: '',
    block: false,
    created_by: '',
  });
  const [confirmation, setConfirmation] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  });

  const startEditing = (user) => {
    setEditId(user.user_id);
    setEditData({ ...user });
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
      onConfirm: () => {
        const updatedUsers = users
          .map((user) =>
            user.user_id === editId
              ? {
                  ...editData,
                  modify_by: 999,
                  modify_date: new Date().toISOString(),
                }
              : user
          )
          .sort((a, b) => a.user_id - b.user_id);

        setUsers(updatedUsers);
        setEditId(null);
        setEditData({});
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (id) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this user?',
      onConfirm: () => {
        setUsers(users.filter((user) => user.user_id !== id));
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
      comp_id: '',
      user_name: '',
      email_id: '',
      cont_number: '',
      profile_id: '',
      block: false,
      created_by: '',
    });
  };

  const saveAdding = () => {
    if (!newData.user_name || !newData.email_id) {
      alert('Please fill all required fields');
      return;
    }
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new user?',
      onConfirm: () => {
        const newUser = {
          ...newData,
          user_id: users.length
            ? Math.max(...users.map((u) => u.user_id)) + 1
            : 1,
          created_by: parseInt(newData.created_by),
          created_date: new Date().toISOString(),
          modify_by: parseInt(newData.created_by),
          modify_date: new Date().toISOString(),
        };
        const updatedUsers = [...users, newUser].sort(
          (a, b) => a.user_id - b.user_id
        );
        setUsers(updatedUsers);
        cancelAdding();
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              User Master Table
            </h2>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Main table container with border */}
          <div className="overflow-x-auto rounded-lg shadow border border-gray-400 dark:border-gray-600">
            {/* Removed divide-y from table as we'll handle row borders explicitly */}
            <table className="min-w-full text-sm">
              <thead className="bg-green-700 text-white">
                {/* Added border-b to thead's tr for the horizontal line below header */}
                <tr className="border-b border-gray-400 dark:border-gray-600">
                  <th className="px-4 py-3 text-left">User ID</th>
                  <th className="px-4 py-3 text-left">Company ID</th>
                  <th className="px-4 py-3 text-left">User Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Contact Number</th>
                  <th className="px-4 py-3 text-left">Profile ID</th>
                  <th className="px-4 py-3 text-left">Block</th>
                  <th className="px-4 py-3 text-left">Created By</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              {/* Removed divide-y from tbody as we'll handle row borders explicitly */}
              <tbody className="bg-white dark:bg-gray-900">
                {isAdding && (
                  <tr className="border-b border-gray-200 dark:border-gray-700"> {/* Bottom border for the "add new" row */}
                    <td className="px-4 py-3 text-gray-800 dark:text-white">New</td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.comp_id}
                        onChange={(e) =>
                          setNewData({ ...newData, comp_id: e.target.value })
                        }
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.user_name}
                        onChange={(e) =>
                          setNewData({ ...newData, user_name: e.target.value })
                        }
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.email_id}
                        onChange={(e) =>
                          setNewData({ ...newData, email_id: e.target.value })
                        }
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.cont_number}
                        onChange={(e) =>
                          setNewData({
                            ...newData,
                            cont_number: e.target.value,
                          })
                        }
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.profile_id}
                        onChange={(e) =>
                          setNewData({
                            ...newData,
                            profile_id: e.target.value,
                          })
                        }
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-center"> {/* Centered checkbox */}
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
                          setNewData({
                            ...newData,
                            created_by: e.target.value,
                          })
                        }
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white" 
                      />
                    </td>
                    <td className="px-4 py-3 flex space-x-2 items-center justify-center"> {/* Centered actions */}
                      <button
                        onClick={saveAdding}
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

                {filteredUsers.map((user, index) => (
                  // Conditional border-b: apply only if it's not the last row
                  <tr
                    key={user.user_id}
                    className={`${
                      index === filteredUsers.length - 1
                        ? ''
                        : 'border-b border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <td className="px-4 py-3">{user.user_id}</td>
                    <td className="px-4 py-3">
                      {editId === user.user_id ? (
                        <input
                          value={editData.comp_id}
                          onChange={(e) =>
                            handleEditChange('comp_id', e.target.value)
                          }
                          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      ) : (
                        user.comp_id
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === user.user_id ? (
                        <input
                          value={editData.user_name}
                          onChange={(e) =>
                            handleEditChange('user_name', e.target.value)
                          }
                          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      ) : (
                        user.user_name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === user.user_id ? (
                        <input
                          value={editData.email_id}
                          onChange={(e) =>
                            handleEditChange('email_id', e.target.value)
                          }
                          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      ) : (
                        user.email_id
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === user.user_id ? (
                        <input
                          value={editData.cont_number}
                          onChange={(e) =>
                            handleEditChange('cont_number', e.target.value)
                          }
                          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      ) : (
                        user.cont_number
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === user.user_id ? (
                        <input
                          value={editData.profile_id}
                          onChange={(e) =>
                            handleEditChange('profile_id', e.target.value)
                          }
                          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      ) : (
                        user.profile_id
                      )}
                    </td>
                    <td className="px-4 py-3 text-center"> {/* Centered checkbox */}
                      {editId === user.user_id ? (
                        <input
                          type="checkbox"
                          checked={editData.block}
                          onChange={(e) =>
                            handleEditChange('block', e.target.checked)
                          }
                        />
                      ) : user.block ? (
                        'Yes'
                      ) : (
                        'No'
                      )}
                    </td>
                    <td className="px-4 py-3">{user.created_by}</td>
                    <td className="px-4 py-3 flex space-x-2 items-center justify-center"> {/* Centered actions */}
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