import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
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

function AlertModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[400px]">
        <p className="mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end">
          <button
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TileMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tiles, setTiles] = useState([
    {
      tile_id: 1,
      sku_name: 'Tile Alpha',
      sku_code: 'TA-001',
      cat_id: 101,
      cat_name: 'Category A',
      app_id: 201,
      app_name: 'App X',
      space_id: 301,
      space_name: 'Living Room',
      size_id: 401,
      size_name: '12x12',
      finish_id: 501,
      finish_name: 'Glossy',
      color_id: 601,
      color_name: 'White',
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
    sku_name: '',
    sku_code: '',
    cat_id: '',
    cat_name: '',
    app_id: '',
    app_name: '',
    space_id: '',
    space_name: '',
    size_id: '',
    size_name: '',
    finish_id: '',
    finish_name: '',
    color_id: '',
    color_name: '',
    block: false,
    created_by: '',
  });

  const [confirmation, setConfirmation] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  });

  const [alert, setAlert] = useState({
    show: false,
    message: '',
  });

  const requiredFields = [
    'sku_name',
    'sku_code',
    'cat_id',
    'cat_name',
    'app_id',
    'app_name',
    'space_id',
    'space_name',
    'size_id',
    'size_name',
    'finish_id',
    'finish_name',
    'color_id',
    'color_name',
    'created_by',
  ];

  const validateFields = (data) => {
    const emptyFields = requiredFields.filter(
      (field) => !data[field] || data[field].toString().trim() === ''
    );
    return emptyFields;
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const startEditing = (tile) => {
    setEditId(tile.tile_id);
    setEditData({ ...tile });
    setIsAdding(false);
  };

  const cancelEditing = () => {
    setEditId(null);
    setEditData({});
  };

  const confirmSave = () => {
    const emptyFields = validateFields(editData);
    if (emptyFields.length > 0) {
      setAlert({
        show: true,
        message: `Please fill in the following required fields: ${emptyFields.join(', ')}`,
      });
      return;
    }
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save changes?',
      onConfirm: () => {
        const updatedTiles = tiles.map((tile) =>
          tile.tile_id === editId
            ? { ...editData, modify_by: 999, modify_date: new Date().toISOString() }
            : tile
        );
        setTiles(updatedTiles);
        setEditId(null);
        setEditData({});
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (id) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this tile?',
      onConfirm: () => {
        setTiles(tiles.filter((tile) => tile.tile_id !== id));
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditId(null);
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({
      sku_name: '',
      sku_code: '',
      cat_id: '',
      cat_name: '',
      app_id: '',
      app_name: '',
      space_id: '',
      space_name: '',
      size_id: '',
      size_name: '',
      finish_id: '',
      finish_name: '',
      color_id: '',
      color_name: '',
      block: false,
      created_by: '',
    });
  };

  const saveAdding = () => {
    const emptyFields = validateFields(newData);
    if (emptyFields.length > 0) {
      setAlert({
        show: true,
        message: `Please fill in the following required fields: ${emptyFields.join(', ')}`,
      });
      return;
    }
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new tile?',
      onConfirm: () => {
        const newTile = {
          ...newData,
          tile_id: tiles.length ? Math.max(...tiles.map((t) => t.tile_id)) + 1 : 1,
          created_by: parseInt(newData.created_by) || 999,
          created_date: new Date().toISOString(),
          modify_by: parseInt(newData.created_by) || 999,
          modify_date: new Date().toISOString(),
        };
        setTiles([newTile, ...tiles]);
        cancelAdding();
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const filteredTiles = tiles.filter(
    (tile) =>
      tile.sku_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tile.sku_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Tile Master Table</h2>
            <div className="flex space-x-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </button>
              {!isAdding && !editId && (
                <button
                  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center"
                  onClick={startAdding}
                >
                  <FaPlus className="mr-2" /> Add New Tile
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by SKU Name or Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">Tile ID</th>
                  <th className="px-4 py-3">SKU Name</th>
                  <th className="px-4 py-3">SKU Code</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Application</th>
                  <th className="px-4 py-3">Space</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Finish</th>
                  <th className="px-4 py-3">Color</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAdding && (
                  <tr>
                    <td className="px-4 py-3">New</td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.sku_name}
                        onChange={(e) => setNewData({ ...newData, sku_name: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.sku_code}
                        onChange={(e) => setNewData({ ...newData, sku_code: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.cat_name}
                        onChange={(e) => setNewData({ ...newData, cat_name: e.target.value })}
                        className="border rounded px-2 py-1 mb-1 w-full"
                        placeholder="Name"
                      />
                      <input
                        value={newData.cat_id}
                        onChange={(e) => setNewData({ ...newData, cat_id: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="ID"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.app_name}
                        onChange={(e) => setNewData({ ...newData, app_name: e.target.value })}
                        className="border rounded px-2 py-1 mb-1 w-full"
                        placeholder="Name"
                      />
                      <input
                        value={newData.app_id}
                        onChange={(e) => setNewData({ ...newData, app_id: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="ID"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.space_name}
                        onChange={(e) => setNewData({ ...newData, space_name: e.target.value })}
                        className="border rounded px-2 py-1 mb-1 w-full"
                        placeholder="Name"
                      />
                      <input
                        value={newData.space_id}
                        onChange={(e) => setNewData({ ...newData, space_id: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="ID"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.size_name}
                        onChange={(e) => setNewData({ ...newData, size_name: e.target.value })}
                        className="border rounded px-2 py-1 mb-1 w-full"
                        placeholder="Name"
                      />
                      <input
                        value={newData.size_id}
                        onChange={(e) => setNewData({ ...newData, size_id: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="ID"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.finish_name}
                        onChange={(e) => setNewData({ ...newData, finish_name: e.target.value })}
                        className="border rounded px-2 py-1 mb-1 w-full"
                        placeholder="Name"
                      />
                      <input
                        value={newData.finish_id}
                        onChange={(e) => setNewData({ ...newData, finish_id: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="ID"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.color_name}
                        onChange={(e) => setNewData({ ...newData, color_name: e.target.value })}
                        className="border rounded px-2 py-1 mb-1 w-full"
                        placeholder="Name"
                      />
                      <input
                        value={newData.color_id}
                        onChange={(e) => setNewData({ ...newData, color_id: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                        placeholder="ID"
                      />
                    </td>
                    <td className="px-4 py-3">
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
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3 flex space-x-2">
                      <button onClick={saveAdding} className="text-green-600 hover:text-green-800">
                        <FaSave size={20} />
                      </button>
                      <button onClick={cancelAdding} className="text-gray-600 hover:text-gray-800">
                        <FaTimes size={20} />
                      </button>
                    </td>
                  </tr>
                )}

                {filteredTiles.map((tile) => (
                  <tr key={tile.tile_id}>
                    <td className="px-4 py-3">{tile.tile_id}</td>
                    <td className="px-4 py-3">
                      {editId === tile.tile_id ? (
                        <input
                          value={editData.sku_name}
                          onChange={(e) => handleEditChange('sku_name', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        tile.sku_name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === tile.tile_id ? (
                        <input
                          value={editData.sku_code}
                          onChange={(e) => handleEditChange('sku_code', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        tile.sku_code
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === tile.tile_id ? (
                        <>
                          <input
                            value={editData.cat_name}
                            onChange={(e) => handleEditChange('cat_name', e.target.value)}
                            className="border rounded px-2 py-1 mb-1 w-full"
                            placeholder="Name"
                          />
                          <input
                            value={editData.cat_id}
                            onChange={(e) => handleEditChange('cat_id', e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                            placeholder="ID"
                          />
                        </>
                      ) : (
                        `${tile.cat_id} - ${tile.cat_name}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === tile.tile_id ? (
                        <>
                          <input
                            value={editData.app_name}
                            onChange={(e) => handleEditChange('app_name', e.target.value)}
                            className="border rounded px-2 py-1 mb-1 w-full"
                            placeholder="Name"
                          />
                          <input
                            value={editData.app_id}
                            onChange={(e) => handleEditChange('app_id', e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                            placeholder="ID"
                          />
                        </>
                      ) : (
                        `${tile.app_id} - ${tile.app_name}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === tile.tile_id ? (
                        <>
                          <input
                            value={editData.space_name}
                            onChange={(e) => handleEditChange('space_name', e.target.value)}
                            className="border rounded px-2 py-1 mb-1 w-full"
                            placeholder="Name"
                          />
                          <input
                            value={editData.space_id}
                            onChange={(e) => handleEditChange('space_id', e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                            placeholder="ID"
                          />
                        </>
                      ) : (
                        `${tile.space_id} - ${tile.space_name}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === tile.tile_id ? (
                        <>
                          <input
                            value={editData.size_name}
                            onChange={(e) => handleEditChange('size_name', e.target.value)}
                            className="border rounded px-2 py-1 mb-1 w-full"
                            placeholder="Name"
                          />
                          <input
                            value={editData.size_id}
                            onChange={(e) => handleEditChange('size_id', e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                            placeholder="ID"
                          />
                        </>
                      ) : (
                        `${tile.size_id} - ${tile.size_name}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === tile.tile_id ? (
                        <>
                          <input
                            value={editData.finish_name}
                            onChange={(e) => handleEditChange('finish_name', e.target.value)}
                            className="border rounded px-2 py-1 mb-1 w-full"
                            placeholder="Name"
                          />
                          <input
                            value={editData.finish_id}
                            onChange={(e) => handleEditChange('finish_id', e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                            placeholder="ID"
                          />
                        </>
                      ) : (
                        `${tile.finish_id} - ${tile.finish_name}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === tile.tile_id ? (
                        <>
                          <input
                            value={editData.color_name}
                            onChange={(e) => handleEditChange('color_name', e.target.value)}
                            className="border rounded px-2 py-1 mb-1 w-full"
                            placeholder="Name"
                          />
                          <input
                            value={editData.color_id}
                            onChange={(e) => handleEditChange('color_id', e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                            placeholder="ID"
                          />
                        </>
                      ) : (
                        `${tile.color_id} - ${tile.color_name}`
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === tile.tile_id ? (
                        <input
                          type="checkbox"
                          checked={editData.block}
                          onChange={(e) => handleEditChange('block', e.target.checked)}
                        />
                      ) : (
                        tile.block ? 'Yes' : 'No'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === tile.tile_id ? (
                        <input
                          type="number"
                          value={editData.created_by}
                          onChange={(e) => handleEditChange('created_by', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        tile.created_by
                      )}
                    </td>
                    <td className="px-4 py-3 flex space-x-2">
                      {editId === tile.tile_id ? (
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
                            onClick={() => startEditing(tile)}
                            className="text-yellow-500 hover:text-yellow-700"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={() => confirmDelete(tile.tile_id)}
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

      {alert.show && (
        <AlertModal
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
    </div>
  );
}