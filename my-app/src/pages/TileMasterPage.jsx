import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';
import axios from 'axios';
import { FaPlus, FaEdit, FaCheck, FaAngleLeft, FaAngleRight, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://svikinfotech.com/clients/visualizer/api';
const thumbImageBaseURL = 'http://svikinfotech-001-site25.jtempurl.com/assets/media/thumb/';
const fallbackUrl = "https://vyr.svikinfotech.in/assets/media/no-image.jpg";  // YOUR PLACEHOLDER IMAGE

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96">
        <p className="mb-4 text-gray-800 dark:text-gray-200">{message}</p>
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
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

// Image loader hook
const useImageLoader = (src) => {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!src) {
      setStatus("error");
      return;
    }

    const img = new Image();
    img.onload = () => setStatus("loaded");
    img.onerror = () => setStatus("error");
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return status;
};

// Get product image URL
const getThumbImageUrl = (tile) => {
  if (!tile) return null;

  if (tile.thumb_image && tile.thumb_image.trim() !== "") {
    return `${thumbImageBaseURL}${tile.thumb_image}`;
  }
  if (tile.image && tile.image.trim() !== "") {
    return `${thumbImageBaseURL}${tile.image}`;
  }
  if (tile.sku_code && tile.sku_code.trim() !== "") {
    return `${thumbImageBaseURL}${tile.sku_code}.jpg`;
  }
  return null;
};

// FINAL TileImage Component
const TileImage = ({ tile }) => {
  const mainUrl = getThumbImageUrl(tile);
  const urlToLoad = mainUrl || fallbackUrl;   // fallback directly used

  const status = useImageLoader(urlToLoad);

  if (status === "loaded") {
    return (
      <img
        src={urlToLoad}
        alt={tile?.sku_name || "Tile Image"}
        className="w-12 h-12 object-cover rounded"
      />
    );
  }

  if (status === "error") {
    return (
      <img
        src={fallbackUrl}
        alt="No Image"
        className="w-12 h-12 object-cover rounded"
      />
    );
  }

  return (
    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
      <div className="animate-pulse text-gray-400 text-xs">Loading...</div>
    </div>
  );
};

export default function TileMasterPage() {
  const [tiles, setTiles] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  const [columnSearches, setColumnSearches] = useState({
    sku_code: '',
    sku_name: '',
    app_name: '',
    finish_name: '',
    color_name: '',
    image: '',
  });
  const [globalSearch, setGlobalSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTiles();
  }, []);

  const fetchTiles = async () => {
    setIsLoading(true);
    try {
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');
      const res = await axios.get(`${normalizedBaseURL}/GetTileList`);

      let tilesData = [];

      if (Array.isArray(res.data)) tilesData = res.data;
      else if (res.data?.tiles) tilesData = res.data.tiles;
      else if (res.data?.data?.tiles) tilesData = res.data.data.tiles;
      else if (res.data?.data) tilesData = res.data.data ?? [];

      setTiles(tilesData);
    } catch (err) {
      toast.error('Failed to fetch tiles');
      setError('Failed to fetch tiles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (tile) => navigate(`/edit-tile/${tile.tile_id}`);
  const handleViewDetails = (tile) => navigate(`/view-tile/${tile.sku_code}`);

  const handleBlockToggle = (tileId, currentStatus) => {
    setConfirmMessage(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this tile?`);

    setConfirmAction(() => async () => {
      try {
        setIsLoading(true);
        const normalizedBaseURL = baseURL.replace(/\/+$/, '');
        const res = await axios.get(
          `${normalizedBaseURL}/BlockTile/${userId}/${tileId}/${currentStatus ? 0 : 1}`
        );

        if (res.data === 'success') {
          toast.success("Tile updated!");
          fetchTiles();
        } else {
          toast.error('Update failed');
        }
      } catch (err) {
        toast.error('Error updating tile');
      } finally {
        setIsLoading(false);
        setShowConfirm(false);
      }
    });

    setShowConfirm(true);
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
      filteredTiles.sort((a, b) =>
        sortConfig.direction === 'ascending'
          ? String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]))
          : String(b[sortConfig.key]).localeCompare(String(a[sortConfig.key]))
      );
    }

    return filteredTiles;
  };

  const filteredTiles = getSortedAndFilteredTiles();
  const totalPages = Math.ceil(filteredTiles.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentTiles = filteredTiles.slice(indexOfFirst, indexOfLast);

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

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-green-100 dark:bg-green-900 text-gray-800 dark:text-gray-200 sticky top-0">
                  <tr>
                    {['sku_code', 'sku_name', 'app_name', 'finish_name', 'color_name', 'image', 'actions'].map((key) => (
                      <th key={key} className="px-4 py-2 font-semibold text-left">
                        {key.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-200">
                  {currentTiles.map((tile, index) => (
                    <tr key={index} className="hover:bg-green-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-2">{tile.sku_code}</td>
                      <td className="px-4 py-2">{tile.sku_name}</td>
                      <td className="px-4 py-2">{tile.app_name}</td>
                      <td className="px-4 py-2">{tile.finish_name}</td>
                      <td className="px-4 py-2">{tile.color_name}</td>

                      <td className="px-4 py-2">
                        <TileImage tile={tile} />
                      </td>

                      <td className="px-4 py-2 flex space-x-2">
                        <button onClick={() => handleEditClick(tile)} className="text-yellow-500">
                          <FaEdit size={18} />
                        </button>
                        <button onClick={() => handleBlockToggle(tile.tile_id, tile.block)} className="text-red-500">
                          {tile.block ? <FaCheck size={18} /> : <FaTrash size={18} />}
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            <div className="flex justify-between mt-4 text-sm">
              <span>
                Showing {filteredTiles.length === 0 ? 0 : indexOfFirst + 1} to{' '}
                {Math.min(indexOfLast, filteredTiles.length)} of {filteredTiles.length} entries
              </span>

              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded"
                >
                  <FaAngleLeft />
                </button>

                {[...Array(totalPages).keys()].map((num) => (
                  <button
                    key={num + 1}
                    onClick={() => setCurrentPage(num + 1)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === num + 1 ? 'bg-green-600 text-white' : ''
                    }`}
                  >
                    {num + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded"
                >
                  <FaAngleRight />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

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
