// src/pages/AddTilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumbs from '../components/Breadcrumb';
import axios from 'axios';
import { toast } from 'react-toastify';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function AddTilePage() {
  const [formData, setFormData] = useState({
    SkuName: '',
    SkuCode: '',
    CatId: '',
    AppId: '',
    SpaceId: '',
    SizeId: '',
    FinishId: '',
    ColorId: '',
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
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const userId = localStorage.getItem('userid');
  const navigate = useNavigate();
  // 🖼 Image handling 
  const [vyrFinalImages, setVyrFinalImages] = useState([]); // resized files
const [rawImages, setRawImages] = useState([]);
const [uploadDone, setUploadDone] = useState(false);
const [uploadedImages, setUploadedImages] = useState([]); // filenames
const [selectedImages, setSelectedImages] = useState([]);
const [vyrPreviewImages, setVyrPreviewImages] = useState([]);
const [vyrProcessing, setVyrProcessing] = useState(false);
const [replaceImages, setReplaceImages] = useState(false);
const [showReplacePrompt, setShowReplacePrompt] = useState(false);
const [existingBigImages, setExistingBigImages] = useState([]);
const [pendingSave, setPendingSave] = useState(false);



  useEffect(() => {
    fetchReferenceData();
  }, []);

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
      setAlertMessage('Failed to fetch reference data.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      { name: 'SkuName', label: 'SKU Name' },
      { name: 'SkuCode', label: 'SKU Code' },
      { name: 'CatId', label: 'Category' },
      { name: 'AppId', label: 'Application' },
      { name: 'SpaceId', label: 'Space' },
      { name: 'SizeId', label: 'Size' },
      { name: 'FinishId', label: 'Finish' },
      { name: 'ColorId', label: 'Color' }
    ];

    requiredFields.forEach(field => {
      const value = formData[field.name];
      if (!value || value.trim() === '') {
        errors[field.name] = `${field.label} is required.`;
      } else if (field.name === 'SkuCode' && !/^[a-zA-Z0-9-]+$/.test(value)) {
        errors[field.name] = 'SKU Code must contain only letters, numbers, and hyphens.';
      } else if (field.name === 'SkuName' && value.length < 2) {
        errors[field.name] = 'SKU Name must be at least 2 characters long.';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };




  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (validateForm()) {
      setConfirmMessage('Are you sure you want to save this tile?');
      setConfirmAction(() => () => addTile());
      setShowConfirm(true);
    }
  };
  const getCleanVyrSize = () => {
  const sizeName = getSizeName(); // e.g. "600 x 1200 mm"
  if (!sizeName) return "";

  // Extract ONLY numbers like 600 and 1200
  const match = sizeName.match(/(\d+)\s*[xX×]\s*(\d+)/);

  if (!match) {
    console.error("Invalid size format for VYR:", sizeName);
    return "";
  }

  return `${match[1]}X${match[2]}`; // EXACT backend format
};

const checkBigImagesExist = async () => {
  if (rawImages.length === 0) return { exists: false };

  const names = rawImages
    .map(f => f.name.replace(/\.[^/.]+$/, "")) // filename without extension
    .join(",");

  const res = await axios.get(
    `${baseURL}/big-images-exist`,
    { params: { names } }
  );

  return res.data;
};


const getSizeName = () =>
  referenceData.sizes.find(
    x => Number(x.size_id) === Number(formData.SizeId)
  )?.size_name || "";

  const addTile = async (forceReplace = false) => {

  try {
  if (!forceReplace) {
  const existRes = await checkBigImagesExist();

  if (existRes.exists) {
    setExistingBigImages(existRes.found || []);
    setShowReplacePrompt(true);
    return; // ⛔ wait for user
  }
}



setIsLoading(true);


    // -------------------
    // 1️⃣ ADD TILE
    // -------------------
    const tileForm = new FormData();

    const getName = (list, idKey, nameKey, id) =>
  list.find(x => Number(x[idKey]) === Number(id))?.[nameKey] || "";


    tileForm.append("SkuName", formData.SkuName);
    tileForm.append("SkuCode", formData.SkuCode);

    tileForm.append("CatId", formData.CatId);
    tileForm.append("CatName", getName(referenceData.categories, "cat_id", "cat_name", formData.CatId));

    tileForm.append("AppId", formData.AppId);
    tileForm.append("AppName", getName(referenceData.applications, "app_id", "app_name", formData.AppId));

    tileForm.append("SpaceId", formData.SpaceId);
    tileForm.append("SpaceName", getName(referenceData.spaces, "space_id", "space_name", formData.SpaceId));

    tileForm.append("SizeId", formData.SizeId);
    tileForm.append("SizeName", getName(referenceData.sizes, "size_id", "size_name", formData.SizeId));

    tileForm.append("FinishId", formData.FinishId);
    tileForm.append("FinishName", getName(referenceData.finishes, "finish_id", "finish_name", formData.FinishId));

    tileForm.append("ColorId", formData.ColorId);
    tileForm.append("ColorName", getName(referenceData.colors, "color_id", "color_name", formData.ColorId));

    tileForm.append("RequestBy", userId || "");

    const tileRes = await axios.post(
      `${baseURL}/AddTile`,
      tileForm
    );

    if (tileRes.data !== "success") {
      toast.error("Tile creation failed");
      return;
    }

    // -------------------
    // 2️⃣ RESIZE IMAGES
    // -------------------
    if (rawImages.length > 0) {
      const imgForm = new FormData();
      rawImages.forEach((f) => imgForm.append("files", f));
      imgForm.append("empcode", userId);
      imgForm.append("replace", forceReplace);


      await axios.post(
        `${baseURL}/resize-folder-avif`,
        imgForm
      );
    }

    // -------------------
// 3️⃣ FINAL VYR
// -------------------
if (vyrFinalImages.length > 0) {
  const vyrForm = new FormData();

  vyrForm.append("name", formData.SkuCode);
 vyrForm.append("size", getCleanVyrSize());

  vyrForm.append("createdBy", Number(userId));
 vyrForm.append("replace", forceReplace);



  vyrFinalImages.forEach((file) =>
    vyrForm.append("images", file)
  );
  
  const cleanSize = getCleanVyrSize();

if (!cleanSize) {
  toast.error("Invalid size format. Please select a valid tile size.");
  return;
}
console.log("VYR FILE COUNT:", vyrFinalImages.length);
console.log("VYR SIZE SENT:", getCleanVyrSize());


  const vyrRes = await axios.post(
    `${baseURL}/single-prod-vyr`,
    vyrForm
  );

  if (
  vyrRes.data?.result?.Processed?.length === 0 &&
  vyrRes.data?.result?.Errors?.length > 0
) {
  toast.error("VYR failed: " + vyrRes.data.result.Errors.join(", "));
  return;
}

}



    toast.success("Tile and images added successfully!");
    navigate(-1);

  } catch (err) {
    console.error("Add tile error:", err);
    toast.error("Failed to add tile");
  } finally {
    setIsLoading(false);
    setReplaceImages(false);
setPendingSave(false);

  }
};


const handleVyrPreview = async (files) => {
  try {
    setVyrProcessing(true);
    toast.info("Preparing image previews…");

    const previews = [];
    const resizedFiles = [];
    const size = getSizeName();

    if (!size) {
      toast.error("Size missing. Cannot generate VYR.");
      return;
    }

    for (const file of files) {
      const form = new FormData();
      form.append("image", file);
      form.append("size", size);

      const res = await axios.post(
        `${baseURL}/resize-vyr`,
        form,
        { responseType: "blob" }
      );

      // 👇 create File from blob
      const resizedFile = new File(
        [res.data],
        file.name.replace(/\.[^/.]+$/, ".png"),
        { type: "image/png" }
      );

      resizedFiles.push(resizedFile);
      previews.push(URL.createObjectURL(resizedFile));
    }

    setVyrFinalImages(resizedFiles);     // ✅ IMPORTANT
    setVyrPreviewImages(previews);       // preview only
    toast.success("Images ready");

  } catch (err) {
    console.error("VYR preview error:", err);
    toast.error("Preview failed");
  } finally {
    setVyrProcessing(false);
  }
};




  const uploadTileImages = async () => {
  try {
    const form = new FormData();

    rawImages.forEach((file) => {
      form.append("files", file);
    });

    form.append("empcode", userId);
    form.append("replace", false);

    toast.info("Uploading & resizing images…");

    const res = await axios.post(
      `${baseURL}/resize-folder-avif`,
      form
    );

    toast.success(res.data.message || "Images processed");

    setUploadDone(true);
    setUploadedImages(res.data.processed || []);
  } catch (err) {
    console.error(err);
    toast.error("Image upload failed");
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

  const dropdownFields = [
    { label: 'Category', name: 'CatId', data: referenceData.categories, idKey: 'cat_id', nameKey: 'cat_name' },
    { label: 'Application', name: 'AppId', data: referenceData.applications, idKey: 'app_id', nameKey: 'app_name' },
    { label: 'Space', name: 'SpaceId', data: referenceData.spaces, idKey: 'space_id', nameKey: 'space_name' },
    { label: 'Size', name: 'SizeId', data: referenceData.sizes, idKey: 'size_id', nameKey: 'size_name' },
    { label: 'Finish', name: 'FinishId', data: referenceData.finishes, idKey: 'finish_id', nameKey: 'finish_name' },
    { label: 'Color', name: 'ColorId', data: referenceData.colors, idKey: 'color_id', nameKey: 'color_name' }
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-5">
          <Breadcrumbs currentPage="Add Tile" />

          <div className="flex justify-center items-start px-4 py-4">
            <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                            p-6 flex flex-col border border-gray-200 dark:border-gray-700 
                            overflow-y-auto max-h-[calc(100vh-150px)]">
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                Add New Tile
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Fill in the details below to create a new tile record. All fields are required.
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

                  {/* Dropdowns */}
                  {dropdownFields.map((field, idx) => (
                    <div key={idx} className="relative overflow-visible">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {field.label} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                                   text-gray-900 dark:text-white bg-white dark:bg-gray-700 
                                   focus:ring-2 focus:ring-green-500 appearance-none 
                                   max-h-48 overflow-y-auto"
                        required
                      >
                        <option value="">Select {field.label}</option>
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
                </div>
                {/* Image Upload */}
<div className="mt-6">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Upload Tile Images (Multiple Faces)
  </label>

 <input
  type="file"
  multiple
  accept="image/jpeg,image/png,image/webp"
  onChange={(e) => {
    const files = Array.from(e.target.files);
    setRawImages(files);
    handleVyrPreview(files);
  }}
/>


  <p className="text-xs text-gray-500 mt-1">
    Upload multiple images of the same tile (different faces).
  </p>
</div>
{vyrPreviewImages.length > 0 && (
  <div className="mt-4">
    <p className="text-sm font-medium mb-2">Image Preview</p>

    <div className="grid grid-cols-4 gap-3">
      {vyrPreviewImages.map((img) => (
        <div key={img} className="border rounded p-1">
          <div className="border rounded p-2 flex items-center justify-center bg-gray-50">
  <img
    src={img}
    alt=""
    className="max-w-full max-h-48 object-contain rounded"
  />
</div>


        </div>
      ))}
    </div>
  </div>
)}



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
                    className="px-4 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm 
                               focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Alert */}
        {showAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center w-[90%] max-w-md">
              <p className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{alertMessage}</p>
              <button
                onClick={closeAlert}
                className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </div>
        )}
{showReplacePrompt && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-[90%] max-w-md">
      <p className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
        Images already exist in Big folder.
      </p>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Do you want to replace them?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
  setReplaceImages(false);
  setShowReplacePrompt(false);
  toast.info("Keeping existing images.");
}}


          className="px-4 py-1 bg-gray-500 text-white rounded-md"
        >
          No
        </button>

        <button
          onClick={() => {
  setReplaceImages(true);
  setShowReplacePrompt(false);
  addTile(true); // ✅ FORCE REPLACE
}}

          className="px-4 py-1 bg-green-600 text-white rounded-md"
        >
          Yes, Replace
        </button>
      </div>
    </div>
  </div>
)}

        {/* Confirm */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center w-[90%] max-w-md">
              <p className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">{confirmMessage}</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => closeConfirm(true)}
                  className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => closeConfirm(false)}
                  className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
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
            <div className="text-white text-lg font-semibold animate-pulse">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
}