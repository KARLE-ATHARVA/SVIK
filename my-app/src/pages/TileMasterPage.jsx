import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import useTable from '../hooks/useTable';
import axios from 'axios';
import { FaPlus, FaEdit, FaCheck, FaAngleLeft, FaAngleRight, FaTrash, FaFileExport, FaFileImport, FaTimes, FaSpinner, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseURL = process.env.REACT_APP_API_BASE_URL;
const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;
const thumbImageBaseURL = `${MEDIA_URL}/thumb/`;
const imgURL = process.env.REACT_APP_MEDIA_URL;;
const fallbackUrl = `${MEDIA_URL}/no-image.jpg`;
const MAX_UPLOAD_SIZE = 100 * 1024 * 1024; // 100MB backend request limit
const MAX_BATCH_SIZE = 80 * 1024 * 1024; // keep safe margin for multipart overhead
const MAX_FILES_PER_BATCH = 200; // avoid giant multipart payloads with thousands of parts
const TILE_CACHE_KEY = "tile_master_cache_v1";
const TILE_CACHE_TS_KEY = "tile_master_cache_ts_v1";
const TILE_CACHE_MAX_AGE_MS = 5 * 60 * 1000;


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


const TileImage = React.memo(({ tile }) => {
  const src = `${thumbImageBaseURL}${tile.sku_code}.jpg`;

  return (
    <img
      src={src}
      alt={tile?.sku_name || "Tile"}
      className="w-12 h-12 object-cover rounded"
      onError={(e) => {
        e.currentTarget.src = fallbackUrl;
      }}
      loading="lazy"
    />
  );
});



function ImportModal({
  isOpen,
  onClose,
  folderInputRef,
  fileInputRef,
  excelFolderInputRef,
  handleFolderUpload,
  importLoadingType,
  imageImportProgress,
  replaceExcel,
  setReplaceExcel,
  replaceImages,
  setReplaceImages
}) {

  if (!isOpen) return null;
  const isImageLoading = importLoadingType === 'images';
  const isExcelLoading = importLoadingType === 'excel';
  const isImportLoading = !!importLoadingType;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200/70 dark:border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Import Products</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><FaTimes size={20} /></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-700/70 rounded-xl border border-blue-100 dark:border-gray-600 space-y-3">
            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">Image Import</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">Upload images or zip file.</p>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".zip,image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              disabled={isImportLoading}
            />
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={replaceImages}
                onChange={(e) => setReplaceImages(e.target.checked)}
                disabled={isImportLoading}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              Replace existing images
            </label>
            <button onClick={() => handleFolderUpload('images')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center" disabled={isImportLoading}>
              {isImageLoading ? <FaSpinner className="animate-spin mr-2" /> : 'Import Images'}
            </button>
            {isImageLoading && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                  <span>{imageImportProgress?.label || "Uploading images..."}</span>
                  <span>{Math.round(imageImportProgress?.percent || 0)}%</span>
                </div>
                <div className="h-2 w-full bg-blue-100 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-200"
                    style={{ width: `${Math.max(0, Math.min(100, imageImportProgress?.percent || 0))}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-gray-700 dark:to-gray-700/70 rounded-xl border border-emerald-100 dark:border-gray-600 space-y-3">
            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">Excel Import</h4>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Excel File (
              <a
                href="https://docs.google.com/spreadsheets/d/1pybBh-jxqRtLEPT0ItBJxhAdIEqg4uO18yHqQIfJlH0/edit?gid=0#gid=0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View sample format
              </a>
              )
            </label>
            <input type="file" accept=".xlsx,.xls" ref={excelFolderInputRef} className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-600 file:text-white hover:file:bg-emerald-700" disabled={isImportLoading} />
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={replaceExcel}
                onChange={(e) => setReplaceExcel(e.target.checked)}
                disabled={isImportLoading}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              Replace existing Excel records
            </label>
            <button onClick={() => handleFolderUpload('excel')} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center" disabled={isImportLoading}>
              {isExcelLoading ? <FaSpinner className="animate-spin mr-2" /> : 'Import Excel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const userId = localStorage.getItem('userid');

export default function TileMasterPage() {
  const [tiles, setTiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importLoadingType, setImportLoadingType] = useState(null);
  const [imageImportProgress, setImageImportProgress] = useState({ percent: 0, label: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [replaceExcel, setReplaceExcel] = useState(false);
const [replaceImages, setReplaceImages] = useState(false);
  const [columnSearches, setColumnSearches] = useState({
    sku_code: '', sku_name: '', app_name: '', finish_name: '', color_name: '',
  });
  // const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  // const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showImportModal, setShowImportModal] = useState(false);
  
const fileInputRef = useRef(null);

  const excelFolderInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      toast.error('User not authenticated.');
      navigate('/login');
      return;
    }
    const hadFreshCache = loadTilesFromCache();
    fetchTiles({ silent: hadFreshCache });
  }, []);

  const loadTilesFromCache = () => {
    try {
      const cached = sessionStorage.getItem(TILE_CACHE_KEY);
      const cachedTs = Number(sessionStorage.getItem(TILE_CACHE_TS_KEY) || 0);
      if (!cached || !cachedTs) return false;
      if (Date.now() - cachedTs > TILE_CACHE_MAX_AGE_MS) return false;

      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length) {
        setTiles(parsed);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const fetchTiles = async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true);
    try {
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');
      const res = await axios.get(`${normalizedBaseURL}/GetTileList`);
      let tilesData = Array.isArray(res.data) ? res.data : (res.data.tiles || res.data.data?.tiles || []);
      setTiles(tilesData);
      sessionStorage.setItem(TILE_CACHE_KEY, JSON.stringify(tilesData));
      sessionStorage.setItem(TILE_CACHE_TS_KEY, String(Date.now()));
    } catch (err) {
      if (!silent) toast.error('Failed to fetch tiles');
    } finally {
      if (!silent) setIsLoading(false);
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

const splitFilesIntoBatches = (files, maxBytes, maxFilesPerBatch) => {
  const batches = [];
  let currentBatch = [];
  let currentSize = 0;

  for (const file of files) {
    if (file.size > MAX_UPLOAD_SIZE) {
      throw new Error(`File ${file.name} exceeds 100MB limit.`);
    }

    const wouldExceedSize = currentSize + file.size > maxBytes;
    const wouldExceedCount = currentBatch.length >= maxFilesPerBatch;
    if (currentBatch.length > 0 && (wouldExceedSize || wouldExceedCount)) {
      batches.push(currentBatch);
      currentBatch = [];
      currentSize = 0;
    }

    currentBatch.push(file);
    currentSize += file.size;
  }

  if (currentBatch.length) batches.push(currentBatch);
  return batches;
};


const handleFolderUpload = async (type) => {
  const selectedFiles = Array.from(fileInputRef.current?.files || []);
  const excelFile = excelFolderInputRef.current?.files[0];
  const normalizedBaseURL = baseURL.replace(/\/+$/, "");

  if (type === "images") {
    if (!selectedFiles.length) {
      toast.error("Please select ZIP or images");
      return;
    }

    setImportLoadingType("images");
    setImageImportProgress({ percent: 0, label: "Preparing upload..." });
    const uploadToastId = toast.loading("Image upload started...");

    try {
      const zipSelections = selectedFiles.filter(f => f.name.toLowerCase().endsWith(".zip"));
      if (zipSelections.length > 0 && selectedFiles.length > 1) {
        throw new Error("Select either one ZIP file or image files.");
      }

      // Single ZIP upload directly
      if (selectedFiles.length === 1 && selectedFiles[0].name.toLowerCase().endsWith(".zip")) {
        if (selectedFiles[0].size > MAX_UPLOAD_SIZE) {
          throw new Error("ZIP exceeds 100MB limit.");
        }
        const formData = new FormData();
        formData.append("files", selectedFiles[0]);
        formData.append("empcode", userId);
        formData.append("replace", replaceImages);
        setImageImportProgress({ percent: 0, label: "Uploading ZIP..." });
        await axios.post(`${normalizedBaseURL}/resize-folder-jpg`, formData, {
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;
            const pct = (progressEvent.loaded / progressEvent.total) * 100;
            setImageImportProgress({ percent: pct, label: "Uploading ZIP..." });
          }
        });
      } else if (selectedFiles.length === 1) {
        // Single image upload directly (no zip)
        if (selectedFiles[0].size > MAX_UPLOAD_SIZE) {
          throw new Error("Image exceeds 100MB limit.");
        }
        const formData = new FormData();
        formData.append("files", selectedFiles[0]);
        formData.append("empcode", userId);
        formData.append("replace", replaceImages);
        setImageImportProgress({ percent: 0, label: "Uploading image..." });
        await axios.post(`${normalizedBaseURL}/resize-folder-jpg`, formData, {
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;
            const pct = (progressEvent.loaded / progressEvent.total) * 100;
            setImageImportProgress({ percent: pct, label: "Uploading image..." });
          }
        });
      } else {
        // Multiple images: split into safe multipart batches and upload each batch
        const batches = splitFilesIntoBatches(selectedFiles, MAX_BATCH_SIZE, MAX_FILES_PER_BATCH);
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          const formData = new FormData();
          batch.forEach((f) => formData.append("files", f));
          formData.append("empcode", userId);
          formData.append("replace", replaceImages);

          const batchStartPct = (i / batches.length) * 100;
          const batchEndPct = ((i + 1) / batches.length) * 100;
          setImageImportProgress({
            percent: batchStartPct,
            label: `Uploading batch ${i + 1} of ${batches.length}`
          });

          await axios.post(`${normalizedBaseURL}/resize-folder-jpg`, formData, {
            onUploadProgress: (progressEvent) => {
              if (!progressEvent.total) return;
              const inBatchPct = (progressEvent.loaded / progressEvent.total) * 100;
              const overallPct = batchStartPct + ((batchEndPct - batchStartPct) * inBatchPct) / 100;
              setImageImportProgress({
                percent: overallPct,
                label: `Uploading batch ${i + 1} of ${batches.length}`
              });
            }
          });
        }
      }

      setImageImportProgress({ percent: 100, label: "Finalizing..." });

      toast.update(uploadToastId, {
        render: "Image import successful",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      await fetchTiles();
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowImportModal(false);
    } catch (err) {
      toast.update(uploadToastId, {
        render:
          (typeof err?.response?.data === "string" && err.response.data) ||
          err?.response?.data?.message ||
          err?.message ||
          "Image import failed",
        type: "error",
        isLoading: false,
        autoClose: 4000
      });
    } finally {
      setImportLoadingType(null);
      setImageImportProgress({ percent: 0, label: "" });
    }
    return;
  }

  if (type === "excel") {
    if (!excelFile) {
      toast.error("Please select an Excel file");
      return;
    }

    setImportLoadingType("excel");
    try {
      const excelForm = new FormData();
      excelForm.append("file", excelFile);
      excelForm.append("createdBy", userId);
      excelForm.append("replace", replaceExcel);

      await axios.post(`${normalizedBaseURL}/ImportFromExcel`, excelForm);
      toast.success("Excel import successful");
      await fetchTiles();
      if (excelFolderInputRef.current) excelFolderInputRef.current.value = "";
      setShowImportModal(false);
    } catch (err) {
      toast.error("Excel import failed");
    } finally {
      setImportLoadingType(null);
    }
  }
};
const deferredGlobalSearch = useDeferredValue(globalSearch);
const deferredColumnSearches = useDeferredValue(columnSearches);

const indexedTiles = useMemo(() => {
  return tiles.map((tile) => ({
    ...tile,
    __searchBlob: [
      tile.sku_code,
      tile.sku_name,
      tile.app_name,
      tile.finish_name,
      tile.color_name
    ]
      .map((v) => String(v ?? "").toLowerCase())
      .join(" ")
  }));
}, [tiles]);

const filteredTiles = useMemo(() => {
  let filtered = indexedTiles;
  const search = deferredGlobalSearch.trim().toLowerCase();

  if (search) {
    filtered = filtered.filter((t) => t.__searchBlob.includes(search));
  }

  filtered = filtered.filter((t) =>
    Object.entries(deferredColumnSearches).every(([k, v]) => {
      const query = String(v ?? "").trim().toLowerCase();
      if (!query) return true;
      return String(t[k] ?? "").toLowerCase().includes(query);
    })
  );

  return filtered;
}, [indexedTiles, deferredGlobalSearch, deferredColumnSearches]);

const {
  currentItems: currentTiles,
  currentPage,
  setCurrentPage,
  totalPages,
  sortConfig,
  handleSort,
  totalCount
} = useTable(filteredTiles, entriesPerPage);


  // const indexOfLast = currentPage * entriesPerPage;
  // const indexOfFirst = indexOfLast - entriesPerPage;
  // const currentTiles = filteredTiles.slice(indexOfFirst, indexOfLast);
  // const totalPages = Math.ceil(filteredTiles.length / entriesPerPage);

  return (
    
<PageLayout title="Products">

         <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[75vh] overflow-hidden">
            {/* Toolbar Area */}
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              
              {/* Left Side: Show Entries + Search aligned together */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Show Entries Dropdown */}
                <div className="flex items-center bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 px-3 py-1">
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
    className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:text-gray-200 text-sm"
  />
</div>
              </div>

              {/* Right Side: Action Buttons */}
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Link to="/add-tile" className="bg-green-700 text-white px-4 py-1.5 rounded hover:bg-green-800 flex items-center text-sm font-medium"><FaPlus className="mr-2" /> Add Product</Link>
                <button onClick={() => setShowImportModal(true)} className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 flex items-center text-sm font-medium"><FaFileImport className="mr-2" /> Import</button>
                <button onClick={handleExportExcel} className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700 flex items-center text-sm font-medium"><FaFileExport className="mr-2" /> Export Excel</button>
              </div>
            </div>

            {/* Table Area */}
           <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
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
                        <div className="flex items-center cursor-pointer hover:text-green-700 dark:hover:text-green-400" onClick={() =>
  col.key !== 'actions' &&
  col.key !== 'image' &&
  handleSort(col.key)
}>
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
  {isLoading ? (
    <tr>
      <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
        <FaSpinner className="inline mr-2 animate-spin" />
        Loading products...
      </td>
    </tr>
  ) : currentTiles.length > 0 ? (
    currentTiles.map((tile) => (
      <tr
        key={tile.tile_id}
        className="hover:bg-green-50/50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <td className="px-4 py-3">
          <span
            onClick={() => navigate(`/view-tile/${tile.sku_code}`)}
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
          >
            {tile.sku_code}
          </span>
        </td>

        <td className="px-4 py-3 dark:text-gray-300">{tile.sku_name}</td>
        <td className="px-4 py-3 dark:text-gray-300">{tile.app_name}</td>
        <td className="px-4 py-3 dark:text-gray-300">{tile.finish_name}</td>
        <td className="px-4 py-3 dark:text-gray-300">{tile.color_name}</td>

        <td className="px-4 py-3">
          <TileImage tile={tile} />
        </td>

        <td className="px-4 py-3">
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/edit-tile/${tile.sku_code}`)}
              className="text-yellow-500 hover:text-yellow-600 transition-colors"
              title="Edit"
            >
              <FaEdit size={18} />
            </button>

            <button
              onClick={() => handleBlockToggle(tile.tile_id, tile.block)}
              className={`${
                tile.block
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-red-500 hover:text-red-600'
              } transition-colors`}
              title={tile.block ? 'Unblock' : 'Block'}
            >
              {tile.block ? <FaCheck size={18} /> : <FaTrash size={18} />}
            </button>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
        No products found.
      </td>
    </tr>
  )}
</tbody>

              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between mt-6 text-sm items-center text-gray-600 dark:text-gray-400">
              <span className="font-medium">Showing {totalCount === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, totalCount)} of {totalCount} entries</span>
              <div className="flex gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"><FaAngleLeft /></button>
                {[...Array(totalPages).keys()].slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(n => (
                  <button key={n + 1} onClick={() => setCurrentPage(n + 1)} className={`px-3 py-1.5 border rounded-lg transition-all ${currentPage === n + 1 ? 'bg-green-700 text-white border-green-700 shadow-sm' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{n + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"><FaAngleRight /></button>
              </div>
            </div>

          </div>
        {/* </div> */}


  {showConfirm && (
      <ConfirmationModal
        message={confirmMessage}
        onConfirm={confirmAction}
        onCancel={() => setShowConfirm(false)}
      />
    )}

    {showImportModal && (
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        fileInputRef={fileInputRef}
        excelFolderInputRef={excelFolderInputRef}
        handleFolderUpload={handleFolderUpload}
        importLoadingType={importLoadingType}
        imageImportProgress={imageImportProgress}
        replaceExcel={replaceExcel}
        setReplaceExcel={setReplaceExcel}
        replaceImages={replaceImages}
        setReplaceImages={setReplaceImages}
      />
    )}
  </PageLayout>
  );
}
