import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
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

export default function SpaceMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [spaces, setSpaces] = useState([
    {
      space_id: 1,
      space_name: 'Living Room',
      block: false,
      created_by: 101,
      created_date: '2025-07-07T12:34:56',
      modify_by: 101,
      modify_date: '2025-07-07T12:34:56',
    },
    {
      space_id: 2,
      space_name: 'Bedroom',
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
    space_name: '',
    block: false,
    created_by: '',
  });

  const filteredSpaces = spaces.filter(
    (space) =>
      space.space_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (space.block ? 'yes' : 'no').includes(searchTerm.toLowerCase())
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
      onConfirm: () => {
        const updated = spaces
          .map((space) =>
            space.space_id === editId
              ? { ...editData, modify_by: 999, modify_date: new Date().toISOString() }
              : space
          )
          .sort((a, b) => a.space_id - b.space_id);

        setSpaces(updated);
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
        setSpaces(spaces.filter((space) => space.space_id !== id));
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({ space_name: '', block: false, created_by: '' });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ space_name: '', block: false, created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.space_name || !newData.created_by) {
      alert('Please fill all required fields');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new space?',
      onConfirm: () => {
        const newEntry = {
          ...newData,
          space_id: spaces.length ? Math.max(...spaces.map((s) => s.space_id)) + 1 : 1,
          created_by: parseInt(newData.created_by),
          created_date: new Date().toISOString(),
          modify_by: parseInt(newData.created_by),
          modify_date: new Date().toISOString(),
        };

        const updated = [...spaces, newEntry].sort((a, b) => a.space_id - b.space_id);
        setSpaces(updated);

        setIsAdding(false);
        setNewData({ space_name: '', block: false, created_by: '' });
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Space Master Table</h2>
            <div className="flex space-x-2">
              {!isAdding && (
                <button
                  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center"
                  onClick={startAdding}
                >
                  <FaPlus className="mr-2" /> Add New Space
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by Space Name or Block..."
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
                  <th className="px-4 py-3 text-left">Space ID</th>
                  <th className="px-4 py-3 text-left">Space Name</th>
                  <th className="px-4 py-3 text-left">Block</th>
                  <th className="px-4 py-3 text-left">Created By</th>
                  <th className="px-4 py-3 text-left">Created Date</th>
                  <th className="px-4 py-3 text-left">Modified By</th>
                  <th className="px-4 py-3 text-left">Modified Date</th>
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
                        value={newData.space_name}
                        onChange={(e) => setNewData({ ...newData, space_name: e.target.value })}
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-center"> {/* Centered checkbox */}
                      <input
                        type="checkbox"
                        checked={newData.block}
                        onChange={(e) => setNewData({ ...newData, block: e.target.checked })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={newData.created_by}
                        onChange={(e) => setNewData({ ...newData, created_by: e.target.value })}
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                    </td>
                    {/* Added empty cells to fill the row for "New" entry */}
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 flex space-x-2 items-center justify-center"> {/* Centered actions */}
                      <button onClick={saveAdding} className="text-green-600 hover:text-green-800">
                        <FaSave size={20} /> {/* Adjusted size for consistency */}
                      </button>
                      <button onClick={cancelAdding} className="text-gray-600 hover:text-gray-800">
                        <FaTimes size={20} /> {/* Adjusted size for consistency */}
                      </button>
                    </td>
                  </tr>
                )}

                {filteredSpaces.map((space, index) => (
                  // Conditional border-b: apply only if it's not the last row
                  <tr
                    key={space.space_id}
                    className={`${
                      index === filteredSpaces.length - 1 && !isAdding
                        ? '' // No border for the last row if not adding
                        : 'border-b border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-white">{space.space_id}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white">
                      {editId === space.space_id ? (
                        <input
                          value={editData.space_name}
                          onChange={(e) => handleEditChange('space_name', e.target.value)}
                          className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        />
                      ) : (
                        space.space_name
                      )}
                    </td>
                    <td className="px-4 py-3 text-center"> {/* Centered checkbox */}
                      {editId === space.space_id ? (
                        <input
                          type="checkbox"
                          checked={editData.block}
                          onChange={(e) => handleEditChange('block', e.target.checked)}
                        />
                      ) : space.block ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white">{space.created_by}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white">
                      {new Date(space.created_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white">{space.modify_by}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white">
                      {new Date(space.modify_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 flex space-x-2 items-center justify-center"> {/* Centered actions */}
                      {editId === space.space_id ? (
                        <>
                          <button
                            onClick={confirmSave}
                            className="text-green-600 hover:text-green-800"
                          >
                            <FaSave size={20} /> {/* Adjusted size for consistency */}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <FaTimes size={20} /> {/* Adjusted size for consistency */}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(space)}
                            className="text-yellow-500 hover:text-yellow-700"
                          >
                            <FaEdit size={20} /> {/* Adjusted size for consistency */}
                          </button>
                          <button
                            onClick={() => confirmDelete(space.space_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash size={20} /> {/* Adjusted size for consistency */}
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