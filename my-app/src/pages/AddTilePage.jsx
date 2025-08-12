import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';
import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function AddTilePage() {
  const [formData, setFormData] = useState({
    SkuName: '',
    SkuCode: '',
    CatName: '',
    AppName: '',
    SpaceName: '',
    SizeName: '',
    FinishName: '',
    ColorName: '',
  });
  const [referenceData, setReferenceData] = useState({
    categories: [],
    applications: [],
    spaces: [],
    sizes: [],
    finishes: [],
    colors: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(() => {});
  const userId = localStorage.getItem('userid');
  const navigate = useNavigate();

  // Dark mode state and logic
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

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
    } catch (err) {
      console.error('Reference Data Fetch Error:', err);
      setAlertMessage('Failed to fetch reference data.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getIdFromName = (dataArray, name, idKey, nameKey) => {
    const item = dataArray.find((item) => item && item[nameKey] === name);
    return item ? item[idKey] : '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmMessage('Are you sure you want to save this tile?');
    setConfirmAction(() => () => addTile());
    setShowConfirm(true);
  };

  const addTile = async () => {
    try {
      const payload = new FormData();
      payload.append('SkuName', formData.SkuName);
      payload.append('SkuCode', formData.SkuCode);
      payload.append('CatId', getIdFromName(referenceData.categories, formData.CatName, 'cat_id', 'cat_name'));
      payload.append('CatName', formData.CatName);
      payload.append('AppId', getIdFromName(referenceData.applications, formData.AppName, 'app_id', 'app_name'));
      payload.append('AppName', formData.AppName);
      payload.append('SpaceId', getIdFromName(referenceData.spaces, formData.SpaceName, 'space_id', 'space_name'));
      payload.append('SpaceName', formData.SpaceName);
      payload.append('SizeId', getIdFromName(referenceData.sizes, formData.SizeName, 'size_id', 'size_name'));
      payload.append('SizeName', formData.SizeName);
      payload.append('FinishId', getIdFromName(referenceData.finishes, formData.FinishName, 'finish_id', 'finish_name'));
      payload.append('FinishName', formData.FinishName);
      payload.append('ColorId', getIdFromName(referenceData.colors, formData.ColorName, 'color_id', 'color_name'));
      payload.append('ColorName', formData.ColorName);
      payload.append('RequestBy', userId || '');

      setIsLoading(true);
      const res = await axios.post(`${baseURL}/AddTile`, payload);
      const responseText = res.data;

      if (responseText === 'success') {
        setAlertMessage('Tile saved successfully!');
        setShowAlert(true);
      } else if (responseText === 'alreadyexists') {
        setAlertMessage('Tile already exists!');
        setShowAlert(true);
      } else {
        setAlertMessage(responseText);
        setShowAlert(true);
      }
    } catch (err) {
      console.error('Add Error:', err);
      setAlertMessage('An error occurred while saving tile.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
    setAlertMessage('');
    if (alertMessage === 'Tile saved successfully!') {
      navigate(-1);
    }
  };

  const closeConfirm = (confirm) => {
    if (confirm && confirmAction) confirmAction();
    setShowConfirm(false);
    setConfirmMessage('');
    setConfirmAction(() => {});
  };

  // Validation messages for each field
  const getValidationMessage = (fieldName, value) => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required.`;
    }
    if (fieldName === 'SkuCode' && !/^[a-zA-Z0-9-]+$/.test(value)) {
      return 'SKU Code must contain only letters, numbers, and hyphens.';
    }
    if (fieldName === 'SkuName' && value.length < 2) {
      return 'SKU Name must be at least 2 characters long.';
    }
    return '';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen">
        <Topbar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
        <div className="p-6 flex-1 overflow-hidden">
          <Breadcrumbs currentPage="Add Tile" />
          <div className="mt-5">
            <div className="bg-white shadow-xl rounded-xl p-4 h-full flex flex-col border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <div className="card-header pb- border-b-2 border-indigo-200 dark:border-indigo-600">
                <h5 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Add Tile</h5>
                <p className="text-sm text-gray-500 mb-2 dark:text-gray-400">Fill the form to add a new tile product. All fields are required.</p>
              </div>
              <div className="flex-1 overflow-hidden">
                <form className="theme-form space-y-8 h-full" onSubmit={handleSubmit}>
                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-gray-900">
                    <h6 className="text-lg font-medium text-gray-700 mb-5 dark:text-gray-300">Tile Information</h6>
                    <div className="mb-5 row">
                      <label className="col-sm-3 col-form-label text-right pr-4 text-gray-700 font-medium dark:text-gray-300" htmlFor="SkuName">SKU Name</label>
                      <div className="col-sm-9">
                        <input
                          className="form-control w-full border-2 border-gray-200 rounded-lg p-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:border-indigo-500"
                          id="SkuName"
                          type="text"
                          placeholder="Enter SKU Name"
                          name="SkuName"
                          value={formData.SkuName}
                          onChange={handleChange}
                          required
                        />
                        {getValidationMessage('SKU Name', formData.SkuName) && (
                          <div className="mt-1 text-sm text-orange-600 flex items-center">
                            <span className="mr-1">⚠</span>
                            {getValidationMessage('SKU Name', formData.SkuName)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <label className="col-sm-3 col-form-label text-right pr-4 text-gray-700 font-medium dark:text-gray-300" htmlFor="SkuCode">SKU Code</label>
                      <div className="col-sm-9">
                        <input
                          className="form-control w-full border-2 border-gray-200 rounded-lg p-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:border-indigo-500"
                          id="SkuCode"
                          type="text"
                          placeholder="Enter SKU Code"
                          name="SkuCode"
                          value={formData.SkuCode}
                          onChange={handleChange}
                          required
                        />
                        {getValidationMessage('SKU Code', formData.SkuCode) && (
                          <div className="mt-1 text-sm text-orange-600 flex items-center">
                            <span className="mr-1">⚠</span>
                            {getValidationMessage('SKU Code', formData.SkuCode)}
                          </div>
                        )}
                      </div>
                    </div>
                    <hr className="border-t-2 border-gray-200 my-6 dark:border-gray-600" />
                    <h6 className="text-lg font-medium text-gray-700 mb-5 dark:text-gray-300">Tile Attributes</h6>
                    <div className="mb-5 row">
                      <label className="col-sm-3 col-form-label text-right pr-4 text-gray-700 font-medium dark:text-gray-300" htmlFor="CatName">Category</label>
                      <div className="col-sm-9">
                        <select
                          className="form-control w-full border-2 border-gray-200 rounded-lg p-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:border-indigo-500"
                          id="CatName"
                          name="CatName"
                          value={formData.CatName}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Category</option>
                          {referenceData.categories.map((item) => (
                            <option key={item.cat_id} value={item.cat_name}>
                              {item.cat_name}
                            </option>
                          ))}
                        </select>
                        {getValidationMessage('Category', formData.CatName) && (
                          <div className="mt-1 text-sm text-orange-600 flex items-center">
                            <span className="mr-1">⚠</span>
                            {getValidationMessage('Category', formData.CatName)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <label className="col-sm-3 col-form-label text-right pr-4 text-gray-700 font-medium dark:text-gray-300" htmlFor="AppName">Application</label>
                      <div className="col-sm-9">
                        <select
                          className="form-control w-full border-2 border-gray-200 rounded-lg p-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:border-indigo-500"
                          id="AppName"
                          name="AppName"
                          value={formData.AppName}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Application</option>
                          {referenceData.applications.map((item) => (
                            <option key={item.app_id} value={item.app_name}>
                              {item.app_name}
                            </option>
                          ))}
                        </select>
                        {getValidationMessage('Application', formData.AppName) && (
                          <div className="mt-1 text-sm text-orange-600 flex items-center">
                            <span className="mr-1">⚠</span>
                            {getValidationMessage('Application', formData.AppName)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <label className="col-sm-3 col-form-label text-right pr-4 text-gray-700 font-medium dark:text-gray-300" htmlFor="SpaceName">Space</label>
                      <div className="col-sm-9">
                        <select
                          className="form-control w-full border-2 border-gray-200 rounded-lg p-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:border-indigo-500"
                          id="SpaceName"
                          name="SpaceName"
                          value={formData.SpaceName}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Space</option>
                          {referenceData.spaces.map((item) => (
                            <option key={item.space_id} value={item.space_name}>
                              {item.space_name}
                            </option>
                          ))}
                        </select>
                        {getValidationMessage('Space', formData.SpaceName) && (
                          <div className="mt-1 text-sm text-orange-600 flex items-center">
                            <span className="mr-1">⚠</span>
                            {getValidationMessage('Space', formData.SpaceName)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <label className="col-sm-3 col-form-label text-right pr-4 text-gray-700 font-medium dark:text-gray-300" htmlFor="SizeName">Size</label>
                      <div className="col-sm-9">
                        <select
                          className="form-control w-full border-2 border-gray-200 rounded-lg p-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:border-indigo-500"
                          id="SizeName"
                          name="SizeName"
                          value={formData.SizeName}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Size</option>
                          {referenceData.sizes.map((item) => (
                            <option key={item.size_id} value={item.size_name}>
                              {item.size_name}
                            </option>
                          ))}
                        </select>
                        {getValidationMessage('Size', formData.SizeName) && (
                          <div className="mt-1 text-sm text-orange-600 flex items-center">
                            <span className="mr-1">⚠</span>
                            {getValidationMessage('Size', formData.SizeName)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <label className="col-sm-3 col-form-label text-right pr-4 text-gray-700 font-medium dark:text-gray-300" htmlFor="FinishName">Finish</label>
                      <div className="col-sm-9">
                        <select
                          className="form-control w-full border-2 border-gray-200 rounded-lg p-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:border-indigo-500"
                          id="FinishName"
                          name="FinishName"
                          value={formData.FinishName}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Finish</option>
                          {referenceData.finishes.map((item) => (
                            <option key={item.finish_id} value={item.finish_name}>
                              {item.finish_name}
                            </option>
                          ))}
                        </select>
                        {getValidationMessage('Finish', formData.FinishName) && (
                          <div className="mt-1 text-sm text-orange-600 flex items-center">
                            <span className="mr-1">⚠</span>
                            {getValidationMessage('Finish', formData.FinishName)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <label className="col-sm-3 col-form-label text-right pr-4 text-gray-700 font-medium dark:text-gray-300" htmlFor="ColorName">Color</label>
                      <div className="col-sm-9">
                        <select
                          className="form-control w-full border-2 border-gray-200 rounded-lg p-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:border-indigo-500"
                          id="ColorName"
                          name="ColorName"
                          value={formData.ColorName}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Color</option>
                          {referenceData.colors.map((item) => (
                            <option key={item.color_id} value={item.color_name}>
                              {item.color_name}
                            </option>
                          ))}
                        </select>
                        {getValidationMessage('Color', formData.ColorName) && (
                          <div className="mt-1 text-sm text-orange-600 flex items-center">
                            <span className="mr-1">⚠</span>
                            {getValidationMessage('Color', formData.ColorName)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="card-footer p-4 border-t-2 border-gray-100 flex justify-end gap-4 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-700 transition duration-300 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Save
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="btn bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-2 rounded-lg shadow-md hover:from-gray-500 hover:to-gray-600 transition duration-300 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl text-center w-[90%] max-w-md transform transition-all duration-300 dark:bg-gray-800">
              <p className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">{alertMessage}</p>
              <button
                onClick={closeAlert}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition duration-300"
              >
                OK
              </button>
            </div>
          </div>
        )}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl text-center w-[90%] max-w-md transform transition-all duration-300 dark:bg-gray-800">
              <p className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">{confirmMessage}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => closeConfirm(true)}
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-5 py-2 rounded-lg hover:from-green-600 hover:to-teal-700 transition duration-300"
                >
                  Yes
                </button>
                <button
                  onClick={() => closeConfirm(false)}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-5 py-2 rounded-lg hover:from-red-600 hover:to-pink-700 transition duration-300"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-white text-xl font-semibold animate-pulse">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
}