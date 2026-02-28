import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft } from 'react-icons/fa';
import PageLayout from '../components/layout/PageLayout';

const baseURL = process.env.REACT_APP_API_BASE_URL;
const MEDIA_URL = process.env.REACT_APP_MEDIA_URL;

const bigImageBaseURL = `${MEDIA_URL}/big/`;
const thumbImageBaseURL = `${MEDIA_URL}/thumb/`;
const fallbackImageURL = `${MEDIA_URL}/no-image.jpg`;

export default function ViewTilePage() {
  const { tileId } = useParams();
  const [tile, setTile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 'auto', height: 'auto' });
  const [availableVariants, setAvailableVariants] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeImageName, setActiveImageName] = useState(null);
  const editInputRef = React.useRef(null);

  const normalizedBaseURL = useMemo(() => baseURL.replace(/\/+$/, ''), []);

  useEffect(() => {
    if (!tileId) return;
    let isMounted = true;

    const fetchTileDetails = async () => {
      setIsLoading(true);
      setError('');

      try {
        const res = await axios.get(`${normalizedBaseURL}/GetTileBySku`, {
          params: { skuCode: tileId }
        });

        if (!res.data || !res.data.sku_code) {
          throw new Error('Tile not found');
        }

        if (isMounted) setTile(res.data);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          toast.error('Tile not found');
          setError('Tile not found');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTileDetails();

    return () => {
      isMounted = false;
    };
  }, [tileId, normalizedBaseURL]);

  useEffect(() => {
    if (!tile?.sku_code) return;
    let isMounted = true;

    const checkImageExists = (name) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = `${thumbImageBaseURL}${name}.jpg`;
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
      });

    const loadVariants = async () => {
      setImagesLoading(true);
      setLoadedImages({});

      try {
        const baseName = tile.sku_code;
        const facesCount = Math.max(0, Number(tile.faces) || 0);
        const candidateNames = [
          baseName,
          ...Array.from({ length: facesCount }, (_, i) => `${baseName}-f${i + 1}`)
        ];

        const checks = await Promise.all(
          candidateNames.map(async (name) => {
            const exists = await checkImageExists(name);
            return exists ? { name, url: `${bigImageBaseURL}${name}.jpg` } : null;
          })
        );

        if (!isMounted) return;
        setAvailableVariants(checks.filter(Boolean));
      } finally {
        if (isMounted) setImagesLoading(false);
      }
    };

    loadVariants();

    return () => {
      isMounted = false;
    };
  }, [tile]);

  useEffect(() => {
    if (!lightboxImage) return;

    const img = new Image();
    img.src = lightboxImage;
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      const size = Math.min(naturalWidth, naturalHeight);
      const maxSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
      const finalSize = Math.min(size, maxSize);
      setImageDimensions({ width: `${finalSize}px`, height: `${finalSize}px` });
    };
    img.onerror = () => {
      setImageDimensions({ width: '150px', height: '150px' });
    };
  }, [lightboxImage]);

  const handleReplaceImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeImageName) return;

    try {
      await axios.delete(`${baseURL}/delete-image-jpg`, {
        params: {
          fileNames: `${activeImageName}.jpg`,
          type: 'both',
          empcode: Number(localStorage.getItem('userid')) || 0
        }
      });

      const formData = new FormData();
      formData.append('image', file);
      formData.append('targetName', activeImageName);
      formData.append('empcode', Number(localStorage.getItem('userid')) || 0);

      await axios.post(`${baseURL}/replace-image-jpg`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });

      toast.success('Image replaced successfully');
      closeLightbox();
      setLoadedImages({});
    } catch (err) {
      console.error(err);
      toast.error('Image replace failed');
    } finally {
      e.target.value = '';
    }
  };

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

    const confirm = window.confirm(`Delete image "${activeImageName}"?`);
    if (!confirm) return;

    setAvailableVariants((prev) => prev.filter((img) => img.name !== activeImageName));
    closeLightbox();

    try {
      await axios.delete(`${baseURL}/delete-image-jpg`, {
        params: {
          fileNames: `${activeImageName}.jpg`,
          type: 'both',
          empcode: Number(localStorage.getItem('userid')) || 0
        },
        timeout: 60000
      });

      toast.success('Image deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Delete failed on server');

      setAvailableVariants((prev) => [
        ...prev,
        { name: activeImageName, url: `${bigImageBaseURL}${activeImageName}.jpg` }
      ]);
    }
  };

  return (
    <PageLayout title="Product Details">
      <div className="w-full max-w-screen-xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col max-h-[75vh] overflow-y-auto">
        <div className="w-full">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-xl flex justify-between items-center">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-5">Tile Information</h3>
            {isLoading ? (
              <div className="text-center text-gray-600 dark:text-gray-300 py-10">
                <svg
                  className="animate-spin h-10 w-10 mx-auto text-green-600 dark:text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <p className="mt-3 text-base font-medium">Loading product details...</p>
              </div>
            ) : tile ? (
              <div className="space-y-4 text-gray-700 dark:text-gray-200">
                <p className="flex items-center"><span className="font-medium w-36 text-green-700 dark:text-green-400">SKU Name:</span><span>{tile.sku_name || 'N/A'}</span></p>
                <p className="flex items-center"><span className="font-medium w-36 text-green-700 dark:text-green-400">SKU Code:</span><span>{tile.sku_code || 'N/A'}</span></p>
                <p className="flex items-center"><span className="font-medium w-36 text-green-700 dark:text-green-400">Category:</span><span>{tile.cat_name || 'N/A'}</span></p>
                <p className="flex items-center"><span className="font-medium w-36 text-green-700 dark:text-green-400">Application:</span><span>{tile.app_name || 'N/A'}</span></p>
                <p className="flex items-center"><span className="font-medium w-36 text-green-700 dark:text-green-400">Space:</span><span>{tile.space_name || 'N/A'}</span></p>
                <p className="flex items-center"><span className="font-medium w-36 text-green-700 dark:text-green-400">Size:</span><span>{tile.size_name || 'N/A'}</span></p>
                <p className="flex items-center"><span className="font-medium w-36 text-green-700 dark:text-green-400">Finish:</span><span>{tile.finish_name || 'N/A'}</span></p>
                <p className="flex items-center"><span className="font-medium w-36 text-green-700 dark:text-green-400">Color:</span><span>{tile.color_name || 'N/A'}</span></p>
                <p className="flex items-center">
                  <span className="font-medium w-36 text-green-700 dark:text-green-400">Status:</span>
                  <span className={tile.block ? 'text-red-600 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'}>
                    {tile.block ? 'Blocked' : 'Active'}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No tile data available</p>
            )}
          </div>

          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Images</h3>

            {imagesLoading ? (
              <p className="text-gray-500 italic">Loading images...</p>
            ) : availableVariants.length === 0 ? (
              <p className="text-gray-500 italic">No images available</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {availableVariants.map((img, index) => (
                  <div key={index} className="cursor-pointer" onClick={() => openLightbox(img)}>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 text-center">{img.name}</p>
                    <div className="border border-gray-200 dark:border-gray-700 rounded p-2 flex items-center justify-center bg-gray-50 dark:bg-gray-900/40">
                      <img
                        src={`${thumbImageBaseURL}${img.name}.jpg`}
                        alt={img.name}
                        className={`max-w-full max-h-48 object-contain rounded transition-opacity duration-500 ${loadedImages[img.name] ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setLoadedImages((prev) => ({ ...prev, [img.name]: true }))}
                        onError={(e) => {
                          e.currentTarget.src = fallbackImageURL;
                          setLoadedImages((prev) => ({ ...prev, [img.name]: true }));
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
              className="flex items-center justify-center bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-gray-400 dark:hover:bg-gray-600 transition-all duration-300"
              aria-label="Back to products list"
            >
              <FaArrowLeft className="mr-2" />
              Back to Products
            </Link>
          </div>
        </div>

        {lightboxImage && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={closeLightbox}>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={lightboxImage}
                alt="Enlarged tile image"
                style={{
                  width: imageDimensions.width,
                  height: imageDimensions.height,
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.currentTarget.src = fallbackImageURL;
                  e.currentTarget.alt = 'Image not found';
                }}
              />

              <button
                className="absolute top-4 left-4 text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                onClick={() => editInputRef.current?.click()}
              >
                Edit
              </button>

              <input ref={editInputRef} type="file" accept="image/*" hidden onChange={handleReplaceImage} />

              <button
                className="absolute top-4 right-16 text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                onClick={handleDeleteImage}
              >
                Delete
              </button>

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
    </PageLayout>
  );
}
