// src/pages/ApplicationMasterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

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

export default function ApplicationMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [apps, setApps] = useState([
    {
      app_id: 1,
      app_name: 'Floor',
      block: true,
      created_by: 101,
      created_date: '2025-07-07T12:34:56',
      modify_by: 101,
      modify_date: '2025-07-07T12:34:56',
    },
    {
      app_id: 2,
      app_name: 'Wall',
      block: false,
      created_by: 102,
      created_date: '2025-07-06T09:30:00',
      modify_by: 103,
      modify_date: '2025-07-07T14:20:00',
    },
    {
      app_id: 3,
      app_name: 'Floor&Wall',
      block: false,
      created_by: 102,
      created_date: '2025-07-06T09:30:00',
      modify_by: 103,
      modify_date: '2025-07-07T14:20:00',
    }
  ]);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    app_name: '',
    block: false,
    created_by: '',
  });

  const filteredApps = apps.filter(
    (app) =>
      app.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.block ? 'yes' : 'no').includes(searchTerm.toLowerCase())
  );

  const startEditing = (app) => {
    setEditId(app.app_id);
    setEditData({ ...app });
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
        const updatedApps = apps.map((app) =>
          app.app_id === editId
            ? { ...editData, modify_by: 999, modify_date: new Date().toISOString() }
            : app
        );
        setApps(updatedApps);
        setEditId(null);
        setEditData({});
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (id) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this entry?',
      onConfirm: () => {
        setApps(apps.filter((app) => app.app_id !== id));
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({
      app_name: '',
      block: false,
      created_by: '',
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ app_name: '', block: false, created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.app_name || !newData.created_by) {
      alert('Please fill all required fields');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new application?',
      onConfirm: () => {
        const newEntry = {
          ...newData,
          app_id: apps.length ? Math.max(...apps.map((a) => a.app_id)) + 1 : 1,
          created_by: parseInt(newData.created_by),
          created_date: new Date().toISOString(),
          modify_by: parseInt(newData.created_by),
          modify_date: new Date().toISOString(),
        };

        setApps([newEntry, ...apps]);
        setIsAdding(false);
        setNewData({ app_name: '', block: false, created_by: '' });
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
            <h2 className="text-2xl font-bold text-gray-800">Application Master Table</h2>
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
                  <FaPlus className="mr-2" /> Add New Application
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by App Name or Block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">App ID</th>
                  <th className="px-4 py-3">App Name</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3">Modify By</th>
                  <th className="px-4 py-3">Modify Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAdding && (
                  <tr>
                    <td className="px-4 py-3">New</td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.app_name}
                        onChange={(e) =>
                          setNewData({ ...newData, app_name: e.target.value })
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

                {filteredApps.map((app) => (
                  <tr key={app.app_id}>
                    <td className="px-4 py-3">{app.app_id}</td>
                    <td className="px-4 py-3">
                      {editId === app.app_id ? (
                        <input
                          value={editData.app_name}
                          onChange={(e) =>
                            handleEditChange('app_name', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        app.app_name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === app.app_id ? (
                        <input
                          type="checkbox"
                          checked={editData.block}
                          onChange={(e) =>
                            handleEditChange('block', e.target.checked)
                          }
                        />
                      ) : app.block ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3">{app.created_by}</td>
                    <td className="px-4 py-3">
                      {new Date(app.created_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{app.modify_by}</td>
                    <td className="px-4 py-3">
                      {new Date(app.modify_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 space-x-2 flex">
                      {editId === app.app_id ? (
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
                            onClick={() => startEditing(app)}
                            className="text-yellow-500 hover:text-yellow-700"
                          >
                            <FaEdit size={22} />
                          </button>
                          <button
                            onClick={() => confirmDelete(app.app_id)}
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
