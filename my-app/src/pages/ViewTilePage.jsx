import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Breadcrumb from '../components/Breadcrumb';

// Fallback base URL for API
const baseURL = process.env.REACT_APP_API_BASE_URL ;
const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;
// Base URLs for images
const bigImageBaseURL = `${MEDIA_URL}/big/`;
const thumbImageBaseURL = `${MEDIA_URL}/thumb/`;
const fallbackImageURL = `${MEDIA_URL}/no-image.jpg`;

export default function ViewTilePage() {
  const { tileId } = useParams(); // tileId is expected to be the sku_code
  const [tile, setTile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // const [lightboxImage, setLightboxImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 'auto', height: 'auto' });
  const [availableVariants, setAvailableVariants] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);
const [activeImageName, setActiveImageName] = useState(null);
const editInputRef = React.useRef(null);

useEffect(() => {
  if (!tileId) return;

  const fetchTileDetails = async () => {
    setIsLoading(true);
    setError('');

    try {
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');

      const res = await axios.get(
        `${normalizedBaseURL}/GetTileBySku`,
        { params: { skuCode: tileId } }
      );

      // ✅ BACKEND NOW RETURNS OBJECT DIRECTLY
      if (!res.data || !res.data.sku_code) {
        throw new Error('Tile not found');
      }

      setTile(res.data); // ✅ THIS IS THE FIX
    } catch (err) {
      console.error(err);
      toast.error('Tile not found');
      setError('Tile not found');
    } finally {
      setIsLoading(false);
    }
  };

  fetchTileDetails();
}, [tileId]);


useEffect(() => {
  if (!tile?.sku_code) return;

  let isMounted = true;
  const detectedImages = [];

  setImagesLoading(true); // ✅ START LOADING

  const finish = () => {
    if (isMounted) {
      setAvailableVariants(detectedImages);
      setImagesLoading(false); // ✅ STOP LOADING
    }
  };

  const checkBaseImage = () => {
    const baseName = tile.sku_code;
    const img = new Image();

    img.src = `${thumbImageBaseURL}${baseName}.jpg`;

    img.onload = () => {
      if (!isMounted) return;
      detectedImages.push({
        name: baseName,
        url: `${bigImageBaseURL}${baseName}.jpg`
      });
      checkVariant(1);
    };

    img.onerror = () => {
      checkVariant(1);
    };
  };

  const checkVariant = (index) => {
    const variantName = `${tile.sku_code}-f${index}`;
    const img = new Image();

    img.src = `${thumbImageBaseURL}${variantName}.jpg`;

    img.onload = () => {
      if (!isMounted) return;
      detectedImages.push({
        name: variantName,
        url: `${bigImageBaseURL}${variantName}.jpg`
      });
      checkVariant(index + 1);
    };

    img.onerror = () => {
      finish(); // ✅ END SEARCH HERE
    };
  };

  checkBaseImage();

  return () => {
    isMounted = false;
  };
}, [tile]);




  // Load natural dimensions of the lightbox image, prioritizing actual square size
  useEffect(() => {
    if (lightboxImage) {
      const img = new Image();
      img.src = lightboxImage;
      img.onload = () => {
        const { naturalWidth, naturalHeight } = img;
        // Use the smaller dimension to ensure square shape (should be equal for square images)
        const size = Math.min(naturalWidth, naturalHeight);
        // Constrain to 90% of the smaller viewport dimension to ensure it fits
        const maxSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
        // Use natural size unless it exceeds the viewport
        const finalSize = Math.min(size, maxSize);

        setImageDimensions({ width: `${finalSize}px`, height: `${finalSize}px` });
      };
      img.onerror = () => {
        console.error(`Failed to load lightbox image: ${lightboxImage}`);
        setImageDimensions({ width: '150px', height: '150px' }); // Fallback to square placeholder size
      };
    }
  }, [lightboxImage]);

  // Placeholder for POST API call
  const handlePostAction = async () => {
    if (!tile) return;

    setIsLoading(true);
    setError('');
    try {
      const normalizedBaseURL = baseURL.replace(/\/+$/, '');
      const url = `${normalizedBaseURL}/TileDetails`; // Replace with actual endpoint
      const payload = {
        sku_code: tileId,
        userId: localStorage.getItem('userid'),
      };
      console.log('POST Payload:', payload);
      const res = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
      });
      console.log('POST Response:', res.data);
      toast.success('POST action successful', { autoClose: 5000 });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to perform POST action';
      console.error('POST Error:', err);
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };
  const handleReplaceImage = async (e) => {
  const file = e.target.files[0];
  if (!file || !activeImageName) return;

  try {
    // 1️⃣ Delete old image
    await axios.delete(`${baseURL}/delete-image-jpg`, {
      params: {
        fileNames: `${activeImageName}.jpg`,
        type: "both",
        empcode: Number(localStorage.getItem("userid")) || 0,
      },
    });

    const formData = new FormData();
formData.append("image", file);
formData.append("targetName", activeImageName);
formData.append("empcode", Number(localStorage.getItem("userid")) || 0);

await axios.post(`${baseURL}/replace-image-jpg`, formData, {
  headers: { "Content-Type": "multipart/form-data" },
  timeout: 60000,
});


    toast.success("Image replaced successfully");
    closeLightbox();
  } catch (err) {
    console.error(err);
    toast.error("Image replace failed");
  } finally {
    e.target.value = "";
  }
};


  // Lightbox handlers
 const openLightbox = (image) => {
  setLightboxImage(image.url);
  setActiveImageName(image.name);
};


  const closeLightbox = () => {
    setLightboxImage(null);
    setImageDimensions({ width: 'auto', height: 'auto' });
  };

 const handleDeleteImage = async () => {
  if (!activeImageName) return;

  const confirm = window.confirm(
    `Delete image "${activeImageName}"?`
  );
  if (!confirm) return;

  // ✅ Optimistic UI update
  setAvailableVariants(prev =>
    prev.filter(img => img.name !== activeImageName)
  );

  closeLightbox();

  try {
    await axios.delete(`${baseURL}/delete-image-jpg`, {
      params: {
        fileNames: `${activeImageName}.jpg`,
        type: "both",
        empcode: Number(localStorage.getItem("userid")) || 0,
      },
      timeout: 60000,
    });

    toast.success("Image deleted successfully");
  } catch (err) {
    console.error(err);
    toast.error("Delete failed on server");

    // ❗ rollback if needed (optional)
    setAvailableVariants(prev => [
      ...prev,
      { name: activeImageName, url: `${bigImageBaseURL}${activeImageName}.jpg` }
    ]);
  }
};

  

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-green-1000 text-gray-800 dark:text-gray-200 sticky top-0">
      <Sidebar theme="light" className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-lg z-30" />
      <div className="flex-1 ml-0 md:ml-0">
        <Topbar theme="light" className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-lg h-16" />
        <div className="pt-16 pb-6 px-6 sm:px-8 md:px-10 lg:px-12 overflow-y-auto h-[calc(100vh-64px)] scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-Black-700 dark:text-green-100 tracking-tight">Product Details</h2>
            <Breadcrumb className="animate-fade-in-up" />
          </div>

          <div className="w-full max-w-8xl mx-auto">
            {error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-xl flex justify-between items-center animate-slide-in-left">
                {error}
                <button
                  className="text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-400 font-bold"
                  onClick={() => setError('')}
                  aria-label="Close error message"
                >
                  ×
                </button>
              </div>
            )}

            {isLoading && (
              <div className="text-center text-gray-600 dark:text-gray-300 py-10 animate-fade-in-up">
                <svg
                  className="animate-spin h-10 w-10 mx-auto text-teal-600 dark:text-teal-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                <p className="mt-3 text-base font-medium">Loading product details...</p>
              </div>
            )}

            {/* Details Container */}
            <div className="bg-gradient-to-br from-white to-teal-50 dark:from-gray-800 dark:to-teal-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up">
              <h3 className="text-2xl font-semibold text-teal-800 dark:text-teal-200 mb-5">Tile Information</h3>
              {tile ? (
                <div className="space-y-4 text-gray-700 dark:text-gray-200">
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">SKU Name:</span>
                    <span>{tile.sku_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">SKU Code:</span>
                    <span>{tile.sku_code || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Category:</span>
                    <span>{tile.cat_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Application:</span>
                    <span>{tile.app_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Space:</span>
                    <span>{tile.space_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Size:</span>
                    <span>{tile.size_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Finish:</span>
                    <span>{tile.finish_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Color:</span>
                    <span>{tile.color_name || 'N/A'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-36 text-teal-600 dark:text-teal-300">Status:</span>
                    <span className={tile.block ? 'text-red-600 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'}>
                      {tile.block ? 'Blocked' : 'Active'}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No tile data available</p>
              )}
            </div>
              
            {/* Images Container */}
            <div className="mt-8 bg-gradient-to-br from-white to-teal-50 dark:from-gray-800 dark:to-teal-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-2xl font-semibold text-teal-800 dark:text-teal-200 mb-2">Images</h3>
              
{imagesLoading ? (
  <p className="text-gray-500 italic">Loading images…</p>
) : availableVariants.length === 0 ? (
  <p className="text-gray-500 italic">No images available</p>
) : (

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {availableVariants.map((img, index) => (
      <div
        key={index}
        className="cursor-pointer"
        onClick={() => openLightbox(img)}

      >
        {/* Image name */}
        <p className="text-xs text-gray-600 mb-1 text-center">
          {img.name}
        </p>

        {/* Image box */}
        <div className="border rounded p-2 flex items-center justify-center bg-gray-50">
          <img
  src={`${thumbImageBaseURL}${img.name}.jpg`}
  alt={img.name}
  className={`max-w-full max-h-48 object-contain rounded transition-opacity duration-500 ${
    loadedImages[img.name] ? 'opacity-100' : 'opacity-0'
  }`}
  onLoad={() =>
    setLoadedImages(prev => ({ ...prev, [img.name]: true }))
  }
  onError={(e) => {
    e.target.src = fallbackImageURL;
    setLoadedImages(prev => ({ ...prev, [img.name]: true }));
  }}
/>

        </div>
      </div>
    ))}
  </div>
)}

            </div>

            <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/tilemaster"
                className="flex items-center justify-center bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-100 px-6 py-3 rounded-lg font-medium shadow-md hover:from-gray-400 hover:to-gray-500 dark:hover:from-gray-500 dark:hover:to-gray-600 transition-all duration-300 disabled:opacity-50"
                aria-label="Back to products list"
                onClick={() => console.log('Link clicked for /tilemaster')}
              >
                <FaArrowLeft className="mr-2" />
                Back to Products
              </Link>
            </div>
          </div>

          {/* Lightbox */}
          {lightboxImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-up"
              onClick={closeLightbox}
            >
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <img
                  src={lightboxImage}
                  alt="Enlarged tile image"
                  style={{
                    width: imageDimensions.width,
                    height: imageDimensions.height,
                    objectFit: 'contain', // Ensures no distortion, preserves square shape
                  }}
                  onError={(e) => {
                    console.error(`Lightbox image failed to load: ${lightboxImage}`);
                    e.target.src = fallbackImageURL;
                    e.target.alt = 'Image not found';
                  }}
                />
<button
  className="absolute top-4 left-4 text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
  onClick={() => editInputRef.current.click()}
>
  Edit
</button>

<input
  ref={editInputRef}
  type="file"
  accept="image/*"
  hidden
  onChange={handleReplaceImage}
/>



                <button
                  className="absolute top-4 right-4 text-white text-2xl font-bold bg-gray-800 bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-all duration-300"
                  onClick={closeLightbox}
                  aria-label="Close lightbox"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}