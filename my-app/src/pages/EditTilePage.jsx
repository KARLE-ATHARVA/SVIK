import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';
import axios from 'axios';
import { FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';

const baseURL = process.env.REACT_APP_API_BASE_URL;

/* -------------------- HELPERS -------------------- */
const getNameById = (list, idKey, nameKey, id) =>
  list.find(x => x[idKey] === Number(id))?.[nameKey] || '';

const mapIdByName = (list, idKey, nameKey, value) =>
  list.find(x => x[nameKey] === value)?.[idKey] || '';

/* -------------------- COMPONENT -------------------- */
export default function EditTilePage() {
  const navigate = useNavigate();
  const { tileId } = useParams();
  const userId = localStorage.getItem('userid');

  const [isLoading, setIsLoading] = useState(false);
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

  /* -------------------- LOAD MASTER DATA -------------------- */
  useEffect(() => {
    if (!baseURL) {
      toast.error('API base URL not configured');
      return;
    }

    const loadMasters = async () => {
      try {
        const [
          categories,
          applications,
          spaces,
          sizes,
          finishes,
          colors
        ] = await Promise.all([
          axios.get(`${baseURL}/GetCategoryList`),
          axios.get(`${baseURL}/GetApplicationList`),
          axios.get(`${baseURL}/GetSpaceList`),
          axios.get(`${baseURL}/GetSizeList`),
          axios.get(`${baseURL}/GetFinishList`),
          axios.get(`${baseURL}/GetColorList`)
        ]);

        setReferenceData({
          categories: categories.data,
          applications: applications.data,
          spaces: spaces.data,
          sizes: sizes.data,
          finishes: finishes.data,
          colors: colors.data
        });
      } catch {
        toast.error('Failed to load master data');
      }
    };

    loadMasters();
  }, []);

  /* -------------------- LOAD TILE DATA -------------------- */
useEffect(() => {
  if (!referenceData.categories.length || !tileId) return;

  const fetchTile = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseURL}/GetTileBySku`, {
        params: { skuCode: tileId }
      });

      const tile = res.data; // ✅ already single object

      setFormData({
        TileId: tile.tile_id,
        SkuName: tile.sku_name,
        SkuCode: tile.sku_code,
        CatId: mapIdByName(referenceData.categories, 'cat_id', 'cat_name', tile.cat_name),
        AppId: mapIdByName(referenceData.applications, 'app_id', 'app_name', tile.app_name),
        SpaceId: mapIdByName(referenceData.spaces, 'space_id', 'space_name', tile.space_name),
        SizeId: mapIdByName(referenceData.sizes, 'size_id', 'size_name', tile.size_name),
        FinishId: mapIdByName(referenceData.finishes, 'finish_id', 'finish_name', tile.finish_name),
        ColorId: mapIdByName(referenceData.colors, 'color_id', 'color_name', tile.color_name),
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
    } catch (err) {
      toast.error('Tile not found');
    } finally {
      setIsLoading(false);
    }
  };

  fetchTile();
}, [referenceData, tileId]);


  /* -------------------- HANDLERS -------------------- */
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (formData.SkuName.trim().length < 2) errors.SkuName = 'Min 2 characters';
    if (!/^[a-zA-Z0-9-]+$/.test(formData.SkuCode)) errors.SkuCode = 'Invalid SKU Code';

    ['Cat', 'App', 'Space', 'Size', 'Finish', 'Color'].forEach(key => {
      if (!formData[`${key}Id`] && rawNames[`${key}Name`]) {
        errors[`${key}Id`] = `"${rawNames[`${key}Name`]}" does not exist`;
      }
    });

    setValidationErrors(errors);
    return !Object.keys(errors).length;
  };

  const handleSubmit = e => {
    e.preventDefault();
    setIsSubmitted(true);
    if (validateForm()) setShowConfirm(true);
  };

  const editTile = async () => {
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
      payload.append('RequestBy', userId || '');

      Object.entries({
        Cat: 'categories',
        App: 'applications',
        Space: 'spaces',
        Size: 'sizes',
        Finish: 'finishes',
        Color: 'colors'
      }).forEach(([k, list]) => {
        payload.append(
          `${k}Name`,
          getNameById(referenceData[list], `${k.toLowerCase()}_id`, `${k.toLowerCase()}_name`, formData[`${k}Id`])
        );
      });

      setIsLoading(true);
      const res = await axios.post(`${baseURL}/EditTile`, payload);

      if (res.data === 'success') toast.success('Updated successfully');
      else if (res.data === 'alreadyexists') toast.error('Tile already exists');
      else toast.error(res.data);
    } catch {
      toast.error('Update failed');
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  /* -------------------- JSX -------------------- */
//   return (
//     <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Topbar />
//         <div className="flex-1 overflow-y-auto p-5">
//           <Breadcrumbs currentPage="Edit Tile" />
//           {/* UI unchanged */}
//         </div>
//       </div>
//     </div>
//   );
// }


  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-5">
          <Breadcrumbs currentPage="Edit Tile" />

          <div className="flex justify-center items-start px-4 py-4">
            <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                            p-6 flex flex-col border border-gray-200 dark:border-gray-700 
                            overflow-y-auto max-h-[calc(100vh-150px)]">
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                Edit Tile
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Update the details below to edit the tile record. All fields are required.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* SKU Name */}
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
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                                 text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                                 focus:ring-2 focus:ring-green-500"
                      required
                    />
                    {isSubmitted && validationErrors.SkuName && (
                      <p className="mt-1 text-xs text-orange-600">{validationErrors.SkuName}</p>
                    )}
                  </div>

                  {/* SKU Code */}
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
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                                 text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                                 focus:ring-2 focus:ring-green-500"
                      required
                    />
                    {isSubmitted && validationErrors.SkuCode && (
                      <p className="mt-1 text-xs text-orange-600">{validationErrors.SkuCode}</p>
                    )}
                  </div>

                  {/* Category */}
               <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Category <span className="text-red-500">*</span>
  </label>

  <select
    name="CatId"
    value={formData.CatId}
    onChange={handleChange}
    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
               text-gray-900 dark:text-white bg-white dark:bg-gray-700 
               focus:ring-2 focus:ring-green-500"
    required
  >
    <option value="">Select Category</option>

    {/* Fallback for bulk-imported / missing master */}
    {formData.CatId === '' && rawNames.CatName && (
      <option value="" disabled>
        ⚠ {rawNames.CatName}
      </option>
    )}

    {referenceData.categories.map((c) => (
      <option key={c.cat_id} value={c.cat_id}>
        {c.cat_name}
      </option>
    ))}
  </select>

  {isSubmitted && validationErrors.CatId && (
    <p className="mt-1 text-xs text-orange-600">
      {validationErrors.CatId}
    </p>
  )}
</div>



                  {/* Application */}
                <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Application <span className="text-red-500">*</span>
  </label>

  <select
    name="AppId"
    value={formData.AppId}
    onChange={handleChange}
    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
               text-gray-900 dark:text-white bg-white dark:bg-gray-700 
               focus:ring-2 focus:ring-green-500"
    required
  >
    <option value="">Select Application</option>

    {formData.AppId === '' && rawNames.AppName && (
      <option value="" disabled>
        ⚠ {rawNames.AppName}
      </option>
    )}

    {referenceData.applications.map(a => (
      <option key={a.app_id} value={a.app_id}>
        {a.app_name}
      </option>
    ))}
  </select>

  {isSubmitted && validationErrors.AppId && (
    <p className="mt-1 text-xs text-orange-600">
      {validationErrors.AppId}
    </p>
  )}
</div>


                  {/* Space */}
             <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Space <span className="text-red-500">*</span>
  </label>

  <select
    name="SpaceId"
    value={formData.SpaceId}
    onChange={handleChange}
    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
               text-gray-900 dark:text-white bg-white dark:bg-gray-700 
               focus:ring-2 focus:ring-green-500"
    required
  >
    <option value="">Select Space</option>

    {formData.SpaceId === '' && rawNames.SpaceName && (
      <option value="" disabled>
        ⚠ {rawNames.SpaceName}
      </option>
    )}

    {referenceData.spaces.map(s => (
      <option key={s.space_id} value={s.space_id}>
        {s.space_name}
      </option>
    ))}
  </select>

  {isSubmitted && validationErrors.SpaceId && (
    <p className="mt-1 text-xs text-orange-600">
      {validationErrors.SpaceId}
    </p>
  )}
</div>


                  {/* Size */}
             <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Size <span className="text-red-500">*</span>
  </label>

  <select
    name="SizeId"
    value={formData.SizeId}
    onChange={handleChange}
    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
               text-gray-900 dark:text-white bg-white dark:bg-gray-700 
               focus:ring-2 focus:ring-green-500"
    required
  >
    <option value="">Select Size</option>

    {formData.SizeId === '' && rawNames.SizeName && (
      <option value="" disabled>
        ⚠ {rawNames.SizeName}
      </option>
    )}

    {referenceData.sizes.map(sz => (
      <option key={sz.size_id} value={sz.size_id}>
        {sz.size_name}
      </option>
    ))}
  </select>

  {isSubmitted && validationErrors.SizeId && (
    <p className="mt-1 text-xs text-orange-600">
      {validationErrors.SizeId}
    </p>
  )}
</div>


                  {/* Finish */}
              <div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Finish <span className="text-red-500">*</span>
  </label>

  <select
    name="FinishId"
    value={formData.FinishId}
    onChange={handleChange}
    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
               text-gray-900 dark:text-white bg-white dark:bg-gray-700 
               focus:ring-2 focus:ring-green-500"
    required
  >
    <option value="">Select Finish</option>

    {formData.FinishId === '' && rawNames.FinishName && (
      <option value="" disabled>
        ⚠ {rawNames.FinishName}
      </option>
    )}

    {referenceData.finishes.map(f => (
      <option key={f.finish_id} value={f.finish_id}>
        {f.finish_name}
      </option>
    ))}
  </select>

  {isSubmitted && validationErrors.FinishId && (
    <p className="mt-1 text-xs text-orange-600">
      {validationErrors.FinishId}
    </p>
  )}
</div>

                  {/* Color */}
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Color <span className="text-red-500">*</span>
  </label>

  <select
    name="ColorId"
    value={formData.ColorId}
    onChange={handleChange}
    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
               text-gray-900 dark:text-white bg-white dark:bg-gray-700 
               focus:ring-2 focus:ring-green-500"
    required
  >
    <option value="">Select Color</option>

    {formData.ColorId === '' && rawNames.ColorName && (
      <option value="" disabled>
        ⚠ {rawNames.ColorName}
      </option>
    )}

    {referenceData.colors.map(c => (
      <option key={c.color_id} value={c.color_id}>
        {c.color_name}
      </option>
    ))}
  </select>

  {isSubmitted && validationErrors.ColorId && (
    <p className="mt-1 text-xs text-orange-600">
      {validationErrors.ColorId}
    </p>
  )}
</div>
{/* Faces */}
<div>
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    Faces
  </label>

  <input
    type="number"
    name="Faces"
    min="0"
    value={formData.Faces}
    onChange={handleChange}
    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md
               text-gray-900 dark:text-white bg-white dark:bg-gray-700
               focus:ring-2 focus:ring-green-500"
    placeholder="Enter number of faces"
  />
</div>


</div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-1 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md 
                             text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                             hover:bg-gray-50 dark:hover:bg-gray-600"
                  disabled={isLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm 
                             focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center w-[90%] max-w-md">
            <p className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              Are you sure you want to save changes to this tile?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={editTile}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loader */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="text-white text-lg font-semibold animate-pulse">
            Loading...
          </div>
        </div>
      )}
    </div>
  </div>
);
}
