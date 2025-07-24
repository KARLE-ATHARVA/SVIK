import React from 'react';
import {
  FiLogOut,
  FiBell,
  FiMessageSquare,
  FiMoon,
  FiStar,
  FiMaximize2
} from 'react-icons/fi';
import { MdLanguage } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const navigate = useNavigate();

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shadow z-10">
      <div className="flex items-center space-x-5">
        <FiMaximize2 className="w-5 h-5 cursor-pointer hover:text-green-700" />
        <MdLanguage className="w-5 h-5 cursor-pointer hover:text-green-700" />
        <FiStar className="w-5 h-5 cursor-pointer hover:text-green-700" />
        <FiBell className="w-5 h-5 cursor-pointer hover:text-green-700" />
        <FiMoon className="w-5 h-5 cursor-pointer hover:text-green-700" />
        <FiMessageSquare className="w-5 h-5 cursor-pointer hover:text-green-700" />

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded border border-green-200 hover:bg-green-100"
        >
          <FiLogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );
}
