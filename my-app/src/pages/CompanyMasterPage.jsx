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

export default function CompanyMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([
    {
      comp_id: 1,
      plan_id: 101,
      comp_name: 'ABC Corp',
      comp_address: '123 Main St',
      comp_address1: 'Suite 200',
      pin_code: 400001,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      block: false,
      created_by: 101,
      created_date: '2025-07-07T12:34:56',
      modify_by: 101,
      modify_date: '2025-07-07T12:34:56',
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
    plan_id: '',
    comp_name: '',
    comp_address: '',
    comp_address1: '',
    pin_code: '',
    city: '',
    state: '',
    country: '',
    block: false,
    created_by: '',
  });

  const filteredCompanies = companies.filter((comp) =>
    comp.comp_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEditing = (comp) => {
    setEditId(comp.comp_id);
    setEditData({ ...comp });
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
        const updated = companies
          .map((comp) =>
            comp.comp_id === editId
              ? {
                  ...editData,
                  modify_by: 999,
                  modify_date: new Date().toISOString(),
                }
              : comp
          )
          .sort((a, b) => a.comp_id - b.comp_id);

        setCompanies(updated);
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
        setCompanies(companies.filter((comp) => comp.comp_id !== id));
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({
      plan_id: '',
      comp_name: '',
      comp_address: '',
      comp_address1: '',
      pin_code: '',
      city: '',
      state: '',
      country: '',
      block: false,
      created_by: '',
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
  };

  const saveAdding = () => {
    if (!newData.comp_name || !newData.created_by || !newData.plan_id) {
      alert('Please fill all required fields');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new company?',
      onConfirm: () => {
        const newEntry = {
          ...newData,
          comp_id: companies.length
            ? Math.max(...companies.map((c) => c.comp_id)) + 1
            : 1,
          plan_id: parseInt(newData.plan_id),
          pin_code: parseInt(newData.pin_code) || '',
          created_by: parseInt(newData.created_by),
          created_date: new Date().toISOString(),
          modify_by: parseInt(newData.created_by),
          modify_date: new Date().toISOString(),
        };

        const updated = [...companies, newEntry].sort(
          (a, b) => a.comp_id - b.comp_id
        );
        setCompanies(updated);
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
            <h2 className="text-2xl font-bold text-gray-800">
              Company Master Table
            </h2>
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
                  <FaPlus className="mr-2" /> Add New Company
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by Company Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">Comp ID</th>
                  <th className="px-4 py-3">Plan ID</th>
                  <th className="px-4 py-3">Company Name</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Address 2</th>
                  <th className="px-4 py-3">Pin Code</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Block</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAdding && (
                  <tr>
                    {[
                      'plan_id',
                      'comp_name',
                      'comp_address',
                      'comp_address1',
                      'pin_code',
                      'city',
                      'state',
                      'country',
                    ].map((field) => (
                      <td key={field} className="px-4 py-3">
                        <input
                          value={newData[field]}
                          onChange={(e) =>
                            setNewData({ ...newData, [field]: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                    ))}
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

                {filteredCompanies.map((comp) => (
                  <tr key={comp.comp_id}>
                    <td className="px-4 py-3">{comp.comp_id}</td>
                    {[
                      'plan_id',
                      'comp_name',
                      'comp_address',
                      'comp_address1',
                      'pin_code',
                      'city',
                      'state',
                      'country',
                    ].map((field) => (
                      <td key={field} className="px-4 py-3">
                        {editId === comp.comp_id ? (
                          <input
                            value={editData[field]}
                            onChange={(e) =>
                              handleEditChange(field, e.target.value)
                            }
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          comp[field]
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">{comp.created_by}</td>
                    <td className="px-4 py-3">
                      {editId === comp.comp_id ? (
                        <input
                          type="checkbox"
                          checked={editData.block}
                          onChange={(e) =>
                            handleEditChange('block', e.target.checked)
                          }
                        />
                      ) : comp.block ? (
                        'Yes'
                      ) : (
                        'No'
                      )}
                    </td>
                    <td className="px-4 py-3 space-x-2 flex">
                      {editId === comp.comp_id ? (
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
                            onClick={() => startEditing(comp)}
                            className="text-yellow-500 hover:text-yellow-700"
                          >
                            <FaEdit size={22} />
                          </button>
                          <button
                            onClick={() => confirmDelete(comp.comp_id)}
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
