import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import axios from 'axios';
import { FaPlus, FaEdit, FaBan, FaCheck, FaSave, FaTimes, FaAngleLeft, FaAngleRight, FaTrash} from 'react-icons/fa';
import TileModal from '../components/TileModal';

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

const userId = localStorage.getItem('userid');

export default function TileMasterPage() {
  const [tiles, setTiles] = useState([]);
  const [message, setMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editTileData, setEditTileData] = useState(null);
  const [referenceData, setReferenceData] = useState({
    categories: [],
    applications: [],
    spaces: [],
    sizes: [],
    finishes: [],
    colors: []
  });
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  const [columnSearches, setColumnSearches] = useState({
    sku_name: '',
    sku_code: '',
    cat_name: '',
    app_name: '',
    space_name: '',
    size_name: '',
    finish_name: '',
    color_name: ''
  });
  const [globalSearch, setGlobalSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    fetchTiles();
    fetchReferenceData();
  }, []);

  const fetchTiles = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseURL}/GetTileList`);
      setTiles(res.data || []);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to fetch tiles: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    setIsLoading(true);
    try {
      const [categories, applications, spaces, sizes, finishes, colors] = await Promise.all([
        axios.get(`${baseURL}/GetCategoryList`),
        axios.get(`${baseURL}/GetApplicationList`),
        axios.get(`${baseURL}/GetSpaceList`),
        axios.get(`${baseURL}/GetSizeList`),
        axios.get(`${baseURL}/GetFinishList`),
        axios.get(`${baseURL}/GetColorList`)
      ]);
      setReferenceData({
        categories: categories.data || [],
        applications: applications.data || [],
        spaces: spaces.data || [],
        sizes: sizes.data || [],
        finishes: finishes.data || [],
        colors: colors.data || []
      });
    } catch (err) {
      console.error('Reference Data Fetch Error:', err);
      setError('Failed to fetch reference data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (tile) => {
    setEditTileData({
      TileId: tile.tile_id || '',
      SkuName: tile.sku_name || '',
      SkuCode: tile.sku_code || '',
      CatName: tile.cat_name || '',
      AppName: tile.app_name || '',
      SpaceName: tile.space_name || '',
      SizeName: tile.size_name || '',
      FinishName: tile.finish_name || '',
      ColorName: tile.color_name || ''
    });
    setShowEditModal(true);
  };

  const handleEditTileConfirm = (data) => {
    setConfirmMessage('Do you want to save changes?');
    setConfirmAction(() => () => handleEditTile(data));
    setShowConfirm(true);
  };

  const handleEditTile = async (data) => {
    try {
      const payload = new FormData();
      payload.append('TileId', editTileData.TileId);
      payload.append('SkuName', data.SkuName);
      payload.append('SkuCode', data.SkuCode);
      payload.append('CatId', getIdFromName(referenceData.categories, data.CatName, 'cat_id', 'cat_name'));
      payload.append('CatName', data.CatName);
      payload.append('AppId', getIdFromName(referenceData.applications, data.AppName, 'app_id', 'app_name'));
      payload.append('AppName', data.AppName);
      payload.append('SpaceId', getIdFromName(referenceData.spaces, data.SpaceName, 'space_id', 'space_name'));
      payload.append('SpaceName', data.SpaceName);
      payload.append('SizeId', getIdFromName(referenceData.sizes, data.SizeName, 'size_id', 'size_name'));
      payload.append('SizeName', data.SizeName);
      payload.append('FinishId', getIdFromName(referenceData.finishes, data.FinishName, 'finish_id', 'finish_name'));
      payload.append('FinishName', data.FinishName);
      payload.append('ColorId', getIdFromName(referenceData.colors, data.ColorName, 'color_id', 'color_name'));
      payload.append('ColorName', data.ColorName);
      payload.append('RequestBy', userId || '');

      setIsLoading(true);
      const res = await axios.post(`${baseURL}/EditTile`, payload);
      const responseText = res.data;

      if (responseText === 'success') {
        setMessage('Tile updated successfully!');
        setShowEditModal(false);
        fetchTiles();
      } else if (responseText === 'alreadyexists') {
        setError('Tile already exists!');
      } else {
        setError(responseText);
      }
    } catch (err) {
      console.error('Edit Error:', err);
      setError('An error occurred while updating tile: ' + err.message);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleBlockToggle = (tileId, currentStatus) => {
    setConfirmMessage(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this tile?`);
    setConfirmAction(() => async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${baseURL}/BlockTile/${userId}/${tileId}/${currentStatus ? 0 : 1}`);
        if (res.data === 'success') {
          setMessage(`Tile ${currentStatus ? 'unblocked' : 'blocked'} successfully.`);
          fetchTiles();
        } else {
          setError('Failed to update block status.');
        }
      } catch (err) {
        console.error('Block Error:', err);
        setError('Error while toggling block status: ' + err.message);
      } finally {
        setIsLoading(false);
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const getIdFromName = (dataArray, name, idKey, nameKey) => {
    const item = dataArray.find(item => item && item[nameKey] === name);
    return item ? item[idKey] : '';
  };

  const handleSearchChange = (key, value) => {
    setColumnSearches(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleGlobalSearchChange = (e) => {
    setGlobalSearch(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
    setCurrentPage(1);
  };

  const getSortedAndFilteredTiles = () => {
    let filteredTiles = [...tiles];

    if (globalSearch) {
      filteredTiles = filteredTiles.filter(tile =>
        Object.values(tile).some(value =>
          String(value).toLowerCase().includes(globalSearch)
        )
      );
    }

    filteredTiles = filteredTiles.filter(tile =>
      Object.entries(columnSearches).every(([key, value]) =>
        !value || String(tile[key]).toLowerCase().includes(value.toLowerCase())
      )
    );

    if (sortConfig.key) {
      filteredTiles.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
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

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar theme="light" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar theme="light" />

        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-800">Products</h2>
            <Breadcrumb />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              <button 
                className="float-right font-bold" 
                onClick={() => setError('')}
              >
                ×
              </button>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
              <button 
                className="float-right font-bold" 
                onClick={() => setMessage('')}
              >
                ×
              </button>
            </div>
          )}

<div className="mb-4 flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
  {/* Show Entries - Leftmost */}
  <div className="flex items-center bg-white rounded-lg border border-gray-300 px-3 py-1.5">
    <span className="text-sm text-gray-600 mr-2 whitespace-nowrap">Show</span>
    <select
      value={entriesPerPage}
      onChange={(e) => {
        setEntriesPerPage(Number(e.target.value));
        setCurrentPage(1);
      }}
      className="border-none focus:ring-2 focus:ring-green-600 rounded text-sm"
    >
      {[5, 10, 25, 50, 100].map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    <span className="text-sm text-gray-600 ml-2 whitespace-nowrap">entries</span>
  </div>

  {/* Search Input - Middle with controlled width */}
  <div className="relative w-full sm:w-64">
    <input
      type="text"
      placeholder="Search..."
      value={globalSearch}
      onChange={handleGlobalSearchChange}
      className="w-full border border-gray-300 rounded-lg px-4 py-1.5 pl-10 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
    />
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
      </svg>
    </div>
  </div>

  {/* Add Product Button - Rightmost */}
  <div className="w-full sm:w-auto ml-auto">
    <Link
      to="/add-tile"
      className="inline-flex items-center bg-green-700 hover:bg-green-800 text-white px-4 py-1.5 rounded-lg transition-colors duration-200"
    >
      <FaPlus className="mr-2" /> Add Product
    </Link>
  </div>
</div>
          <div className="overflow-x-auto bg-white rounded-lg shadow" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-green-100 text-grey-800 sticky top-0">
                <tr>
                  {['sku_name', 'sku_code', 'app_name', 'space_name', 'size_name', 'finish_name', 'color_name', 'actions'].map((key) => (
                    <th
                      key={key}
                      className="px-4 py-2 font-semibold text-left cursor-pointer"
                      onClick={() => key !== 'actions' && handleSort(key)}
                    >
                      <div className="flex items-center">
                        {key === 'actions' ? 'Actions' : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {key !== 'actions' && (
                          <span className="ml-1">
                            {sortConfig.key === key && (
                              sortConfig.direction === 'ascending' ? '↑' : '↓'
                            )}
                          </span>
                        )}
                      </div>
                      {key !== 'actions' && (
                        <input
                          type="text"
                          placeholder={`Search...`}
                          value={columnSearches[key]}
                          onChange={(e) => handleSearchChange(key, e.target.value)}
                          className="mt-1 w-full border rounded px-2 py-1 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTiles.map((tile, index) => (
                  <tr key={index} className="border-b hover:bg-green-50 transition duration-150">
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
                        className="text-yellow-500 hover:text-yellow-700"
                        disabled={isLoading}
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleBlockToggle(tile.tile_id, tile.block)}
                        className={`${tile.block ? 'text-green-600 hover:text-green-800' : 'text-red-500 hover:text-red-700'}`}
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

          <div className="flex justify-between mt-4 text-sm items-center">
            <span>
              Showing {filteredTiles.length === 0 ? 0 : indexOfFirst + 1} to {Math.min(indexOfLast, filteredTiles.length)} of {filteredTiles.length} entries
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                <FaAngleLeft />
              </button>
              {[...Array(totalPages).keys()].map(num => (
                <button
                  key={num + 1}
                  onClick={() => setCurrentPage(num + 1)}
                  className={`px-3 py-1 border rounded ${currentPage === num + 1 ? 'bg-green-600 text-white' : ''}`}
                >
                  {num + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                <FaAngleRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <TileModal
          title="Edit Tile"
          defaultValues={editTileData || {}}
          referenceData={referenceData}
          onSubmit={handleEditTileConfirm}
          onClose={() => setShowEditModal(false)}
          isOpen={showEditModal}
          isEdit={true}
        />
      )}

      {showConfirm && (
        <ConfirmationModal
          message={confirmMessage}
          onConfirm={confirmAction}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}