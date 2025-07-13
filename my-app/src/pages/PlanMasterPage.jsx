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

export default function PlanMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([
    {
      plan_id: 1,
      plan_name: 'Basic',
      total_user_allow: 5,
      block: false,
      created_by: 101,
      created_date: '2025-07-07T12:34:56',
      modify_by: 101,
      modify_date: '2025-07-07T12:34:56',
    },
  ]);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: () => {} });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    plan_name: '',
    total_user_allow: '',
    block: false,
    created_by: '',
  });

  const filteredPlans = plans.filter((plan) =>
    plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEditing = (plan) => {
    setEditId(plan.plan_id);
    setEditData({ ...plan });
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
        const updated = plans
          .map((plan) =>
            plan.plan_id === editId
              ? { ...editData, modify_by: 999, modify_date: new Date().toISOString() }
              : plan
          )
          .sort((a, b) => a.plan_id - b.plan_id);

        setPlans(updated);
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
        setPlans(plans.filter((plan) => plan.plan_id !== id));
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({
      plan_name: '',
      total_user_allow: '',
      block: false,
      created_by: '',
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
  };

  const saveAdding = () => {
    if (!newData.plan_name || !newData.created_by || !newData.total_user_allow) {
      alert('Please fill all required fields');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new plan?',
      onConfirm: () => {
        const newEntry = {
          ...newData,
          plan_id: plans.length ? Math.max(...plans.map((p) => p.plan_id)) + 1 : 1,
          total_user_allow: parseInt(newData.total_user_allow),
          created_by: parseInt(newData.created_by),
          created_date: new Date().toISOString(),
          modify_by: parseInt(newData.created_by),
          modify_date: new Date().toISOString(),
        };

        const updated = [...plans, newEntry].sort((a, b) => a.plan_id - b.plan_id);
        setPlans(updated);
        setIsAdding(false);
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
            <h2 className="text-2xl font-bold text-gray-800">Plan Master Table</h2>
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
                  <FaPlus className="mr-2" /> Add New Plan
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by Plan Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">Plan ID</th>
                  <th className="px-4 py-3">Plan Name</th>
                  <th className="px-4 py-3">Total Users Allowed</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAdding && (
                  <tr>
                    <td className="px-4 py-3">New</td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.plan_name}
                        onChange={(e) => setNewData({ ...newData, plan_name: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={newData.total_user_allow}
                        onChange={(e) => setNewData({ ...newData, total_user_allow: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={newData.block}
                        onChange={(e) => setNewData({ ...newData, block: e.target.checked })}
                      />
                    </td>
                    <td className="px-4 py-3 space-x-2 flex">
                      <button onClick={saveAdding} className="text-green-600 hover:text-green-800">
                        <FaSave size={22} />
                      </button>
                      <button onClick={cancelAdding} className="text-gray-600 hover:text-gray-800">
                        <FaTimes size={22} />
                      </button>
                    </td>
                  </tr>
                )}

                {filteredPlans.map((plan) => (
                  <tr key={plan.plan_id}>
                    <td className="px-4 py-3">{plan.plan_id}</td>
                    <td className="px-4 py-3">
                      {editId === plan.plan_id ? (
                        <input
                          value={editData.plan_name}
                          onChange={(e) => handleEditChange('plan_name', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        plan.plan_name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === plan.plan_id ? (
                        <input
                          type="number"
                          value={editData.total_user_allow}
                          onChange={(e) => handleEditChange('total_user_allow', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        plan.total_user_allow
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === plan.plan_id ? (
                        <input
                          type="checkbox"
                          checked={editData.block}
                          onChange={(e) => handleEditChange('block', e.target.checked)}
                        />
                      ) : plan.block ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3 space-x-2 flex">
                      {editId === plan.plan_id ? (
                        <>
                          <button onClick={confirmSave} className="text-green-600 hover:text-green-800">
                            <FaSave size={22} />
                          </button>
                          <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800">
                            <FaTimes size={22} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(plan)}
                            className="text-yellow-500 hover:text-yellow-700"
                          >
                            <FaEdit size={22} />
                          </button>
                          <button
                            onClick={() => confirmDelete(plan.plan_id)}
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
