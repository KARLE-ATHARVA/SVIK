import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import axios from 'axios';
import { FaPlus, FaEdit, FaCheck, FaAngleLeft, FaAngleRight, FaTrash, FaFileExport, FaFileImport, FaTimes, FaSpinner, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import 'react-toastify/dist/ReactToastify.css';

const baseURL = process.env.REACT_APP_API_BASE_URL;
const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;
const thumbImageBaseURL = `${MEDIA_URL}/thumb/`;
const imgURL = process.env.REACT_APP_MEDIA_URL;;
const fallbackUrl = `${MEDIA_URL}/no-image.jpg`;


// --- Components ---

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-end space-x-2">
          <button className="bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500" onClick={onCancel}>Cancel</button>
          <button className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800" onClick={onConfirm}>Yes</button>
        </div>
      </div>
    </div>
  );
}

const useImageLoader = (src) => {
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    if (!src) { setStatus("error"); return; }
    const img = new Image();
    img.onload = () => setStatus("loaded");
    img.onerror = () => setStatus("error");
    img.src = src;
    return () => { img.onload = null; img.onerror = null; };
  }, [src]);
  return status;
};

const getThumbImageUrl = (tile) => {
  if (!tile) return null;
  if (tile.thumb_image && tile.thumb_image.trim() !== "") return `${thumbImageBaseURL}${tile.thumb_image}`;
  if (tile.image && tile.image.trim() !== "") return `${thumbImageBaseURL}${tile.image}`;
  if (tile.sku_code && tile.sku_code.trim() !== "") return `${thumbImageBaseURL}${tile.sku_code}.jpg`;
  return null;
};

const TileImage = ({ tile }) => {
  const mainUrl = getThumbImageUrl(tile);
  const urlToLoad = mainUrl || fallbackUrl;
  const status = useImageLoader(urlToLoad);

  if (status === "loaded") {
    return <img src={urlToLoad} alt={tile?.sku_name || "Tile"} className="w-12 h-12 object-cover rounded" />;
  }
  if (status === "error") {
    return <img src={fallbackUrl} alt="No Image" className="w-12 h-12 object-cover rounded" />;
  }
  return (
    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
      <div className="animate-pulse text-gray-400 text-xs">Loading...</div>
    </div>
  );
};

function ImportModal({ isOpen, onClose, folderInputRef, excelFolderInputRef, handleFolderUpload, isLoading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Import Options</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><FaTimes size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Folder or Files</label>
            <input type="file" multiple webkitdirectory="" accept="image/jpeg,image/png,image/webp,.zip" ref={folderInputRef} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-gray-600 dark:file:text-white" disabled={isLoading} />
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Excel File (SizeListFormat.xlsx)</label>
            <input type="file" accept=".xlsx,.xls" ref={excelFolderInputRef} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-white" disabled={isLoading} />
          </div>
          <button onClick={handleFolderUpload} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center" disabled={isLoading}>
            {isLoading ? <FaSpinner className="animate-spin mr-2" /> : 'Upload'}
          </button>
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
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnSearches, setColumnSearches] = useState({
    sku_code: '', sku_name: '', app_name: '', finish_name: '', color_name: '',
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const folderInputRef = useRef(null);
  const excelFolderInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      toast.error('User not authenticated.');
      navigate('/login');
      return;
    }
    fetchTiles();
  }, []);

  const fetchTiles = async () => {
    setIsLoading(true);
    try {
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');
      const res = await axios.get(`${normalizedBaseURL}/GetTileList`);
      let tilesData = Array.isArray(res.data) ? res.data : (res.data.tiles || res.data.data?.tiles || []);
      setTiles(tilesData);
    } catch (err) {
      toast.error('Failed to fetch tiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockToggle = (tileId, currentStatus) => {
    setConfirmMessage(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this tile?`);
    setConfirmAction(() => async () => {
      try {
        setIsLoading(true);
        const normalizedBaseURL = baseURL.replace(/\/+$/, '');
        const res = await axios.get(`${normalizedBaseURL}/BlockTile/${userId}/${tileId}/${currentStatus ? 0 : 1}`);
        if (res.data === 'success') {
          toast.success("Status updated!");
          fetchTiles();
        }
      } catch (err) { toast.error('Error updating tile'); }
      finally { setIsLoading(false); setShowConfirm(false); }
    });
    setShowConfirm(true);
  };

  const handleExportExcel = async () => {
    try {
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');
      const res = await axios.get(`${normalizedBaseURL}/ExportToExcel`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TileList_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Exported successfully');
    } catch (err) { toast.error('Export failed'); }
  };

  const createZipFromFiles = async (files) => {
    const zip = new JSZip();
    files.forEach((file) => zip.file(file.name, file));
    const content = await zip.generateAsync({ type: 'blob' });
    return new File([content], `images_${Date.now()}.zip`, { type: 'application/zip' });
  };

  const handleFolderUpload = async () => {
    const files = Array.from(folderInputRef.current?.files || []);
    const excelFile = excelFolderInputRef.current?.files[0];
    if (!files.length || !excelFile) {
      toast.error('Files and Excel are required');
      return;
    }

    try {
      setIsLoading(true);
      let formData = new FormData();
      formData.append('excelFile', excelFile);
      
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > 100 * 1024 * 1024) {
        formData.append('files', await createZipFromFiles(files));
      } else {
        files.forEach((file) => formData.append('files', file));
      }
      formData.append('replace', false);

      const res = await axios.post(`${imgURL}/process-folder-vyr`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data.Message || "Imported successfully");
      fetchTiles();
      setShowImportModal(false);
    } catch (err) { toast.error('Upload failed'); }
    finally { setIsLoading(false); }
  };

  const getSortedAndFilteredTiles = () => {
    let filtered = [...tiles];
    if (globalSearch) {
      filtered = filtered.filter(t => Object.values(t).some(v => String(v).toLowerCase().includes(globalSearch.toLowerCase())));
    }
    filtered = filtered.filter(t => Object.entries(columnSearches).every(([k, v]) => !v || String(t[k]).toLowerCase().includes(v.toLowerCase())));
    
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        return sortConfig.direction === 'ascending' 
          ? String(aVal).localeCompare(String(bVal)) 
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return filtered;
  };

  const filteredTiles = getSortedAndFilteredTiles();
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentTiles = filteredTiles.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTiles.length / entriesPerPage);

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

          <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[100vh] overflow-hidden">
            
            {/* Toolbar Area */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              
              {/* Left Side: Show Entries + Search aligned together */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Show Entries Dropdown */}
                <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 h-10">
                  <span className="text-sm mr-2 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">Show</span>
                  <select 
                    value={entriesPerPage} 
                    onChange={(e) => setEntriesPerPage(Number(e.target.value))} 
                    className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer dark:text-white"
                  >
                    {[10, 25, 50, 100].map(n => <option key={n} value={n} className="dark:bg-gray-800">{n}</option>)}
                  </select>
                </div>

                {/* Global Search Bar aligned beside the dropdown */}
                <div className="relative flex-1 sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400 text-sm" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search product..." 
                    value={globalSearch} 
                    onChange={(e) => setGlobalSearch(e.target.value)} 
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-green-600 outline-none dark:text-white h-10" 
                  />
                </div>
              </div>

              {/* Right Side: Action Buttons */}
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Link to="/add-tile" className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 flex items-center text-sm font-medium transition-colors shadow-sm"><FaPlus className="mr-2" /> Add Product</Link>
                <button onClick={() => setShowImportModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium transition-colors shadow-sm"><FaFileImport className="mr-2" /> Import</button>
                <button onClick={handleExportExcel} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center text-sm font-medium transition-colors shadow-sm"><FaFileExport className="mr-2" /> Export Excel</button>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-green-100 dark:bg-green-900/30 text-gray-800 dark:text-gray-200 sticky top-0 z-10">
                  <tr>
                    {[
                      {label: 'SKU Code', key: 'sku_code'},
                      {label: 'SKU Name', key: 'sku_name'},
                      {label: 'Application', key: 'app_name'},
                      {label: 'Finish', key: 'finish_name'},
                      {label: 'Color', key: 'color_name'},
                      {label: 'Image', key: 'image'},
                      {label: 'Actions', key: 'actions'}
                    ].map((col) => (
                      <th key={col.key} className="px-4 py-3 font-semibold text-left">
                        <div className="flex items-center cursor-pointer hover:text-green-700 dark:hover:text-green-400" onClick={() => col.key !== 'actions' && col.key !== 'image' && setSortConfig({key: col.key, direction: sortConfig.direction === 'ascending' ? 'descending' : 'ascending'})}>
                          {col.label} {sortConfig.key === col.key && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                        </div>
                        {col.key !== 'actions' && col.key !== 'image' && (
                          <input 
                            type="text" 
                            className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-xs font-normal text-black dark:text-white dark:bg-gray-800" 
                            placeholder={`Filter ${col.label}...`} 
                            value={columnSearches[col.key]} 
                            onChange={(e) => setColumnSearches({...columnSearches, [col.key]: e.target.value})}
                          />
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentTiles.length > 0 ? currentTiles.map((tile, idx) => (
                    <tr key={idx} className="hover:bg-green-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <span onClick={() => navigate(`/view-tile/${tile.sku_code}`)} className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">{tile.sku_code}</span>
                      </td>
                      <td className="px-4 py-3 dark:text-gray-300">{tile.sku_name}</td>
                      <td className="px-4 py-3 dark:text-gray-300">{tile.app_name}</td>
                      <td className="px-4 py-3 dark:text-gray-300">{tile.finish_name}</td>
                      <td className="px-4 py-3 dark:text-gray-300">{tile.color_name}</td>
                      <td className="px-4 py-3"><TileImage tile={tile} /></td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-3">
                          <button onClick={() => navigate(`/edit-tile/${tile.tile_id}`)} className="text-yellow-500 hover:text-yellow-600 transition-colors" title="Edit"><FaEdit size={18} /></button>
                          <button onClick={() => handleBlockToggle(tile.tile_id, tile.block)} className={`${tile.block ? 'text-green-600 hover:text-green-700' : 'text-red-500 hover:text-red-600'} transition-colors`} title={tile.block ? "Unblock" : "Block"}>
                            {tile.block ? <FaCheck size={18} /> : <FaTrash size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-10 text-center text-gray-500">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between mt-6 text-sm items-center text-gray-600 dark:text-gray-400">
              <span className="font-medium">Showing {filteredTiles.length === 0 ? 0 : indexOfFirst + 1} to {Math.min(indexOfLast, filteredTiles.length)} of {filteredTiles.length} entries</span>
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"><FaAngleLeft /></button>
                {[...Array(totalPages).keys()].slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(n => (
                  <button key={n + 1} onClick={() => setCurrentPage(n + 1)} className={`px-3 py-1.5 border rounded-lg transition-all ${currentPage === n + 1 ? 'bg-green-700 text-white border-green-700 shadow-sm' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{n + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"><FaAngleRight /></button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showConfirm && <ConfirmationModal message={confirmMessage} onConfirm={confirmAction} onCancel={() => setShowConfirm(false)} />}
      <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} folderInputRef={folderInputRef} excelFolderInputRef={excelFolderInputRef} handleFolderUpload={handleFolderUpload} isLoading={isLoading} />
    </div>
  );
}