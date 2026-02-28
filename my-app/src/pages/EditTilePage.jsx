import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PageLayout from '../components/layout/PageLayout';

const baseURL = process.env.REACT_APP_API_BASE_URL;

const getNameById = (list, idKey, nameKey, id) =>
  list.find((x) => Number(x[idKey]) === Number(id))?.[nameKey] || '';

const mapIdByName = (list, idKey, nameKey, value) =>
  list.find((x) => x[nameKey] === value)?.[idKey] || '';

export default function EditTilePage() {
  const navigate = useNavigate();
  const { tileId } = useParams();
  const userId = localStorage.getItem('userid');
  const normalizedBaseURL = useMemo(() => baseURL.replace(/\/+$/, ''), []);

  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    TileId: '',
    SkuName: '',
    SkuCode: '',
    CatId: '',
    AppId: '',
    SpaceId: '',
    SizeId: '',
    FinishId: '',
    ColorId: '',
    Faces: 0
  });

  const [rawNames, setRawNames] = useState({
    CatName: '',
    AppName: '',
    SpaceName: '',
    SizeName: '',
    FinishName: '',
    ColorName: ''
  });

  const [referenceData, setReferenceData] = useState({
    categories: [],
    applications: [],
    spaces: [],
    sizes: [],
    finishes: [],
    colors: []
  });
  const [tileDataLoaded, setTileDataLoaded] = useState(false);

  useEffect(() => {
    if (!baseURL) {
      toast.error('API base URL not configured');
      return;
    }

    if (!tileId) {
      toast.error('Invalid tile id');
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsPageLoading(true);
      try {
        const mastersPromise = Promise.all([
          axios.get(`${normalizedBaseURL}/GetCategoryList`),
          axios.get(`${normalizedBaseURL}/GetApplicationList`),
          axios.get(`${normalizedBaseURL}/GetSpaceList`),
          axios.get(`${normalizedBaseURL}/GetSizeList`),
          axios.get(`${normalizedBaseURL}/GetFinishList`),
          axios.get(`${normalizedBaseURL}/GetColorList`)
        ]);

        // Load tile first so fields show immediately.
        const tileRes = await axios.get(`${normalizedBaseURL}/GetTileBySku`, { params: { skuCode: tileId } });

        const tile = tileRes.data;
        if (!tile || !tile.sku_code) {
          throw new Error('Tile not found');
        }

        if (!isMounted) return;

        setFormData({
          TileId: tile.tile_id,
          SkuName: tile.sku_name,
          SkuCode: tile.sku_code,
          CatId: '',
          AppId: '',
          SpaceId: '',
          SizeId: '',
          FinishId: '',
          ColorId: '',
          Faces: tile.faces ?? 0
        });

        setRawNames({
          CatName: tile.cat_name,
          AppName: tile.app_name,
          SpaceName: tile.space_name,
          SizeName: tile.size_name,
          FinishName: tile.finish_name,
          ColorName: tile.color_name
        });
        setTileDataLoaded(true);

        const [categoriesRes, applicationsRes, spacesRes, sizesRes, finishesRes, colorsRes] = await mastersPromise;
        if (!isMounted) return;

        const masters = {
          categories: categoriesRes.data || [],
          applications: applicationsRes.data || [],
          spaces: spacesRes.data || [],
          sizes: sizesRes.data || [],
          finishes: finishesRes.data || [],
          colors: colorsRes.data || []
        };

        setReferenceData(masters);
        setFormData((prev) => ({
          ...prev,
          CatId: mapIdByName(masters.categories, 'cat_id', 'cat_name', tile.cat_name),
          AppId: mapIdByName(masters.applications, 'app_id', 'app_name', tile.app_name),
          SpaceId: mapIdByName(masters.spaces, 'space_id', 'space_name', tile.space_name),
          SizeId: mapIdByName(masters.sizes, 'size_id', 'size_name', tile.size_name),
          FinishId: mapIdByName(masters.finishes, 'finish_id', 'finish_name', tile.finish_name),
          ColorId: mapIdByName(masters.colors, 'color_id', 'color_name', tile.color_name)
        }));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load tile details');
      } finally {
        if (isMounted) setIsPageLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [tileId, normalizedBaseURL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};

    if (formData.SkuName.trim().length < 2) errors.SkuName = 'Min 2 characters';
    if (!/^[a-zA-Z0-9-]+$/.test(formData.SkuCode)) errors.SkuCode = 'Invalid SKU Code';

    ['Cat', 'App', 'Space', 'Size', 'Finish', 'Color'].forEach((key) => {
      if (!formData[`${key}Id`] && rawNames[`${key}Name`]) {
        errors[`${key}Id`] = `"${rawNames[`${key}Name`]}" does not exist`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tileDataLoaded) {
      toast.info('Tile details are still loading');
      return;
    }
    setIsSubmitted(true);
    if (validateForm()) setShowConfirm(true);
  };

  const editTile = async () => {
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
      payload.append('RequestBy', userId || '');

      const map = {
        Cat: 'categories',
        App: 'applications',
        Space: 'spaces',
        Size: 'sizes',
        Finish: 'finishes',
        Color: 'colors'
      };

      Object.entries(map).forEach(([k, list]) => {
        payload.append(
          `${k}Name`,
          getNameById(
            referenceData[list],
            `${k.toLowerCase()}_id`,
            `${k.toLowerCase()}_name`,
            formData[`${k}Id`]
          )
        );
      });

      setIsSaving(true);
      const res = await axios.post(`${normalizedBaseURL}/EditTile`, payload);

      if (res.data === 'success') {
        toast.success('Updated successfully');
      } else if (res.data === 'alreadyexists') {
        toast.error('Tile already exists');
      } else {
        toast.error(String(res.data || 'Update failed'));
      }
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    } finally {
      setIsSaving(false);
      setShowConfirm(false);
    }
  };

  const dropdownFields = [
    { label: 'Category', name: 'CatId', rawName: 'CatName', data: referenceData.categories, idKey: 'cat_id', nameKey: 'cat_name' },
    { label: 'Application', name: 'AppId', rawName: 'AppName', data: referenceData.applications, idKey: 'app_id', nameKey: 'app_name' },
    { label: 'Space', name: 'SpaceId', rawName: 'SpaceName', data: referenceData.spaces, idKey: 'space_id', nameKey: 'space_name' },
    { label: 'Size', name: 'SizeId', rawName: 'SizeName', data: referenceData.sizes, idKey: 'size_id', nameKey: 'size_name' },
    { label: 'Finish', name: 'FinishId', rawName: 'FinishName', data: referenceData.finishes, idKey: 'finish_id', nameKey: 'finish_name' },
    { label: 'Color', name: 'ColorId', rawName: 'ColorName', data: referenceData.colors, idKey: 'color_id', nameKey: 'color_name' }
  ];

  return (
    <PageLayout title="Edit Tile">
      <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[75vh] overflow-y-auto">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Update the details below to edit the tile record. All fields are required.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SKU Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="SkuName"
                  value={formData.SkuName}
                  onChange={handleChange}
                  placeholder="Enter SKU Name"
                  className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
                  required
                />
                {isSubmitted && validationErrors.SkuName && (
                  <p className="mt-1 text-xs text-orange-600">{validationErrors.SkuName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SKU Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="SkuCode"
                  value={formData.SkuCode}
                  onChange={handleChange}
                  placeholder="Enter SKU Code"
                  className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
                  required
                />
                {isSubmitted && validationErrors.SkuCode && (
                  <p className="mt-1 text-xs text-orange-600">{validationErrors.SkuCode}</p>
                )}
              </div>

              {dropdownFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label} <span className="text-red-500">*</span>
                  </label>

                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select {field.label}</option>

                    {formData[field.name] === '' && rawNames[field.rawName] && (
                      <option value="" disabled>
                        [Missing] {rawNames[field.rawName]}
                      </option>
                    )}

                    {field.data.map((item) => (
                      <option key={item[field.idKey]} value={item[field.idKey]}>
                        {item[field.nameKey]}
                      </option>
                    ))}
                  </select>

                  {isSubmitted && validationErrors[field.name] && (
                    <p className="mt-1 text-xs text-orange-600">{validationErrors[field.name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Faces</label>
                <input
                  type="number"
                  name="Faces"
                  min="0"
                  max="30"
                  value={formData.Faces}
                  onChange={handleChange}
                  className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500"
                  placeholder="Enter number of faces"
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-1 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
                disabled={isSaving || !tileDataLoaded}
              >
                {isSaving ? 'Saving...' : 'Save'}
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </form>

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center w-[90%] max-w-md">
              <p className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                Are you sure you want to save changes to this tile?
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={editTile} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Yes
                </button>
                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
