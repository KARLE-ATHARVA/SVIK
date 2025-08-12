import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';
import axios from 'axios';
import { FaPlus, FaEdit, FaBan, FaCheck, FaSortUp, FaSortDown, FaAngleLeft, FaAngleRight, FaSearch } from 'react-icons/fa';
import TileModal from '../components/TileModal';

const baseURL = process.env.REACT_APP_API_BASE_URL;

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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [tempFormData, setTempFormData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const userId = localStorage.getItem('userid');

  useEffect(() => {
    console.log('TileMasterPage mounted');
    fetchTiles();
    fetchReferenceData();
  }, []);

  const fetchTiles = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseURL}/GetTileList`);
      console.log('Tiles fetched:', res.data);
      setTiles(res.data || []);
    } catch (err) {
      console.error('Fetch Error:', err);
      setMessage('Failed to fetch tiles.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    setIsLoading(true);
    try {
      const [categories, applications, spaces, sizes, finishes, colors] = await Promise.all([
        axios.get(`${baseURL}/GetCategoryList`).catch(err => { console.error('GetCategoryList error:', err); throw err; }),
        axios.get(`${baseURL}/GetApplicationList`).catch(err => { console.error('GetApplicationList error:', err); throw err; }),
        axios.get(`${baseURL}/GetSpaceList`).catch(err => { console.error('GetSpaceList error:', err); throw err; }),
        axios.get(`${baseURL}/GetSizeList`).catch(err => { console.error('GetSizeList error:', err); throw err; }),
        axios.get(`${baseURL}/GetFinishList`).catch(err => { console.error('GetFinishList error:', err); throw err; }),
        axios.get(`${baseURL}/GetColorList`).catch(err => { console.error('GetColorList error:', err); throw err; })
      ]);
      setReferenceData({
        categories: categories.data || [],
        applications: applications.data || [],
        spaces: spaces.data || [],
        sizes: sizes.data || [],
        finishes: finishes.data || [],
        colors: colors.data || []
      });
      console.log('Reference data fetched:', {
        categories: categories.data,
        applications: applications.data,
        spaces: spaces.data,
        sizes: sizes.data,
        finishes: finishes.data,
        colors: colors.data
      });
    } catch (err) {
      console.error('Reference Data Fetch Error:', err);
      setMessage('Failed to fetch reference data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (tile) => {
    console.log('Edit clicked for tile:', tile);
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
    console.log('Edit tile confirm:', data);
    setTempFormData(data);
    setConfirmMessage('Do you want to save changes?');
    setConfirmAction(() => () => handleEditTile(data));
    setShowConfirm(true);
  };

  const handleEditTile = async (data) => {
    console.log('Submitted Data:', data);
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
      console.log('EditTile response:', res.data);
      const responseText = res.data;

      if (responseText === 'success') {
        setAlertMessage('Tile updated successfully!');
        setShowAlert(true);
        setShowEditModal(false);
        fetchTiles();
      } else if (responseText === 'alreadyexists') {
        setAlertMessage('Tile already exists!');
        setShowAlert(true);
      } else {
        setAlertMessage(responseText);
        setShowAlert(true);
      }
    } catch (err) {
      console.error('Edit Error:', err);
      setAlertMessage('An error occurred while updating tile.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockToggle = async (tileId, currentStatus) => {
    console.log('Block toggle for tileId:', tileId, 'currentStatus:', currentStatus);
    setConfirmMessage(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this tile?`);
    setConfirmAction(() => async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${baseURL}/BlockTile/${userId}/${tileId}/${currentStatus ? 0 : 1}`);
        console.log('BlockTile response:', res.data);
        if (res.data === 'success') {
          setAlertMessage(`Tile ${currentStatus ? 'unblocked' : 'blocked'} successfully.`);
          setShowAlert(true);
          fetchTiles();
        } else {
          setAlertMessage('Failed to update block status.');
          setShowAlert(true);
        }
      } catch (err) {
        console.error('Block Error:', err);
        setAlertMessage('Error while toggling block status.');
        setShowAlert(true);
      } finally {
        setIsLoading(false);
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const getIdFromName = (dataArray, name, idKey, nameKey) => {
    const item = dataArray.find(item => item && item[nameKey] === name);
    const id = item ? item[idKey] : '';
    console.log(`getIdFromName: ${nameKey}=${name}, ${idKey}=${id}`);
    return id;
  };

  const closeAlert = () => {
    console.log('Closing alert');
    setShowAlert(false);
    setAlertMessage('');
  };

  const closeConfirm = (confirm) => {
    console.log('Confirm closed, confirmed:', confirm);
    if (confirm && confirmAction) confirmAction();
    setShowConfirm(false);
    setConfirmMessage('');
    setConfirmAction(() => {});
    setTempFormData(null);
  };

  const handleSearchChange = (key, value) => {
    console.log(`Search change: ${key}=${value}`);
    setColumnSearches((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleGlobalSearchChange = (e) => {
    console.log('Global search:', e.target.value);
    setGlobalSearch(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    console.log('Sorting by:', key);
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  };

  const getSortedAndFilteredTiles = () => {
    let filteredTiles = [...tiles];

    if (globalSearch) {
      filteredTiles = filteredTiles.filter((tile) =>
        Object.values(tile).some((value) =>
          String(value).toLowerCase().includes(globalSearch)
        )
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
        if (!isNaN(aVal) && !isNaN(bVal)) {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return sortConfig.direction === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return filteredTiles;
  };

  const paginatedTiles = () => {
    const filteredTiles = getSortedAndFilteredTiles();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredTiles.slice(indexOfFirstItem, indexOfLastItem);
  };

  const totalPages = Math.ceil(getSortedAndFilteredTiles().length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex flex-col flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Products</h1>
            <Breadcrumbs currentPage="Products" />
          </div>
          <div className="mt-5">
            <div className="flex justify-between items-center mb-5">
              <input
                type="text"
                placeholder="Search Product Name..."
                className="border p-2 rounded w-1/3"
                value={globalSearch}
                onChange={handleGlobalSearchChange}
              />
               <Link
                to="/add-tile"
                className="bg-green-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 flex items-center"
                onClick={() => console.log('Navigating to /add-tile')}
              >
                <FaPlus className="mr-2" /> Add Product
              </Link>
            </div>
            {message && (
              <div className="mb-6 text-sm text-center text-green-600 bg-green-100 p-3 rounded-md">
                {message}
              </div>
            )}
            {isLoading && <div className="text-center text-gray-600">Loading...</div>}
            
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center">
                  <span className="mr-2">Show Entries:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border p-1 rounded"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                  <thead className="bg-green-100 text-gray-800">
                    <tr>
                      {['sku_name', 'sku_code', 'cat_name', 'app_name', 'space_name', 'size_name', 'finish_name', 'color_name', 'actions'].map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2 font-semibold text-left"
                        >
                          {key === 'actions' ? 'Actions' : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          {key !== 'actions' && (
                            <div className="flex items-center">
                              <input
                                type="text"
                                placeholder={`Search ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                                value={columnSearches[key]}
                                onChange={(e) => handleSearchChange(key, e.target.value)}
                                className="mt-2 w-full border p-1 rounded text-sm"
                              />
                              <div className="ml-2">
                                <FaSortUp
                                  onClick={() => handleSort(key)}
                                  className={`cursor-pointer ${sortConfig.key === key && sortConfig.direction === 'asc' ? 'text-blue-600' : ''}`}
                                />
                                <FaSortDown
                                  onClick={() => handleSort(key)}
                                  className={`cursor-pointer -mt-1 ${sortConfig.key === key && sortConfig.direction === 'desc' ? 'text-blue-600' : ''}`}
                                />
                              </div>
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedTiles().map((tile, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tile.sku_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tile.sku_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tile.cat_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tile.app_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tile.space_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tile.size_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tile.finish_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tile.color_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-4">
                          <button
                            onClick={() => handleEditClick(tile)}
                            className="text-yellow-500 hover:text-yellow-700"
                            disabled={isLoading}
                            aria-label="Edit Tile"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleBlockToggle(tile.tile_id, tile.block)}
                            className="text-red-600 hover:text-red-800 transition duration-150"
                            disabled={isLoading}
                            aria-label={tile.block ? 'Unblock Tile' : 'Block Tile'}
                          >
                            {tile.block ? <FaCheck /> : <FaBan />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm">
                  Showing {paginatedTiles().length} of {getSortedAndFilteredTiles().length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    <FaAngleLeft />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded ${currentPage === number ? 'bg-green-600 text-white' : 'bg-gray-300'}`}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
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
        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md">
              <p className="mb-4 text-lg font-semibold">{alertMessage}</p>
              <button
                onClick={closeAlert}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        )}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md">
              <p className="mb-4 text-lg font-semibold">{confirmMessage}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => closeConfirm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => closeConfirm(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
