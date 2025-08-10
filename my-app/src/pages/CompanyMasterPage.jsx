import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [companies, setCompanies] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    PlanId: '',
    CompName: '',
    Address: '',
    Address1: '',
    PinCode: '',
    City: '',
    State: '',
    Country: '',
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
  const currentDateTime = '2025-08-05T23:32:00+05:30';

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${baseURL}/GetCompanyList`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('API Response:', data);
        if (Array.isArray(data)) {
          const mappedCompanies = data.map(comp => ({
            comp_id: comp.CompId || 0,
            plan_id: comp.PlanId || 0,
            comp_name: comp.CompName || '',
            comp_address: comp.Address || '',
            comp_address1: comp.Address1 || '',
            pin_code: comp.PinCode || 0,
            city: comp.City || '',
            state: comp.State || '',
            country: comp.Country || '',
            block: comp.Block || false,
            created_by: comp.CreatedBy || 0,
            created_date: comp.CreatedDate || currentDateTime,
            modify_by: comp.ModifyBy || 0,
            modify_date: comp.ModifyDate || currentDateTime,
          }));
          setCompanies(mappedCompanies);
        } else {
          setError('Failed to fetch company list: Invalid response format');
        }
      } catch (err) {
        setError('Error fetching company list: ' + err.message);
      }
    };
    fetchCompanies();
  }, []);

  const startEditing = (comp) => {
    setEditId(comp.comp_id);
    setEditData({
      CompId: comp.comp_id,
      plan_id: comp.plan_id,
      comp_name: comp.comp_name,
      comp_address: comp.comp_address,
      comp_address1: comp.comp_address1,
      pin_code: comp.pin_code,
      city: comp.city,
      state: comp.state,
      country: comp.country,
      modify_by: comp.modify_by,
      block: comp.block,
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
    formData.append('CompId', editData.CompId);
    formData.append('PlanId', editData.plan_id);
    formData.append('CompName', editData.comp_name);
    formData.append('Address', editData.comp_address);
    formData.append('Address1', editData.comp_address1);
    formData.append('PinCode', editData.pin_code);
    formData.append('City', editData.city);
    formData.append('State', editData.state);
    formData.append('Country', editData.country);
    formData.append('RequestBy', editData.modify_by);

    try {
      const response = await fetch(`${baseURL}/EditCompany`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.text();
      if (result === 'success') {
        setCompanies(companies.map(comp =>
          comp.comp_id === editId
            ? {
                ...comp,
                plan_id: parseInt(editData.plan_id) || comp.plan_id,
                comp_name: editData.comp_name || comp.comp_name,
                comp_address: editData.comp_address || comp.comp_address,
                comp_address1: editData.comp_address1 || comp.comp_address1,
                pin_code: parseInt(editData.pin_code) || comp.pin_code,
                city: editData.city || comp.city,
                state: editData.state || comp.state,
                country: editData.country || comp.country,
                modify_by: parseInt(editData.modify_by) || comp.modify_by,
                modify_date: currentDateTime,
                block: editData.block || comp.block,
              }
            : comp
        ).sort((a, b) => a.comp_id - b.comp_id));
        setEditId(null);
        setEditData({});
        setConfirmation({ show: false, message: '', onConfirm: () => {} });
      } else if (result === 'alreadyexists') {
        setError('Company already exists');
      } else {
        setError(result);
      }
    } catch (err) {
      setError('Error editing company: ' + err.message);
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
      message: 'Are you sure you want to delete this company?',
      onConfirm: async () => {
        try {
          const response = await fetch(`${baseURL}/DeleteCompany/${id}`, {
            method: 'POST',
          });
          const result = await response.text();
          if (result === 'success') {
            setCompanies(companies.filter(comp => comp.comp_id !== id));
            setConfirmation({ show: false, message: '', onConfirm: () => {} });
          } else {
            setError('Error deleting company: ' + result);
          }
        } catch (err) {
          setError('Error deleting company: ' + err.message);
        }
      },
    });
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({
      PlanId: '',
      CompName: '',
      Address: '',
      Address1: '',
      PinCode: '',
      City: '',
      State: '',
      Country: '',
      RequestBy: '',
      block: false,
    });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({
      PlanId: '',
      CompName: '',
      Address: '',
      Address1: '',
      PinCode: '',
      City: '',
      State: '',
      Country: '',
      RequestBy: '',
      block: false,
    });
  };

  const saveAdding = async () => {
    if (!newData.CompName || !newData.RequestBy || !newData.PlanId) {
      setError('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    Object.keys(newData).forEach(key => {
      formData.append(key, newData[key]);
    });

    try {
      const response = await fetch(`${baseURL}/AddCompany`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.text();
      if (result === 'success') {
        const newCompany = {
          comp_id: companies.length ? Math.max(...companies.map(c => c.comp_id)) + 1 : 1,
          plan_id: parseInt(newData.PlanId) || 0,
          comp_name: newData.CompName,
          comp_address: newData.Address || '',
          comp_address1: newData.Address1 || '',
          pin_code: parseInt(newData.PinCode) || 0,
          city: newData.City || '',
          state: newData.State || '',
          country: newData.Country || '',
          block: newData.block || false,
          created_by: parseInt(newData.RequestBy) || 0,
          created_date: currentDateTime,
          modify_by: parseInt(newData.RequestBy) || 0,
          modify_date: currentDateTime,
        };
        setCompanies([...companies, newCompany].sort((a, b) => a.comp_id - b.comp_id));
        cancelAdding();
        setConfirmation({ show: false, message: '', onConfirm: () => {} });
      } else if (result === 'alreadyexists') {
        setError('Company already exists');
      } else {
        setError(result);
      }
    } catch (err) {
      setError('Error adding company: ' + err.message);
    }
  };

  const confirmAdd = () => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new company?',
      onConfirm: saveAdding,
    });
  };

  const toggleBlock = async (comp) => {
    const status = comp.block ? 0 : 1;
    try {
      const response = await fetch(
        `${baseURL}/BlockCompany/${comp.modify_by || 0}/${comp.comp_id}/${status}`,
        {
          method: 'POST',
        }
      );
      const result = await response.text();
      if (result === 'success') {
        setCompanies(companies.map(c =>
          c.comp_id === comp.comp_id
            ? { ...c, block: status === 1, modify_date: currentDateTime }
            : c
        ));
      } else {
        setError('Error toggling block status: ' + result);
      }
    } catch (err) {
      setError('Error toggling block status: ' + err.message);
    }
  };

  const filteredCompanies = companies.filter(comp => {
    const compName = comp.comp_name || '';
    return compName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex-1 p-6 overflow-auto">
          
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Company</h2>
            <Breadcrumbs currentPage="Company Master" />
          </div>
          <div className="mb-4 flex justify-between items-center">
            {!isAdding && (
              <button
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center"
                onClick={startAdding}
              >
                <FaPlus className="mr-2" /> Add New Company
              </button>
            )}
            <input
              type="text"
              placeholder="Search by Company Name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value || '')}
              className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600 w-1/3"
            />
          </div>
          <div className="overflow-x-auto rounded-lg shadow border border-gray-400 dark:border-gray-600">
            <table className="min-w-full text-sm">
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
              <tbody className="bg-white dark:bg-gray-900">
                {isAdding && (
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3">New</td>
                    {[
                      'PlanId',
                      'CompName',
                      'Address',
                      'Address1',
                      'PinCode',
                      'City',
                      'State',
                      'Country',
                    ].map(field => (
                      <td key={field} className="px-4 py-3">
                        <input
                          value={newData[field]}
                          onChange={e =>
                            setNewData({ ...newData, [field]: e.target.value })
                          }
                          className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                          type={field === 'PinCode' ? 'number' : 'text'}
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={newData.RequestBy}
                        onChange={e =>
                          setNewData({ ...newData, RequestBy: e.target.value })
                        }
                        className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={newData.block}
                        onChange={e =>
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
                {filteredCompanies.map(comp => (
                  <tr key={comp.comp_id} className="border-b border-gray-200 dark:border-gray-700">
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
                    ].map(field => (
                      <td key={field} className="px-4 py-3">
                        {editId === comp.comp_id ? (
                          <input
                            value={editData[field]}
                            onChange={e =>
                              handleEditChange(field, e.target.value)
                            }
                            className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                            type={field === 'pin_code' ? 'number' : 'text'}
                          />
                        ) : (
                          comp[field]
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      {editId === comp.comp_id ? (
                        <input
                          type="number"
                          value={editData.modify_by}
                          onChange={e => handleEditChange('modify_by', e.target.value)}
                          className="border rounded px-2 py-1 w-full dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                        />
                      ) : (
                        comp.created_by
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === comp.comp_id ? (
                        <input
                          type="checkbox"
                          checked={editData.block}
                          onChange={e =>
                            handleEditChange('block', e.target.checked)
                          }
                          className="dark:bg-gray-800 dark:border-gray-600"
                        />
                      ) : (
                        <button
                          onClick={() => toggleBlock(comp)}
                          className={`px-2 py-1 rounded ${
                            comp.block
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white`}
                        >
                          {comp.block ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 flex space-x-2">
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
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
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
            {filteredCompanies.length === 0 && !isAdding && (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                No companies found
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