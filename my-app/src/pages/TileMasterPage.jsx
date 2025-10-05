import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import axios from 'axios';
import { FaPlus, FaEdit, FaCheck, FaAngleLeft, FaAngleRight, FaTrash, FaFileExport, FaFileImport, FaFolderOpen, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseURL = process.env.REACT_APP_API_BASE_URL;

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
            onClick={onConfirm}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportModal({
  isOpen,
  onClose,
  selectedImportType,
  setSelectedImportType,
  fileInputRef,
  folderInputRef,
  handleExcelChange,
  handleFolderChange,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Import Options</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            {[
              { key: 'excel', icon: FaFileImport, label: 'Excel Import' },
              { key: 'folder', icon: FaFolderOpen, label: 'Folder Upload' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setSelectedImportType(key)}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 ${
                  selectedImportType === key
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          {selectedImportType === 'excel' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Excel File</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  ref={fileInputRef}
                  onChange={handleExcelChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-white"
                  disabled={isLoading}
                />
              </div>
              {isLoading && <FaSpinner className="animate-spin mx-auto text-blue-500" size={24} />}
            </div>
          )}
          {selectedImportType === 'folder' && (
            <div className="space-y-4">
              <input
                type="file"
                multiple
                webkitdirectory=""
                accept="image/*"
                ref={folderInputRef}
                onChange={handleFolderChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-gray-600 dark:file:text-white"
                disabled={isLoading}
              />
              {isLoading && <FaSpinner className="animate-spin mx-auto text-blue-500" size={24} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const userId = localStorage.getItem('userid');

export default function TileMasterPage() {
  const [tiles, setTiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  const [columnSearches, setColumnSearches] = useState({
    sku_name: '',
    sku_code: '',
    app_name: '',
    space_name: '',
    size_name: '',
    finish_name: '',
    color_name: '',
  });
  const [globalSearch, setGlobalSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState('excel');
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      toast.error('User not authenticated. Please log in.');
      navigate('/login');
      return;
    }
    fetchTiles();
  }, []);

  const fetchTiles = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseURL}/GetTileList`);
      setTiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to fetch tiles: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (tile) => {
    toast.info(`Editing tile: ${tile.sku_name}`);
    navigate(`/edit-tile/${tile.tile_id}`);
  };

  const handleBlockToggle = (tileId, currentStatus) => {
    setConfirmMessage(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this tile?`);
    setConfirmAction(() => async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${baseURL}/BlockTile/${userId}/${tileId}/${currentStatus ? 0 : 1}`);
        if (res.data === 'success') {
          toast.success(`Tile ${currentStatus ? 'unblocked' : 'blocked'} successfully`);
          fetchTiles();
        } else {
          toast.error('Failed to update block status');
        }
      } catch (err) {
        toast.error('Error toggling block status: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsLoading(false);
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handleSearchChange = (key, value) => {
    setColumnSearches((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleGlobalSearchChange = (e) => {
    setGlobalSearch(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
    setCurrentPage(1);
  };

  const getSortedAndFilteredTiles = () => {
    let filteredTiles = [...tiles];

    if (globalSearch) {
      filteredTiles = filteredTiles.filter((tile) =>
        Object.values(tile).some((value) => String(value).toLowerCase().includes(globalSearch))
      );
    }

    filteredTiles = filteredTiles.filter((tile) =>
      Object.entries(columnSearches).every(([key, value]) =>
        !value || String(tile[key]).toLowerCase().includes(value.toLowerCase())
      )
    );

    if (sortConfig.key) {
      filteredTiles.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
          return sortConfig.direction === 'ascending' ? (aVal === bVal ? 0 : aVal ? 1 : -1) : (aVal === bVal ? 0 : bVal ? 1 : -1);
        }
        if (!isNaN(aVal) && !isNaN(bVal)) {
          return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === 'ascending'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return filteredTiles;
  };

  const filteredTiles = getSortedAndFilteredTiles();
  const totalPages = Math.ceil(filteredTiles.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentTiles = filteredTiles.slice(indexOfFirst, indexOfLast);

  const handleExportExcel = async () => {
    try {
      const res = await axios.get('/api/ExportToExcel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');
      link.href = url;
      link.setAttribute('download', `TileList_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel file exported successfully');
    } catch (err) {
      toast.error('Error exporting Excel: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleImportClose = () => {
    setShowImportModal(false);
    setSelectedImportType('excel');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const handleExcelChange = async (e) => {
    const file = e.target.files[0];
    console.log('Selected Excel file:', file?.name);
    if (!file) {
      toast.error('No file selected');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      setIsLoading(true);
      const res = await axios.post('/api/ImportFromExcel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.message && res.data.message.includes('Error')) {
        toast.error(res.data.message);
      } else {
        toast.success(res.data.message || 'Excel imported successfully');
        fetchTiles();
      }
    } catch (err) {
      console.error('Excel import error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast.error('Error importing Excel: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFolderChange = async (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected folder files:', files);
    if (!files.length) {
      toast.error('No files selected');
      return;
    }
    try {
      setIsLoading(true);
      const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');
      const folderName = `tiles_${timestamp}`; // Auto-generate folder name
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('folderName', folderName);
      const resizeRes = await axios.post('/api/resize-folder', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (resizeRes.data && Array.isArray(resizeRes.data)) {
        const errors = resizeRes.data.filter((item) => item.error);
        if (errors.length > 0) {
          errors.forEach((item) => toast.error(`Failed to process ${item.FileName}: ${item.error}`));
        } else {
          resizeRes.data.forEach((item) =>
            toast.success(`Resized: ${item.FileName} - Big: ${item.BigUrl}, Thumb: ${item.ThumbUrl}`)
          );
        }
      } else {
        toast.error('Unexpected response from resize-folder');
      }
      const bluePatchFormData = new FormData();
      bluePatchFormData.append('excelFile', new File([], 'SizeListFormat.xlsx'));
      bluePatchFormData.append('folderName', folderName);
      const bluePatchRes = await axios.post('/api/process-folder-faces-with-bluepatch', bluePatchFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Faces processed and blue patch applied, images in /vyr');
      fetchTiles(); // Refresh tile list after successful upload
    } catch (err) {
      console.error('Folder upload error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      toast.error('Error processing folder: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar theme="light" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar theme="light" />
        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">Products</h2>
            <Breadcrumb />
          </div>
          <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[75vh] overflow-hidden">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1">
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2 whitespace-nowrap">Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border-none focus:ring-2 focus:ring-green-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                >
                  {[5, 10, 25, 50, 100].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 whitespace-nowrap">entries</span>
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  value={globalSearch}
                  onChange={handleGlobalSearchChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-0.5 pl-10 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto ml-auto">
                <Link
                  to="/add-tile"
                  className="bg-green-700 text-white px-4 py-1.5 rounded hover:bg-green-800 flex items-center text-sm font-medium"
                >
                  <FaPlus className="mr-2" /> Add Product
                </Link>
                <button
                  onClick={handleImportClick}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 flex items-center text-sm font-medium"
                  disabled={isLoading}
                >
                  <FaFileImport className="mr-2" /> Import
                </button>
                <button
                  onClick={handleExportExcel}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700 flex items-center text-sm font-medium"
                  disabled={isLoading}
                >
                  <FaFileExport className="mr-2" /> Export Excel
                </button>
              </div>
            </div>
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-200 sticky top-0">
                  <tr>
                    {['sku_name', 'sku_code', 'app_name', 'space_name', 'size_name', 'finish_name', 'color_name', 'actions'].map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 font-semibold text-left cursor-pointer"
                        onClick={() => key !== 'actions' && handleSort(key)}
                      >
                        <div className="flex items-center">
                          {key === 'actions' ? 'Actions' : key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          {key !== 'actions' && (
                            <span className="ml-1">{sortConfig.key === key && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</span>
                          )}
                        </div>
                        {key !== 'actions' && (
                          <input
                            type="text"
                            placeholder="Search..."
                            value={columnSearches[key]}
                            onChange={(e) => handleSearchChange(key, e.target.value)}
                            className="mt-1 w-full border rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-200">
                  {currentTiles.map((tile, index) => (
                    <tr key={index} className="border-b hover:bg-green-50 dark:hover:bg-gray-700 transition duration-150">
                      <td className="px-4 py-2">{tile.sku_name}</td>
                      <td className="px-4 py-2">{tile.sku_code}</td>
                      <td className="px-4 py-2">{tile.app_name}</td>
                      <td className="px-4 py-2">{tile.space_name}</td>
                      <td className="px-4 py-2">{tile.size_name}</td>
                      <td className="px-4 py-2">{tile.finish_name}</td>
                      <td className="px-4 py-2">{tile.color_name}</td>
                      <td className="px-4 py-2 space-x-2 flex">
                        <button
                          onClick={() => handleEditClick(tile)}
                          className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                          disabled={isLoading}
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleBlockToggle(tile.tile_id, tile.block)}
                          className={`${
                            tile.block
                              ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                              : 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                          }`}
                          disabled={isLoading}
                        >
                          {tile.block ? <FaCheck size={18} /> : <FaTrash size={18} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600"
                >
                  <FaAngleLeft />
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-gray-300 dark:border-gray-600"
                >
                  <FaAngleRight />
                </button>
              </div>
            </div>
            {isLoading && (
              <div className="mt-2 text-gray-700 dark:text-gray-300">
                Processing, please wait...
              </div>
            )}
            {showConfirm && (
              <ConfirmationModal
                message={confirmMessage}
                onConfirm={confirmAction}
                onCancel={() => setShowConfirm(false)}
              />
            )}
            <ImportModal
              isOpen={showImportModal}
              onClose={handleImportClose}
              selectedImportType={selectedImportType}
              setSelectedImportType={setSelectedImportType}
              fileInputRef={fileInputRef}
              folderInputRef={folderInputRef}
              handleExcelChange={handleExcelChange}
              handleFolderChange={handleFolderChange}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}