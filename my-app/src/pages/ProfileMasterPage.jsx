// ✅ Updated React component with working Edit, Add, and Block Toggle functionality

import React, { useState, useEffect } from 'react';
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

export default function ProfileMasterPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [confirmation, setConfirmation] = useState({ show: false, message: '', onConfirm: () => {} });
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ name: '', created_by: '' });

  const userId = localStorage.getItem('userid');

  const fetchProfiles = async () => {
    try {
      const res = await axios.get(`${baseURL}/GetProfileList`);
      setProfiles(res.data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const startEditing = (profile) => {
    setEditId(profile.profile_id);
    setEditData({ name: profile.name, profile_id: profile.profile_id });
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
          formData.append('ProfileID', editData.profile_id);
          formData.append('Name', editData.name);
          formData.append('RequestBy', userId);

          const res = await axios.post(`${baseURL}/EditProfile`, formData);

          if (res.data === 'alreadyexists') {
            alert('Profile already exists!');
            return;
          } else if (res.data === 'success') {
            fetchProfiles();
          } else {
            alert(`Failed to update profile: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
          alert('Error updating profile');
        }

        setEditId(null);
        setEditData({});
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const confirmDelete = (profileId) => {
    setConfirmation({
      show: true,
      message: 'Are you sure you want to delete this entry?',
      onConfirm: async () => {
        try {
          await axios.get(`${baseURL}/BlockProfile/${userId}/${profileId}/1`);
          fetchProfiles();
        } catch (err) {
          console.error(err);
          alert('Error deleting profile');
        }
        setConfirmation({ ...confirmation, show: false });
      },
    });
  };

  const toggleBlock = async (profile) => {
    try {
      await axios.get(`${baseURL}/BlockProfile/${userId}/${profile.profile_id}/${profile.block ? 0 : 1}`);
      fetchProfiles();
    } catch (err) {
      console.error(err);
      alert('Error toggling block status');
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setNewData({ name: '', created_by: userId });
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewData({ name: '', created_by: '' });
  };

  const saveAdding = () => {
    if (!newData.name || !newData.created_by) {
      alert('Please fill all required fields');
      return;
    }

    setConfirmation({
      show: true,
      message: 'Are you sure you want to save this new profile?',
      onConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append('Name', newData.name);
          formData.append('RequestBy', newData.created_by);

          const res = await axios.post(`${baseURL}/AddProfile`, formData);

          if (res.data === 'alreadyexists') {
            alert('Profile already exists!');
            return;
          } else if (res.data === 'success') {
            fetchProfiles();
          } else {
            alert(`Failed to add profile: ${res.data}`);
          }
        } catch (err) {
          console.error(err);
          alert('Error adding profile');
        }

        setIsAdding(false);
        setNewData({ name: '', created_by: '' });
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
            <h2 className="text-2xl font-bold text-gray-800">Profile Master Table</h2>
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
                  <FaPlus className="mr-2" /> Add New Profile
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by Profile Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
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
                        value={newData.name}
                        onChange={(e) => setNewData({ ...newData, name: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-3">N/A</td>
                    <td className="px-4 py-3">{userId}</td>
                    <td className="px-4 py-3">-</td>
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

                {profiles.map((profile) => (
                  <tr key={profile.profile_id}>
                    <td className="px-4 py-3">{profile.profile_id}</td>
                    <td className="px-4 py-3">
                      {editId === profile.profile_id ? (
                        <input
                          value={editData.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        profile.name
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={profile.block === true}
                        onChange={() => toggleBlock(profile)}
                      />
                    </td>
                    <td className="px-4 py-3">{profile.updated_by}</td>
                    <td className="px-4 py-3">{new Date(profile.updated_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 space-x-2 flex">
                      {editId === profile.profile_id ? (
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
                          <button onClick={() => startEditing(profile)} className="text-yellow-500 hover:text-yellow-700">
                            <FaEdit size={22} />
                          </button>
                          <button onClick={() => confirmDelete(profile.profile_id)} className="text-red-500 hover:text-red-700">
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
