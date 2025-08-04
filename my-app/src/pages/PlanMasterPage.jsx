import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL;
const userid = localStorage.getItem('userid');



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

export default function PlanMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

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
    block: false,
  
  });

  useEffect(() => {
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

  const filteredPlans = plans.filter((plan) =>
    plan.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        const originalPlan = plans.find(p => p.plan_id === editData.plan_id);
        const blockChanged = originalPlan.block !== editData.block;

        
        const res = await axios.post(`${baseURL}/EditPlan`, formData);

        if (res.data === 'alreadyexists') {
          alert('Plan already exists!');
        } else if (res.data === 'success') {
          
          if (blockChanged) {
            const blockStatus = editData.block ? 1 : 0;
            await axios.get(`${baseURL}/BlockPlan/${userid}/${editData.plan_id}/${blockStatus}`);
          }

          fetchPlans(); 
        } else {
          alert(`Failed to update plan: ${res.data}`);
        }
      } catch (err) {
        console.error(err);
        alert('Error updating plan');
      }

      setEditId(null);
      setEditData({});
      setConfirmation({ ...confirmation, show: false });
    },
  });
};



  const confirmDelete = (id) => {
  setConfirmation({
    show: true,
    message: 'Are you sure you want to block this plan?',
    onConfirm: async () => {
      try {
        
        const status = 1; 

        await axios.get(`${baseURL}/BlockPlan/${userid}/${id}/${status}`);

        alert('Plan blocked successfully');
        fetchPlans();
      } catch (error) {
        alert('Failed to block plan');
      } finally {
        setConfirmation({ ...confirmation, show: false });
      }
    },
  });
};


  const startAdding = () => {
    setIsAdding(true);
    setNewData({
      plan_name: '',
      total_user_allow: '',
      // block: Boolean(plan_id.block), 
      updated_by:''
      
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Plan Master Table
            </h2>
            <div className="flex space-x-2">
              {/* <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </button> */}
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
                  {/* <th className="px-4 py-3">Plan ID</th> */}
                  <th className="px-4 py-3">Plan Name</th>
                  <th className="px-4 py-3">Total Users Allowed</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Updated By</th>
                  <th className="px-4 py-3">Updated Date</th>

                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAdding && (
                  <tr>
                    {/* <td className="px-4 py-3">New</td> */}
                    <td className="px-4 py-3">
                      <input
                        value={newData.plan_name}
                        onChange={(e) =>
                          setNewData({
                            ...newData,
                            plan_name: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={newData.total_user_allow}
                        onChange={(e) =>
                          setNewData({
                            ...newData,
                            total_user_allow: e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3">
      {/* Don't show checkbox when adding */}
      <span className="text-gray-400 italic">--</span>
    </td>
                    {/* <td className="px-4 py-3">
                      <input
                        type="number"
                        value={newData.updated_by}
                        onChange={(e) =>
                          setNewData({
                            ...newData,
                            updated_by: e.target.value,
                          })
                        }
                      />  */}
                    
                    {/* <td className="px-4 py-3">
                      <input
                      type="datetime-local"
                      value={newData.updated_date}
                      onChange={(e) =>
                        setNewData({
                          ...newData,
                          updated_date: e.target.value,
                        })
                      }
                    />
                    </td> */}
                        {/* className="border rounded px-2 py-1 w-full" */}
                      
                    {/* </td> */}
                    
                    
                    <td className="px-4 py-3 space-x-2 flex">
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

                {filteredPlans.map((plan) => (
                  <tr key={plan.plan_id}>
                    {/* <td className="px-4 py-3">{plan.plan_id}</td> */}
                    <td className="px-4 py-3">
                      {editId === plan.plan_id ? (
                        <input
                          value={editData.plan_name}
                          onChange={(e) =>
                            handleEditChange('plan_name', e.target.value)
                          }
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
                          onChange={(e) =>
                            handleEditChange('total_user_allow', e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        plan.total_user_allow
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
  {editId === plan.plan_id ? (
    <input
      type="checkbox"
      checked={editData.block}
      onChange={(e) => handleEditChange('block', e.target.checked)}
      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
    />
  ) : (
    <input
      type="checkbox"
      checked={plan.block}
      // disabled
      // readOnly
      className="w-4 h-4 text-gray-400 cursor-not-allowed"
    />
  )}
</td>

                    <td className="px-4 py-3">{plan.updated_by}</td>
                    
     <td className="px-4 py-3">
  {new Date(plan.updated_date).toLocaleString()}
</td>


                    <td className="px-4 py-3 space-x-2 flex">
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
                            className="text-gray-600 hover:text-gray-800"
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
