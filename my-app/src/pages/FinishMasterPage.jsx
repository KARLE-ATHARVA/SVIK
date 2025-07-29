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

export default function FinishMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [finishes, setFinishes] = useState([
    {
      finish_id: 1,
      finish_name: 'Glossy',
      block: false,
      created_by: 101,
      created_date: '2025-07-07T12:34:56',
      modify_by: 101,
      modify_date: '2025-07-07T12:34:56',
    },
    {
      finish_id: 2,
      finish_name: 'Matte',
      block: true,
      created_by: 102,
      created_date: '2025-07-06T09:30:00',
      modify_by: 103,
      modify_date: '2025-07-07T14:20:00',
    },
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
    finish_name: '',
    block: false,
    created_by: '',
  });

  const filteredFinishes = finishes.filter(
    (finish) =>
      finish.finish_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (finish.block ? 'yes' : 'no').includes(searchTerm.toLowerCase())
  );

  const startEditing = (finish) => {
    setEditId(finish.finish_id);
    setEditData({ ...finish });
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
        const updated = finishes
          .map((finish) =>
            finish.finish_id === editId
              ? { ...editData, modify_by: 999, modify_date: new Date().toISOString() }
              : finish
          )
          .sort((a, b) => a.finish_id - b.finish_id);

        setFinishes(updated);
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
        setFinishes(finishes.filter((finish) => finish.finish_id !== id));
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({ finish_name: '', block: false, created_by: '' });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ finish_name: '', block: false, created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.finish_name || !newData.created_by) {
      alert('Please fill all required fields');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new finish?',
      onConfirm: () => {
        const newEntry = {
          ...newData,
          finish_id: finishes.length ? Math.max(...finishes.map((f) => f.finish_id)) + 1 : 1,
          created_by: parseInt(newData.created_by),
          created_date: new Date().toISOString(),
          modify_by: parseInt(newData.created_by),
          modify_date: new Date().toISOString(),
        };

        const updated = [...finishes, newEntry].sort((a, b) => a.finish_id - b.finish_id);
        setFinishes(updated);

        setIsAdding(false);
        setNewData({ finish_name: '', block: false, created_by: '' });
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
            <h2 className="text-2xl font-bold text-gray-800">Finish Master Table</h2>
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
                  <FaPlus className="mr-2" /> Add New Finish
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by Finish Name or Block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">Finish ID</th>
                  <th className="px-4 py-3">Finish Name</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3">Modified By</th>
                  <th className="px-4 py-3">Modified Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAdding && (
                  <tr>
                    <td className="px-4 py-3">New</td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.finish_name}
                        onChange={(e) =>
                          setNewData({ ...newData, finish_name: e.target.value })
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

                {filteredFinishes.map((finish) => (
                  <tr key={finish.finish_id}>
                    <td className="px-4 py-3">{finish.finish_id}</td>
                    <td className="px-4 py-3">
                      {editId === finish.finish_id ? (
                        <input
                          value={editData.finish_name}
                          onChange={(e) =>
                            handleEditChange('finish_name', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        finish.finish_name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === finish.finish_id ? (
                        <input
                          type="checkbox"
                          checked={editData.block}
                          onChange={(e) =>
                            handleEditChange('block', e.target.checked)
                          }
                        />
                      ) : finish.block ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3">{finish.created_by}</td>
                    <td className="px-4 py-3">
                      {new Date(finish.created_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{finish.modify_by}</td>
                    <td className="px-4 py-3">
                      {new Date(finish.modify_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 space-x-2 flex">
                      {editId === finish.finish_id ? (
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
                            onClick={() => startEditing(finish)}
                            className="text-yellow-500 hover:text-yellow-700"
                          >
                            <FaEdit size={22} />
                          </button>
                          <button
                            onClick={() => confirmDelete(finish.finish_id)}
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
