import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSortUp, FaSortDown } from 'react-icons/fa';
import axios from 'axios';
import Breadcrumb from '../components/Breadcrumb';


const baseURL = process.env.REACT_APP_API_BASE_URL;
const userid = localStorage.getItem('userid');

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-700 p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-green-700 dark:bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 dark:hover:bg-green-700"
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
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({
    show: false,
    message: '',
    onConfirm: () => {},
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    plan_name: '',
    total_user_allow: '',
  });
  const [recentlyDeleted, setRecentlyDeleted] = useState(null);
 

  useEffect(() => {
    setFadeIn(true);
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${baseURL}/GetPlanList`);
      setPlans(response.data);
    } catch (error) {
      alert('Error fetching plans');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(
    (plan) =>
      plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.block ? 'yes' : 'no').includes(searchTerm.toLowerCase())
  );

  const sorted = React.useMemo(() => {
    let sortableItems = [...filteredPlans];
    if (sortConfig.key !== '') {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredPlans, sortConfig]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPlans = sorted.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };

  const startEditing = (plan) => {
    setEditId(plan.plan_id);
    setEditData({
      ...plan,
      block: Boolean(plan.block),
    });
  };

  const cancelEditing = () => {
    setEditId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const confirmSave = () => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save changes?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('PlanID', editData.plan_id);
          formData.append('PlanName', editData.plan_name);
          formData.append('TotalUsers', editData.total_user_allow);
          formData.append('RequestBy', userid ?? '');

          const res = await axios.post(`${baseURL}/EditPlan`, formData);

          if (res.data === 'alreadyexists') {
            alert('Plan already exists!');
          } else if (res.data === 'success') {
            fetchPlans();
            cancelEditing();
          } else {
            alert(`Failed to update plan: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
          alert('Error updating plan');
        }

        setConfirmation({ ...confirmation, show: false });
      }
    });
  };

  const confirmDelete = (planId) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this plan?',
      onConfirm: async () => {
        try {
          const status = 1; // blocked
          await axios.get(`${baseURL}/BlockPlan/${userid}/${planId}/${status}`);

          const deletedPlan = plans.find(p => p.plan_id === planId);
          setPlans(prev => prev.filter(p => p.plan_id !== planId));
          setRecentlyDeleted(deletedPlan);

          setTimeout(() => {
            setRecentlyDeleted(null);
          }, 7000);
        } catch (error) {
          alert('Failed to delete plan');
        } finally {
          setConfirmation({ ...confirmation, show: false });
        }
      }
    });
  };

  const toggleBlock = async (plan) => {
    try {
      const newBlockStatus = plan.block ? 0 : 1;
      await axios.get(`${baseURL}/BlockPlan/${userid}/${plan.plan_id}/${newBlockStatus}`);
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert('Error toggling block status');
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({
      plan_name: '',
      total_user_allow: '',
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ plan_name: '', total_user_allow: '' });
  };

  const saveAdding = () => {
    if (!newData.plan_name || !newData.total_user_allow) {
      alert('Please fill in Plan Name and Total Users');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new plan?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('PlanName', newData.plan_name);
          formData.append('TotalUsers', newData.total_user_allow);
          formData.append('RequestBy', userid ?? '');

          const res = await axios.post(`${baseURL}/AddPlan`, formData);

          if (res.data === 'alreadyexists') {
            alert('Plan already exists!');
          } else if (res.data === 'success') {
            fetchPlans();
          } else {
            alert(`Failed to add plan: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
          alert('Error adding plan');
        }

        setIsAdding(false);
        setNewData({ plan_name: '', total_user_allow: '' });
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className={`flex flex-col flex-1 p-6 overflow-auto transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">Plans</h2>
            <Breadcrumb />
          </div>

          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search Plan Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {!isAdding && (
              <button
                onClick={startAdding}
                className="bg-green-700 dark:bg-green-600 text-white px-4 py-1 rounded hover:bg-green-800 dark:hover:bg-green-700 flex items-center"
              >
                <FaPlus className="mr-2" /> Add New Plan
              </button>
            )}
          </div>

          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-green-100 dark:bg-green-900 text-gray-800 dark:text-green-100">
                <tr>
                  <th className="px-4 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort('plan_name')}>
                    <div className="flex items-center">Plan Name {getSortIcon('plan_name')}</div>
                  </th>
                  <th className="px-4 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort('total_user_allow')}>
                    <div className="flex items-center">Total Users Allowed {getSortIcon('total_user_allow')}</div>
                  </th>
                  <th className="px-4 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort('updated_by')}>
                    <div className="flex items-center">Updated By {getSortIcon('updated_by')}</div>
                  </th>
                  <th className="px-4 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort('updated_date')}>
                    <div className="flex items-center">Updated Date {getSortIcon('updated_date')}</div>
                  </th>
                  <th className="px-4 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort('block')}>
                    <div className="flex items-center">Block {getSortIcon('block')}</div>
                  </th>
                  <th className="px-4 py-2 font-semibold text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-200">
                {isAdding && (
                  <tr className="hover:bg-green-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2">
                      <input
                        value={newData.plan_name}
                        onChange={(e) => setNewData({ ...newData, plan_name: e.target.value })}
                        className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={newData.total_user_allow}
                        onChange={(e) => setNewData({ ...newData, total_user_allow: e.target.value })}
                        className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-gray-400 dark:text-gray-500 italic">--</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-gray-400 dark:text-gray-500 italic">--</span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs bg-green-600`}
                      >
                        No
                      </span>
                    </td>
                    <td className="px-4 py-2 space-x-2 flex">
                      <button onClick={saveAdding} className="text-green-600 hover:text-green-800"><FaSave size={18} /></button>
                      <button onClick={cancelAdding} className="text-gray-600 hover:text-gray-800"><FaTimes size={18} /></button>
                    </td>
                  </tr>
                )}

                {currentPlans.length === 0 ? (
                  <tr className="border-b dark:border-gray-700">
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 italic">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  currentPlans.map((plan) => (
                    <tr key={plan.plan_id} className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                      <td className="px-4 py-2">
                        {editId === plan.plan_id ? (
                          <input
                            value={editData.plan_name}
                            onChange={(e) => handleEditChange('plan_name', e.target.value)}
                            className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          />
                        ) : (
                          plan.plan_name
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editId === plan.plan_id ? (
                          <input
                            type="number"
                            value={editData.total_user_allow}
                            onChange={(e) => handleEditChange('total_user_allow', e.target.value)}
                            className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                          />
                        ) : (
                          plan.total_user_allow
                        )}
                      </td>
                      
                      <td className="px-4 py-2">{plan.updated_by}</td>
                      <td className="px-4 py-2">{new Date(plan.updated_date).toLocaleDateString()}</td>
                      
                      <td className="px-4 py-2">
                        <span
                          onClick={() => toggleBlock(plan)}
                          className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${
                            plan.block ? 'bg-red-600' : 'bg-green-600'
                          }`}
                        >
                          {plan.block ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-2 space-x-2 flex">
                        {editId === plan.plan_id ? (
                          <>
                            <button onClick={confirmSave} className="text-green-600 hover:text-green-800"><FaSave size={18} /></button>
                            <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800"><FaTimes size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditing(plan)} className="text-yellow-500 hover:text-yellow-700"><FaEdit size={18} /></button>
                            <button onClick={() => confirmDelete(plan.plan_id)} className="text-red-500 hover:text-red-700"><FaTrash size={18} /></button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
            <span>
              Showing {filteredPlans.length === 0 ? 0 : indexOfFirst + 1} to {Math.min(indexOfLast, filteredPlans.length)} of {filteredPlans.length} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700 dark:text-gray-400"
              >
                Previous
              </button>
              {[...Array(totalPages).keys()].map(num => (
                <button
                  key={num + 1}
                  onClick={() => setCurrentPage(num + 1)}
                  className={`px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700 ${
                    currentPage === num + 1 ? 'bg-green-600 text-white' : 'dark:text-gray-200'
                  }`}
                >
                  {num + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700 dark:text-gray-400"
              >
                Next
              </button>
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
    </div>
  );
}