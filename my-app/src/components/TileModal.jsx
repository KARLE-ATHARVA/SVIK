import React, { useState } from 'react';

const initialFormState = {
  tile_id: '',
  sku_name: '',
  sku_code: '',
  cat_name: '',
  app_name: '',
  space_name: '',
  size_name: '',
  finish_name: '',
  color_name: '',
  block: '',
};

function TileModal({ tile = {}, onSave, onClose }) {
  const isEdit = Object.keys(tile).length > 0;
  const [formData, setFormData] = useState(isEdit ? { ...tile } : initialFormState);
  const [confirmAction, setConfirmAction] = useState(null); // 'save' or 'cancel'
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Check if all required fields are filled
    for (let key in formData) {
      if (
        key !== 'tile_id' &&
        key !== 'created_date' &&
        key !== 'modify_date' &&
        !formData[key]
      ) {
        alert(`Please fill in the "${key.replace(/_/g, ' ')}" field.`);
        return;
      }
    }
    setConfirmAction('save');
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setConfirmAction('cancel');
    setShowConfirm(true);
  };

  const confirmProceed = () => {
    if (confirmAction === 'save') {
      onSave(formData);
    }
    onClose();
    setShowConfirm(false);
  };

  const cancelProceed = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white p-6 rounded-lg w-[90%] max-w-3xl">
          <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Tile' : 'Add Tile'}</h2>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {Object.keys(formData).map((key) => (
              key !== 'tile_id' && key !== 'created_date' && key !== 'modify_date' && (
                <div key={key} className="flex flex-col">
                  <label className="capitalize text-sm mb-1">{key.replace(/_/g, ' ')}</label>
                  <input
                    type="text"
                    name={key}
                    value={formData[key] || ''}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded"
                  />
                </div>
              )
            ))}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-60">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p className="text-lg font-semibold mb-4">
              Are you sure you want to {confirmAction === 'save' ? 'save' : 'cancel'}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={confirmProceed}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={cancelProceed}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TileModal;
