import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

const baseURL = process.env.REACT_APP_API_BASE_URL;

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-100">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
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

export default function PlanMasterPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    PlanName: '',
    TotalUserAllow: '',
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
  const currentDateTime = '2025-08-05T23:43:00+05:30';

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${baseURL}/GetPlanList`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('API Response:', data);
        if (Array.isArray(data)) {
          const mappedPlans = data.map(plan => ({
            plan_id: plan.PlanId || 0,
            plan_name: plan.PlanName || '',
            total_user_allow: plan.TotalUserAllow || 0,
            block: plan.Block || false,
            created_by: plan.CreatedBy || 0,
            created_date: plan.CreatedDate || currentDateTime,
            modify_by: plan.ModifyBy || 0,
            modify_date: plan.ModifyDate || currentDateTime,
          }));
          setPlans(mappedPlans);
        } else {
          setError('Failed to fetch plan list: Invalid response format');
        }
      } catch (err) {
        setError('Error fetching plan list: ' + err.message);
      }
    };
    fetchPlans();
  }, []);

  const startEditing = (plan) => {
    setEditId(plan.plan_id);
    setEditData({
      PlanId: plan.plan_id,
      PlanName: plan.plan_name,
      TotalUserAllow: plan.total_user_allow,
      RequestBy: plan.modify_by,
      block: plan.block,
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
    formData.append('PlanId', editData.PlanId);
    formData.append('PlanName', editData.PlanName);
    formData.append('TotalUserAllow', editData.TotalUserAllow);
    formData.append('RequestBy', editData.RequestBy);
    formData.append('Block', editData.block);

    try {
      const response = await fetch(`${baseURL}/EditPlan`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.text();
      if (result === 'success') {
        setPlans(plans.map(plan =>
          plan.plan_id === editId
            ? {
                ...plan,
                plan_name: editData.PlanName || plan.plan_name,
                total_user_allow: parseInt(editData.TotalUserAllow) || plan.total_user_allow,
                modify_by: parseInt(editData.RequestBy) || plan.modify_by,
                modify_date: currentDateTime,
                block: editData.block || plan.block,
              }
            : plan
        ).sort((a, b) => a.plan_id - b.plan_id));
        setEditId(null);
        setEditData({});
        setConfirmation({ show: false, message: '', onConfirm: () => {} });
      } else if (result === 'alreadyexists') {
        setError('Plan already exists');
      } else {
        setError(result);
      }
    } catch (err) {
      setError('Error editing plan: ' + err.message);
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
      message: 'Are you sure you want to delete this plan?',
      onConfirm: async () => {
        try {
          const response = await fetch(`${baseURL}/DeletePlan/${id}`, {
            method: 'POST',
          });
          const result = await response.text();
          if (result === 'success') {
            setPlans(plans.filter(plan => plan.plan_id !== id));
            setConfirmation({ show: false, message: '', onConfirm: () => {} });
          } else {
            setError('Error deleting plan: ' + result);
          }
        } catch (err) {
          setError('Error deleting plan: ' + err.message);
        }
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({
      PlanName: '',
      TotalUserAllow: '',
      RequestBy: '',
      block: false,
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({
      PlanName: '',
      TotalUserAllow: '',
      RequestBy: '',
      block: false,
    });
  };

  const saveAdding = async () => {
    if (!newData.PlanName || !newData.TotalUserAllow || !newData.RequestBy) {
      setError('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    Object.keys(newData).forEach(key => {
      formData.append(key, newData[key]);
    });

    try {
      const response = await fetch(`${baseURL}/AddPlan`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.text();
      if (result === 'success') {
        const newPlan = {
          plan_id: plans.length ? Math.max(...plans.map(p => p.plan_id)) + 1 : 1,
          plan_name: newData.PlanName,
          total_user_allow: parseInt(newData.TotalUserAllow) || 0,
          block: newData.block || false,
          created_by: parseInt(newData.RequestBy) || 0,
          created_date: currentDateTime,
          modify_by: parseInt(newData.RequestBy) || 0,
          modify_date: currentDateTime,
        };
        setPlans([...plans, newPlan].sort((a, b) => a.plan_id - b.plan_id));
        cancelAdding();
        setConfirmation({ show: false, message: '', onConfirm: () => {} });
      } else if (result === 'alreadyexists') {
        setError('Plan already exists');
      } else {
        setError(result);
      }
    } catch (err) {
      setError('Error adding plan: ' + err.message);
    }
  };

  const confirmAdd = () => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new plan?',
      onConfirm: saveAdding,
    });
  };

  const toggleBlock = async (plan) => {
    const status = plan.block ? 0 : 1;
    try {
      const response = await fetch(
        `${baseURL}/BlockPlan/${plan.modify_by || 0}/${plan.plan_id}/${status}`,
        {
          method: 'POST',
        }
      );
      const result = await response.text();
      if (result === 'success') {
        setPlans(plans.map(p =>
          p.plan_id === plan.plan_id
            ? { ...p, block: status === 1, modify_date: currentDateTime }
            : p
        ));
      } else {
        setError('Error toggling block status: ' + result);
      }
    } catch (err) {
      setError('Error toggling block status: ' + err.message);
    }
  };

  const filteredPlans = plans.filter(plan => {
    const planName = plan.plan_name || '';
    return planName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Plan Master Table</h2>
            <Breadcrumbs currentPage="Plan Master" />
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
              placeholder="Search by Plan Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value || '')}
              className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 w-1/3"
            />
            {!isAdding && (
              <button
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center"
                onClick={startAdding}
              >
                <FaPlus className="mr-2" /> Add New Plan
              </button>
            )}
          </div>
          <div className="overflow-x-auto rounded-lg shadow border border-gray-400 dark:border-gray-600">
            <table className="min-w-full text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">Plan ID</th>
                  <th className="px-4 py-3">Plan Name</th>
                  <th className="px-4 py-3">Total Users Allowed</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900">
                {isAdding && (
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3">New</td>
                    <td className="px-4 py-3">
                      <input
                        value={newData.PlanName}
                        onChange={(e) =>
                          setNewData({ ...newData, PlanName: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={newData.TotalUserAllow}
                        onChange={(e) =>
                          setNewData({ ...newData, TotalUserAllow: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={newData.RequestBy}
                        onChange={(e) =>
                          setNewData({ ...newData, RequestBy: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={newData.block}
                        onChange={(e) =>
                          setNewData({ ...newData, block: e.target.checked })
                        }
                        disabled
                        className="dark:bg-gray-800 dark:border-gray-600"
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
                {filteredPlans.map(plan => (
                  <tr key={plan.plan_id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3">{plan.plan_id}</td>
                    <td className="px-4 py-3">
                      {editId === plan.plan_id ? (
                        <input
                          value={editData.PlanName}
                          onChange={(e) =>
                            handleEditChange('PlanName', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                      ) : (
                        plan.plan_name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === plan.plan_id ? (
                        <input
                          type="number"
                          value={editData.TotalUserAllow}
                          onChange={(e) =>
                            handleEditChange('TotalUserAllow', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                      ) : (
                        plan.total_user_allow
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === plan.plan_id ? (
                        <input
                          type="number"
                          value={editData.RequestBy}
                          onChange={(e) =>
                            handleEditChange('RequestBy', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                      ) : (
                        plan.created_by
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === plan.plan_id ? (
                        <input
                          type="checkbox"
                          checked={editData.block}
                          onChange={(e) =>
                            handleEditChange('block', e.target.checked)
                          }
                          className="dark:bg-gray-800 dark:border-gray-600"
                        />
                      ) : (
                        <button
                          onClick={() => toggleBlock(plan)}
                          className={`px-2 py-1 rounded ${
                            plan.block
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white`}
                        >
                          {plan.block ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 flex space-x-2">
                      {editId === plan.plan_id ? (
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
            {filteredPlans.length === 0 && !isAdding && (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                No plans found
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
