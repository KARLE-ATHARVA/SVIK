import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';
import { FaEdit, FaTrash, FaPlus, FaSortUp, FaSortDown } from 'react-icons/fa';

const initialFormState = {
  tile_id: '',
  sku_name: '',
  sku_code: '',
  cat_id: '',
  cat_name: '',
  app_id: '',
  app_name: '',
  space_id: '',
  space_name: '',
  size_id: '',
  size_name: '',
  finish_id: '',
  finish_name: '',
  color_id: '',
  color_name: '',
  block: '',
  created_by: '',
  created_date: '',
  modify_by: '',
  modify_date: '',
};

function TileModal({ initialData, onClose, onSave }) {
  const [formData, setFormData] = useState(initialData || initialFormState);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({ ...formData, tile_id: initialData ? formData.tile_id : Date.now() });
    setShowConfirmSave(false);
  };

  const confirmClose = () => {
    onClose();
    setShowConfirmCancel(false);
  };

  const cancelClose = () => {
    setShowConfirmCancel(false);
  };

  const cancelSave = () => {
    setShowConfirmSave(false);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white p-6 rounded-lg w-[90%] max-w-4xl">
          <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Tile' : 'Add Tile'}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowConfirmSave(true);
            }}
          >
            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {Object.keys(initialFormState).map((key) => (
                key !== 'tile_id' && key !== 'created_date' && key !== 'modify_date' && (
                  <div key={key} className="flex flex-col">
                    <label className="capitalize text-sm mb-1">{key.replace(/_/g, ' ')}</label>
                    <input
                      required
                      type="text"
                      name={key}
                      value={formData[key] || ''}
                      onChange={handleInputChange}
                      className="border p-2 rounded"
                    />
                  </div>
                )
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowConfirmCancel(true)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {showConfirmSave && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center w-[90%] max-w-md">
            <p className="mb-4 text-lg">Are you sure you want to save this tile?</p>
            <div className="flex justify-center gap-6">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleSave}
              >
                Yes, Save
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={cancelSave}
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center w-[90%] max-w-md">
            <p className="mb-4 text-lg">Discard tile entry?</p>
            <div className="flex justify-center gap-6">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={confirmClose}
              >
                Yes, Discard
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={cancelClose}
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TileMasterPage() {
  const [tiles, setTiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});

  const columns = [
    { key: 'tile_id', label: 'Tile ID' },
    { key: 'sku_name', label: 'SKU Name' },
    { key: 'sku_code', label: 'SKU Code' },
    { key: 'cat_name', label: 'Category Name' },
    { key: 'app_name', label: 'Application Name' },
    { key: 'space_name', label: 'Space Name' },
    { key: 'size_name', label: 'Size Name' },
    { key: 'finish_name', label: 'Finish Name' },
    { key: 'color_name', label: 'Color Name' },
    { key: 'block', label: 'Block' },
  ];

  useEffect(() => {
    const dummyTiles = [
      {
        tile_id: 1, sku_name: 'Matte Marble', sku_code: 'MM001', cat_id: 10, cat_name: 'Marble',
        app_id: 101, app_name: 'Wall', space_id: 201, space_name: 'Bathroom', size_id: 301, size_name: '600x600',
        finish_id: 401, finish_name: 'Matte', color_id: 501, color_name: 'White', block: 'N',
        created_by: 'Admin', created_date: '2024-07-01', modify_by: 'Admin', modify_date: '2024-07-10'
      },
      {
        tile_id: 2, sku_name: 'Glossy Granite', sku_code: 'GG002', cat_id: 11, cat_name: 'Granite',
        app_id: 102, app_name: 'Floor', space_id: 202, space_name: 'Kitchen', size_id: 302, size_name: '800x800',
        finish_id: 402, finish_name: 'Glossy', color_id: 502, color_name: 'Black', block: 'Y',
        created_by: 'Editor', created_date: '2024-06-20', modify_by: 'Admin', modify_date: '2024-07-05'
      },
      {
        tile_id: 3, sku_name: 'Textured Slate', sku_code: 'TS003', cat_id: 12, cat_name: 'Slate',
        app_id: 103, app_name: 'Outdoor', space_id: 203, space_name: 'Balcony', size_id: 303, size_name: '1200x600',
        finish_id: 403, finish_name: 'Textured', color_id: 503, color_name: 'Grey', block: 'N',
        created_by: 'User', created_date: '2024-05-15', modify_by: 'User', modify_date: '2024-06-15'
      },
      {
        tile_id: 4, sku_name: 'Satin Stone', sku_code: 'SS004', cat_id: 13, cat_name: 'Stone',
        app_id: 104, app_name: 'Wall', space_id: 204, space_name: 'Living Room', size_id: 304, size_name: '600x300',
        finish_id: 404, finish_name: 'Satin', color_id: 504, color_name: 'Beige', block: 'N',
        created_by: 'Admin', created_date: '2024-05-01', modify_by: 'Admin', modify_date: '2024-05-10'
      },
      {
        tile_id: 5, sku_name: 'Glossy White', sku_code: 'GW005', cat_id: 14, cat_name: 'Ceramic',
        app_id: 101, app_name: 'Wall', space_id: 205, space_name: 'Toilet', size_id: 301, size_name: '600x600',
        finish_id: 402, finish_name: 'Glossy', color_id: 501, color_name: 'White', block: 'Y',
        created_by: 'Manager', created_date: '2024-04-20', modify_by: 'Admin', modify_date: '2024-04-25'
      },
      {
        tile_id: 6, sku_name: 'Rustic Clay', sku_code: 'RC006', cat_id: 15, cat_name: 'Clay',
        app_id: 102, app_name: 'Floor', space_id: 206, space_name: 'Porch', size_id: 305, size_name: '450x450',
        finish_id: 405, finish_name: 'Rustic', color_id: 505, color_name: 'Red', block: 'N',
        created_by: 'Admin', created_date: '2024-03-30', modify_by: 'Admin', modify_date: '2024-04-10'
      },
      {
        tile_id: 7, sku_name: 'Glossy Pearl', sku_code: 'GP007', cat_id: 16, cat_name: 'Porcelain',
        app_id: 101, app_name: 'Wall', space_id: 207, space_name: 'Bedroom', size_id: 302, size_name: '800x800',
        finish_id: 402, finish_name: 'Glossy', color_id: 506, color_name: 'Pearl', block: 'Y',
        created_by: 'Editor', created_date: '2024-03-15', modify_by: 'Editor', modify_date: '2024-03-20'
      },
      {
        tile_id: 8, sku_name: 'Matte Blue Sky', sku_code: 'MB008', cat_id: 17, cat_name: 'Ceramic',
        app_id: 103, app_name: 'Outdoor', space_id: 208, space_name: 'Terrace', size_id: 306, size_name: '300x300',
        finish_id: 401, finish_name: 'Matte', color_id: 507, color_name: 'Sky Blue', block: 'N',
        created_by: 'Designer', created_date: '2024-02-25', modify_by: 'Admin', modify_date: '2024-03-01'
      },
      {
        tile_id: 9, sku_name: 'Satin Ash', sku_code: 'SA009', cat_id: 18, cat_name: 'Vinyl',
        app_id: 102, app_name: 'Floor', space_id: 209, space_name: 'Lobby', size_id: 307, size_name: '900x450',
        finish_id: 404, finish_name: 'Satin', color_id: 508, color_name: 'Ash Grey', block: 'Y',
        created_by: 'User', created_date: '2024-02-01', modify_by: 'User', modify_date: '2024-02-10'
      },
      {
        tile_id: 10, sku_name: 'Stone Edge', sku_code: 'SE010', cat_id: 13, cat_name: 'Stone',
        app_id: 101, app_name: 'Wall', space_id: 210, space_name: 'Foyer', size_id: 308, size_name: '600x1200',
        finish_id: 405, finish_name: 'Rustic', color_id: 509, color_name: 'Brown', block: 'N',
        created_by: 'Manager', created_date: '2024-01-20', modify_by: 'Editor', modify_date: '2024-01-25'
      },
    ];
    setTiles(dummyTiles);
  }, []);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const getSortedTiles = () => {
    let filtered = tiles.filter((tile) =>
      Object.values(tile).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
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

    return filtered.slice(0, entriesToShow);
  };

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  const handleAdd = () => {
    setEditIndex(null);
    setShowModal(true);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDelete = (index) => {
    setConfirmAction(() => () => {
      const newTiles = [...tiles];
      newTiles.splice(index, 1);
      setTiles(newTiles);
      setShowConfirm(false);
    });
    setShowConfirm(true);
  };

  const handleSave = (tileData) => {
    const newTiles = [...tiles];
    if (editIndex !== null) {
      newTiles[editIndex] = tileData;
    } else {
      newTiles.push(tileData);
    }
    setTiles(newTiles);
    setShowModal(false);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <div className="p-4">
          <Breadcrumbs currentPage="Tile Master" />

          <div className="flex justify-between items-center my-4">
            <h2 className="text-2xl font-semibold">Tile Master</h2>
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <FaPlus className="inline mr-2" /> Add Tile
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              Show
              <select
                className="mx-2 border px-2 py-1"
                value={entriesToShow}
                onChange={(e) => setEntriesToShow(Number(e.target.value))}
              >
                {[5, 10, 15, 20, 25].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              entries
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="border px-2 py-1"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="overflow-auto max-h-[70vh]">
            <table className="min-w-full bg-white border border-gray-50">
              <thead className="bg-green-200">
                <tr>
                  {columns.map(({ key, label }) => (
                    <th key={key} className="px-4 py-2 text-left cursor-pointer whitespace-nowrap">
                      <div className="flex items-center">
                        {label}
                        <div className="ml-1">
                          <FaSortUp onClick={() => handleSort(key, 'asc')} className="cursor-pointer" />
                          <FaSortDown onClick={() => handleSort(key, 'desc')} className="cursor-pointer -mt-1" />
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getSortedTiles().map((tile, index) => (
                  <tr key={index} className="border-t">
                    {columns.map(({ key }) => (
                      <td key={key} className="px-4 py-2 whitespace-nowrap">{tile[key]}</td>
                    ))}
                    <td className="px-4 py-2">
                      <button onClick={() => handleEdit(index)} className="text-blue-600 hover:underline mr-2">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(index)} className="text-red-600 hover:underline">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showModal && (
            <TileModal
              initialData={editIndex !== null ? tiles[editIndex] : null}
              onClose={() => setShowModal(false)}
              onSave={handleSave}
            />
          )}

          {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg text-center w-[90%] max-w-md">
                <p className="mb-4 text-lg">Are you sure you want to delete this tile?</p>
                <div className="flex justify-center gap-6">
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    onClick={confirmAction}
                  >
                    Yes, Delete
                  </button>
                  <button
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    onClick={() => setShowConfirm(false)}
                  >
                    No, Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TileMasterPage;
