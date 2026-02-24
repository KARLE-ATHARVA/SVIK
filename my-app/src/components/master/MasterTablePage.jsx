import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import Breadcrumb from '../Breadcrumb';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaSortUp, FaSortDown } from 'react-icons/fa';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import ConfirmationModal from './ConfirmationModal';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function MasterTablePage({
  title,
  entityName,        // "Application", "Category", "Color"
  getListEndpoint,
  addEndpoint,
  editEndpoint,
  blockEndpoint,
  idField,           // "app_id"
  nameField,         // "app_name"
  apiIdField,        // "AppId"
  apiNameField       // "AppName"
}) {
  const { darkMode } = useTheme();
  const userId = localStorage.getItem('userid');

  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({ [nameField]: '' });
  const [confirmation, setConfirmation] = useState({ show: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [fadeIn, setFadeIn] = useState(false);

  const entriesPerPage = 10;

  const headers = [
    { key: nameField, label: `${title} Name` },
    { key: 'updated_by', label: 'Updated By' },
    { key: 'updated_date', label: 'Updated Date' },
    { key: 'block', label: 'Block' }
  ];

  useEffect(() => {
    setFadeIn(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${baseURL}/${getListEndpoint}`);
      setData(res.data);
    } catch (err) {
      toast.error(`Failed to fetch ${title.toLowerCase()}`);
    }
  };

  const filtered = data.filter(
    (item) =>
      item[nameField]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.updated_by && item.updated_by.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sorted = useMemo(() => {
    let items = [...filtered];
    if (sortConfig.key) {
      items.sort((a, b) =>
        sortConfig.direction === 'ascending'
          ? a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
          : a[sortConfig.key] < b[sortConfig.key] ? 1 : -1
      );
    }
    return items;
  }, [filtered, sortConfig]);

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = sorted.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'ascending'
          ? 'descending'
          : 'ascending'
    });
  };

const confirmSave = () => {
  setConfirmation({
    show: true,
    message: 'Are you sure you want to save changes?',
    onConfirm: async () => {
      try {
        const originalItem = data.find(
          (d) => d[idField] === editData[idField]
        );

        const formData = new FormData();
        formData.append(apiIdField, editData[idField]);
        formData.append(apiNameField, editData[nameField]);
        formData.append('RequestBy', userId);

        const res = await axios.post(`${baseURL}/${editEndpoint}`, formData);

        if (originalItem && originalItem.block !== editData.block) {
          await axios.get(
            `${baseURL}/${blockEndpoint}/${userId}/${editData[idField]}/${editData.block ? 1 : 0}`
          );
        }

        if (res.data === 'success') {
          fetchData();
          setEditId(null);
          toast.success('Updated successfully!');
        } else {
          toast.error(
            res.data === 'alreadyexists'
              ? `${entityName} already exists!`
              : `Error: ${res.data}`
          );
        }
      } catch (error) {
        toast.error(`Error saving ${entityName.toLowerCase()}`);
      }

      setConfirmation({ show: false });
    },
  });
};
  const confirmDelete = (id) => {
    setConfirmation({
      show: true,
      message: `Are you sure you want to delete this ${entityName.toLowerCase()}?`,
      onConfirm: async () => {
        await axios.get(`${baseURL}/${blockEndpoint}/${userId}/${id}/1`);
        fetchData();
        toast.success('Deleted successfully!');
        setConfirmation({ show: false });
      }
    });
  };
  const getSortIcon = (key) => {
  if (sortConfig.key === key) {
    return sortConfig.direction === 'ascending'
      ? <FaSortUp className="ml-1" />
      : <FaSortDown className="ml-1" />;
  }
  return null;
};

const startAdding = () => setIsAdding(true);

const cancelAdding = () => {
  setIsAdding(false);
  setNewData({ [nameField]: '' });
};

const saveAdding = () => {
  if (!newData[nameField]) {
    toast.error(`Please enter ${entityName.toLowerCase()} name`);
    return;
  }

  setConfirmation({
    show: true,
    message: `Are you sure you want to add this ${entityName.toLowerCase()}?`,
    onConfirm: async () => {
      try {
        const formData = new FormData();
        formData.append(apiNameField, newData[nameField]);
        formData.append('RequestBy', userId);

        const res = await axios.post(`${baseURL}/${addEndpoint}`, formData);

        if (res.data === 'success') {
          fetchData();
          cancelAdding();
          toast.success('Added successfully!');
        } else {
          toast.error(
            res.data === 'alreadyexists'
              ? `${entityName} already exists!`
              : `Error: ${res.data}`
          );
        }
      } catch (err) {
        toast.error(`Error adding ${entityName.toLowerCase()}`);
      }

      setConfirmation({ show: false });
    },
  });
};

const startEditing = (item) => {
  setEditId(item[idField]);
  setEditData({ ...item });
};

const cancelEditing = () => {
  setEditId(null);
  setEditData({});
};

const handleEditChange = (field, value) => {
  setEditData({ ...editData, [field]: value });
};

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />

        <div className={`flex flex-col flex-1 overflow-hidden p-5 transition duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center mb-4 mt-2">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-500">
              {title}
            </h2>
            <Breadcrumb />
          </div>

          {/* 🔥 TABLE UI (SAME AS YOURS, NOT CHANGED) */}

          {/* I kept your same styling and structure */}
          
          {/* Due to length, UI part remains identical to yours,
             only nameField & idField used dynamically */}
             <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[75vh] overflow-hidden">
                         <div className="mb-4 flex justify-between items-center">
                           <input
                             type="text"
                             placeholder="Search ..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="border border-gray-300 dark:border-gray-600 rounded px-5 py-0.5 focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-gray-200"
                           />
                           {!isAdding && (
                             <button
                               onClick={startAdding}
                               className="bg-green-700 text-white px-4 py-1.5 rounded hover:bg-green-800 flex items-center text-sm font-medium"
                             >
                               <FaPlus className="mr-2" /> Add New
                             </button>
                           )}
                         </div>
             
                         <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
                           <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
                             <thead className="bg-green-100 dark:bg-green-900 sticky top-0 z-10">
                               <tr>
                                 {headers.map((header) => (
                                   <th key={header.key} className="px-4 py-2 font-semibold text-left cursor-pointer" onClick={() => handleSort(header.key)}>
                                     <div className="flex items-center">
                                       {header.label}
                                       {getSortIcon(header.key)}
                                     </div>
                                   </th>
                                 ))}
                                 <th className="px-4 py-2 font-semibold text-left">Actions</th>
                               </tr>
                             </thead>
                             <tbody>
                               {isAdding && (
                                 <tr className="border-b dark:border-gray-700">
                                   <td className="px-4 py-2">
                                     <input
                                       value={newData[nameField]}
                                       onChange={(e) =>
  setNewData({ ...newData, [nameField]: e.target.value })
}
                                       className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200"
                                     />
                                   </td>
                                   <td className="px-4 py-2">--</td>
                                   <td className="px-4 py-2">--</td>
                                   <td className="px-4 py-2">--</td>
                                   <td className="px-4 py-2 flex gap-2">
                                     <button onClick={saveAdding} className="text-green-600">
                                       <FaSave size={22} />
                                     </button>
                                     <button onClick={cancelAdding} className="text-gray-600">
                                       <FaTimes size={22} />
                                     </button>
                                   </td>
                                 </tr>
                               )}
             
                               {currentItems.map((item) => (
  <tr key={item[idField]} className="border-b dark:border-gray-700">

    <td className="px-4 py-2">
      {editId === item[idField] ? (
        <input
          value={editData[nameField]}
          onChange={(e) => handleEditChange(nameField, e.target.value)}
          className="border rounded px-2 py-1 w-full dark:bg-gray-700 dark:text-gray-200"
        />
      ) : (
        item[nameField]
      )}
    </td>

    <td className="px-4 py-2">{item.updated_by}</td>

    <td className="px-4 py-2">
      {new Date(item.updated_date).toLocaleDateString()}
    </td>

    <td className="px-4 py-2">
      {editId === item[idField] ? (
        <span
          onClick={() =>
            setEditData({ ...editData, block: !editData.block })
          }
          className={`px-3 py-1 rounded-full cursor-pointer text-white text-xs ${
            editData.block ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {editData.block ? 'Yes' : 'No'}
        </span>
      ) : (
        <span
          className={`px-3 py-1 rounded-full text-white text-xs ${
            item.block ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {item.block ? 'Yes' : 'No'}
        </span>
      )}
    </td>

    <td className="px-4 py-2 flex gap-2">
      {editId === item[idField] ? (
        <>
          <button onClick={confirmSave} className="text-green-600">
            <FaSave size={22} />
          </button>
          <button onClick={cancelEditing} className="text-gray-600">
            <FaTimes size={22} />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => startEditing(item)}
            className="text-yellow-500"
          >
            <FaEdit size={18} />
          </button>
          <button
            onClick={() => confirmDelete(item[idField])}
            className="text-red-500"
          >
            <FaTrash size={18} />
          </button>
        </>
      )}
    </td>

  </tr>
))}
                             </tbody>
                           </table>
                         </div>
             
                         <div className="flex justify-between mt-4 text-sm items-center text-gray-800 dark:text-gray-200">
                           <span>
                             Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filtered.length)} of {filtered.length} entries
                           </span>
                           <div className="flex gap-1">
                             <button
                               disabled={currentPage === 1}
                               onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                               className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
                             >
                               Previous
                             </button>
                             {[...Array(totalPages).keys()].map((num) => (
                               <button
                                 key={num + 1}
                                 onClick={() => setCurrentPage(num + 1)}
                                 className={`px-3 py-1 border rounded ${currentPage === num + 1 ? 'bg-green-600 text-white dark:bg-green-500' : 'dark:border-gray-600 dark:text-gray-200'}`}
                               >
                                 {num + 1}
                               </button>
                             ))}
                             <button
                               disabled={currentPage === totalPages}
                               onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                               className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
                             >
                               Next
                             </button>
                           </div>
                         </div>
                       </div>
          
        </div>

        {confirmation.show && (
          <ConfirmationModal
            message={confirmation.message}
            onConfirm={confirmation.onConfirm}
            onCancel={() => setConfirmation({ show: false })}
          />
        )}
      </div>
    </div>
  );
}