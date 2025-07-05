import React from 'react';

export default function Topbar() {
  return (
    <div className="flex justify-between items-center bg-white shadow p-4">
      <input
        type="text"
        placeholder="Search..."
        className="border px-4 py-2 rounded-md w-1/3"
      />
      <button className="bg-green-600 text-white px-4 py-2 rounded-md">
        Logout
      </button>
    </div>
  );
}
