import React, { useEffect, useState } from 'react';
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

export default function FinishMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [finishes, setFinishes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: () => {} });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ finish_name: '', created_by: '' });

  const userId = localStorage.getItem('userid');

  useEffect(() => {
    fetchFinishes();
  }, []);

  const fetchFinishes = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetFinishList`);
      setFinishes(res.data);
    } catch (err) {
      alert('Failed to load finishes');
    }
  };

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
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('FinishId', editData.finish_id);
          formData.append('FinishName', editData.finish_name);
          formData.append('RequestBy', userId);

          const res = await axios.post(`${baseURL}/EditFinish`, formData);
          if (res.data === 'success') {
            fetchFinishes();
          } else if (res.data === 'alreadyexists') {
            alert('Finish already exists!');
          } else {
            alert('Error: ' + res.data);
          }
        } catch (err) {
          alert('Error saving changes');
        }
        setEditId(null);
        setEditData({});
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmBlockToggle = (finish) => {
    const status = finish.block ? 0 : 1;
    setConfirmation({
      show: true,
      message: `Are you sure you want to ${status === 1 ? 'block' : 'unblock'} this finish?`,
      onConfirm: async () => {
        try {
          await axios.get(`${baseURL}/BlockFinish/${userId}/${finish.finish_id}/${status}`);
          fetchFinishes();
        } catch (err) {
          alert('Failed to update block status');
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({ finish_name: '', created_by: userId });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ finish_name: '', created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.finish_name || !newData.created_by) {
      alert('Please fill all required fields');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new finish?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('FinishName', newData.finish_name);
          formData.append('RequestBy', newData.created_by);

          const res = await axios.post(`${baseURL}/AddFinish`, formData);
          if (res.data === 'alreadyexists') {
            alert('Finish already exists!');
            return;
          } else if (res.data === 'success') {
            fetchFinishes();
            cancelAdding();
          } else {
            alert(`Failed to add finish: ${res.data}`);
          }
        } catch (err) {
          alert('Failed to add finish');
        }
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
            <h2 className="text-2xl font-bold text-gray-800">Finish</h2>
            <Breadcrumb />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search by Finish Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {!isAdding && (
              <button
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center"
                onClick={startAdding}
              >
                <FaPlus className="mr-2" /> Add New Finish
              </button>
            )}
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Finish Name</th>
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
                        value={newData.finish_name}
                        onChange={(e) => setNewData({ ...newData, finish_name: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3">No</td>
                    <td className="px-4 py-3">{userId}</td>
                    <td className="px-4 py-3">-</td>
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

                {filteredFinishes.map((finish) => (
                  <tr key={finish.finish_id}>
                    <td className="px-4 py-3">{finish.finish_id}</td>
                    <td className="px-4 py-3">
                      {editId === finish.finish_id ? (
                        <input
                          value={editData.finish_name}
                          onChange={(e) => handleEditChange('finish_name', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        finish.finish_name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={finish.block} onChange={() => confirmBlockToggle(finish)} />
                    </td>
                    <td className="px-4 py-3">{finish.updated_by}</td>
                    <td className="px-4 py-3">{new Date(finish.updated_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 flex space-x-2">
                      {editId === finish.finish_id ? (
                        <>
                          <button onClick={confirmSave} className="text-green-600 hover:text-green-800">
                            <FaSave size={20} />
                          </button>
                          <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800">
                            <FaTimes size={20} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(finish)} className="text-yellow-500 hover:text-yellow-700">
                            <FaEdit size={20} />
                          </button>
                          <button onClick={() => confirmBlockToggle(finish)} className="text-red-500 hover:text-red-700">
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
