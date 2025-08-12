import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';
import ConfirmationModal from '../components/ConfirmationModal';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaKey } from 'react-icons/fa';

const baseURL = process.env.REACT_APP_API_BASE_URL;

function ChangePasswordModal({ show, onClose, onSave, userId }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!oldPassword || !newPassword) {
            setError('Please fill all fields');
            return;
        }
        onSave({ userId, oldPassword, newPassword });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded w-96">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Change Password</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <input
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="mb-2 w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mb-4 w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
                </div>
            </div>
        </div>
    );
}

export default function LoginMasterPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [logins, setLogins] = useState([]);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newData, setNewData] = useState({
        CompId: '',
        UserId: '',
        LoginName: '',
        LoginPassword: '',
        RequestBy: '',
        block: false,
    });
    const [confirmation, setConfirmation] = useState({
        show: false,
        message: '',
        onConfirm: () => { },
    });
    const [error, setError] = useState('');
    const [fadeIn, setFadeIn] = useState(false);

    // Current timestamp in IST
    const currentDateTime = '2025-08-05T23:37:00+05:30';
    const userid = localStorage.getItem('userid');

    // Define fetchLogins outside of useEffect
    const fetchLogins = useCallback(async () => {
        try {
            const response = await fetch(`${baseURL}/GetLoginList`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                const mappedLogins = data.map(login => ({
                    login_id: login.LoginId || 0,
                    comp_id: login.CompId || 0,
                    user_id: login.UserId || 0,
                    login_name: login.LoginName || '',
                    login_password: login.LoginPassword || '',
                    block: login.Block || false,
                    created_by: login.CreatedBy || 0,
                    created_date: login.CreatedDate || currentDateTime,
                    modify_by: login.ModifyBy || 0,
                    modify_date: login.ModifyDate || currentDateTime,
                }));
                setLogins(mappedLogins);
            } else {
                setError('Failed to fetch login list: Invalid response format');
            }
        } catch (err) {
            setError('Error fetching login list: ' + err.message);
        }
    }, [currentDateTime]); // Add dependencies if any

    useEffect(() => {
        setFadeIn(true);
        fetchLogins();
    }, [fetchLogins]);

    const startEditing = (login) => {
        setEditId(login.login_id);
        setEditData({
            LoginId: login.login_id,
            CompId: login.comp_id,
            UserId: login.user_id,
            LoginName: login.login_name,
            LoginPassword: login.login_password,
            RequestBy: login.modify_by,
            block: login.block,
        });
    };

    const handlePasswordChange = async ({ userId, oldPassword, newPassword }) => {
        const formData = new FormData();
        formData.append('UserId', userId);
        formData.append('OldPassword', oldPassword);
        formData.append('NewPassword', newPassword);

        try {
            const response = await fetch(`${baseURL}/ChangePassword`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.text();
            if (result === 'success') {
                setShowPasswordModal(false);
                setSelectedUserId(null);
                setError('');
            } else {
                setError(result);
            }
        } catch (err) {
            setError('Error changing password: ' + err.message);
        }
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
        formData.append('LoginId', editData.LoginId);
        formData.append('CompId', editData.CompId);
        formData.append('UserId', editData.UserId);
        formData.append('LoginName', editData.LoginName);
        formData.append('LoginPassword', editData.LoginPassword);
        formData.append('RequestBy', editData.RequestBy);
        formData.append('Block', editData.block);

        try {
            const response = await fetch(`${baseURL}/EditLogin`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.text();
            if (result === 'success') {
                setLogins(logins.map(login =>
                    login.login_id === editId
                        ? {
                            ...login,
                            comp_id: parseInt(editData.CompId) || login.comp_id,
                            user_id: parseInt(editData.UserId) || login.user_id,
                            login_name: editData.LoginName || login.login_name,
                            login_password: editData.LoginPassword || login.login_password,
                            modify_by: parseInt(editData.RequestBy) || login.modify_by,
                            modify_date: currentDateTime,
                            block: editData.block || login.block,
                        }
                        : login
                ).sort((a, b) => a.login_id - b.login_id));
                setEditId(null);
                setEditData({});
                setConfirmation({ show: false, message: '', onConfirm: () => { } });
            } else if (result === 'alreadyexists') {
                setError('Login already exists');
            } else {
                setError(result);
            }
        } catch (err) {
            setError('Error editing login: ' + err.message);
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
            message: 'Are you sure you want to delete this login?',
            onConfirm: async () => {
                try {
                    const response = await fetch(`${baseURL}/DeleteLogin/${id}`, {
                        method: 'POST',
                    });
                    const result = await response.text();
                    if (result === 'success') {
                        setLogins(logins.filter(login => login.login_id !== id));
                        setConfirmation({ show: false, message: '', onConfirm: () => { } });
                    } else {
                        setError('Error deleting login: ' + result);
                    }
                } catch (err) {
                    setError('Error deleting login: ' + err.message);
                }
            },
        });
    };

    const startAdding = () => {
        setIsAdding(true);
        setNewData({
            CompId: '',
            UserId: '',
            LoginName: '',
            LoginPassword: '',
            RequestBy: userid || '',
            block: false,
        });
    };

    const cancelAdding = () => {
        setIsAdding(false);
        setNewData({
            CompId: '',
            UserId: '',
            LoginName: '',
            LoginPassword: '',
            RequestBy: '',
            block: false,
        });
    };

    const saveAdding = async () => {
        if (!newData.LoginName || !newData.LoginPassword || !newData.CompId || !newData.UserId || !newData.RequestBy) {
            setError('Please fill all required fields');
            return;
        }

        const formData = new FormData();
        Object.keys(newData).forEach(key => {
            formData.append(key, newData[key]);
        });

        try {
            const response = await fetch(`${baseURL}/AddLogin`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.text();
            if (result === 'success') {
                // Fetch the updated list to ensure data consistency
                fetchLogins();
                cancelAdding();
                setConfirmation({ show: false, message: '', onConfirm: () => { } });
            } else if (result === 'alreadyexists') {
                setError('Login already exists');
            } else {
                setError(result);
            }
        } catch (err) {
            setError('Error adding login: ' + err.message);
        }
    };

    const confirmAdd = () => {
        setConfirmation({
            show: true,
            message: 'Are you sure you want to save this new login?',
            onConfirm: saveAdding,
        });
    };

    const toggleBlock = async (login) => {
        const status = login.block ? 0 : 1;
        try {
            const response = await fetch(
                `${baseURL}/BlockLogin/${userid}/${login.login_id}/${status}`,
                {
                    method: 'POST',
                }
            );
            const result = await response.text();
            if (result === 'success') {
                setLogins(logins.map(l =>
                    l.login_id === login.login_id
                        ? { ...l, block: status === 1, modify_date: currentDateTime }
                        : l
                ));
            } else {
                setError('Error toggling block status: ' + result);
            }
        } catch (err) {
            setError('Error toggling block status: ' + err.message);
        }
    };

    const filteredLogins = logins.filter(login => {
        const loginName = login.login_name || '';
        return loginName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
            <Sidebar collapsed={collapsed} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
                <div className={`flex flex-col flex-1 overflow-y-auto p-6 transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">Logins</h2>
                        <Breadcrumbs currentPage="Login Master" />
                    </div>
                    {error && (
                        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                            {error}
                            <button
                                className="ml-4 text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
                                onClick={() => setError('')}
                            >
                                Close
                            </button>
                        </div>
                    )}
                    <div className="mb-4 flex justify-between items-center">
                        <input
                            type="text"
                            placeholder="Search by Login Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value || '')}
                            className="border border-gray-300 dark:border-gray-700 rounded px-5 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-white"
                        />
                        {!isAdding && (
                            <button
                                className="bg-green-700 text-white px-4 py-1 rounded hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 flex items-center"
                                onClick={startAdding}
                            >
                                <FaPlus className="mr-2" /> Add New Login
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
                        <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
                            <thead className="bg-green-100 dark:bg-green-900 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-200">Login ID</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-200">Comp ID</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-200">User ID</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-200">Login Name</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-200">Password</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-200">Block</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-200">Created By</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-800 dark:text-gray-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800">
                                {isAdding && (
                                    <tr className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                                        <td className="px-4 py-3">New</td>
                                        <td className="px-4 py-3">
                                            <input
                                                value={newData.CompId}
                                                onChange={e => setNewData({ ...newData, CompId: e.target.value })}
                                                className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-white"
                                                type="number"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                value={newData.UserId}
                                                onChange={e => setNewData({ ...newData, UserId: e.target.value })}
                                                className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-white"
                                                type="number"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                value={newData.LoginName}
                                                onChange={e => setNewData({ ...newData, LoginName: e.target.value })}
                                                className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-white"
                                                type="text"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                value={newData.LoginPassword}
                                                onChange={e => setNewData({ ...newData, LoginPassword: e.target.value })}
                                                className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-white"
                                                type="text"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-gray-400 italic">--</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                value={newData.RequestBy}
                                                onChange={e => setNewData({ ...newData, RequestBy: e.target.value })}
                                                className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-white"
                                            />
                                        </td>
                                        <td className="px-4 py-3 flex space-x-2">
                                            <button onClick={confirmAdd} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"><FaSave size={18} /></button>
                                            <button onClick={cancelAdding} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"><FaTimes size={18} /></button>
                                        </td>
                                    </tr>
                                )}
                                {filteredLogins.map(login => (
                                    <tr key={login.login_id} className="border-b dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                                        <td className="px-4 py-3">{login.login_id}</td>
                                        <td className="px-4 py-3">
                                            {editId === login.login_id ? (
                                                <input
                                                    value={editData.CompId}
                                                    onChange={e => handleEditChange('CompId', e.target.value)}
                                                    className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-white"
                                                    type="number"
                                                />
                                            ) : (
                                                login.comp_id
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editId === login.login_id ? (
                                                <input
                                                    value={editData.UserId}
                                                    onChange={e => handleEditChange('UserId', e.target.value)}
                                                    className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-white"
                                                    type="number"
                                                />
                                            ) : (
                                                login.user_id
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editId === login.login_id ? (
                                                <input
                                                    value={editData.LoginName}
                                                    onChange={e => handleEditChange('LoginName', e.target.value)}
                                                    className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-white"
                                                />
                                            ) : (
                                                login.login_name
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editId === login.login_id ? (
                                                <input
                                                    value={editData.LoginPassword}
                                                    onChange={e => handleEditChange('LoginPassword', e.target.value)}
                                                    className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-white"
                                                />
                                            ) : (
                                                '********'
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                onClick={() => toggleBlock(login)}
                                                className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${login.block ? 'bg-red-600' : 'bg-green-600'
                                                    }`}
                                            >
                                                {login.block ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {editId === login.login_id ? (
                                                <input
                                                    type="number"
                                                    value={editData.RequestBy}
                                                    onChange={e => handleEditChange('RequestBy', e.target.value)}
                                                    className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-white"
                                                />
                                            ) : (
                                                login.created_by
                                            )}
                                        </td>
                                        <td className="px-4 py-3 flex space-x-2">
                                            {editId === login.login_id ? (
                                                <>
                                                    <button onClick={confirmSave} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"><FaSave size={18} /></button>
                                                    <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"><FaTimes size={18} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEditing(login)} className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"><FaEdit size={18} /></button>
                                                    <button onClick={() => confirmDelete(login.login_id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><FaTrash size={18} /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredLogins.length === 0 && !isAdding && (
                                    <tr className="border-b dark:border-gray-700">
                                        <td colSpan={8} className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                            No logins found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {confirmation.show && (
                <ConfirmationModal
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onCancel={() => setConfirmation({ show: false, message: '', onConfirm: () => { } })}
                />
            )}
            {showPasswordModal && (
                <ChangePasswordModal
                    show={showPasswordModal}
                    onClose={() => setShowPasswordModal(false)}
                    onSave={handlePasswordChange}
                    userId={selectedUserId}
                />
            )}
        </div>
    );
}