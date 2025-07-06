import React from 'react';
import { FiLogOut, FiBell, FiMessageSquare, FiMoon, FiStar, FiMaximize2 } from 'react-icons/fi';
import { MdLanguage } from 'react-icons/md';
import { Link,useNavigate } from 'react-router-dom';

export default function Topbar() {
    const navigate = useNavigate();

  const logout=()=>{
    navigate('/')
  }
  return (
    <div className="flex justify-end items-center bg-white border-b border-gray-200 shadow-sm p-4">
      <div className="flex items-center space-x-5 mr-6 text-gray-700">

        {/* Fullscreen */}
        <FiMaximize2 className="w-5 h-5 cursor-pointer hover:text-green-700 transition" />

        {/* Language */}
        <div className="flex items-center gap-1 cursor-pointer hover:text-green-700 transition">
          <MdLanguage className="w-5 h-5" />
          <span className="text-sm">EN</span>
        </div>

        {/* Star */}
        <FiStar className="w-5 h-5 cursor-pointer hover:text-green-700 transition" />

        {/* Bell */}
        <div className="relative cursor-pointer">
          <FiBell className="w-5 h-5 hover:text-green-700 transition" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        </div>

        {/* Moon */}
        <FiMoon className="w-5 h-5 cursor-pointer hover:text-green-700 transition" />

        {/* Message */}
        <FiMessageSquare className="w-5 h-5 cursor-pointer hover:text-green-700 transition" />

      </div>

      <button onClick={logout} className="flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-md border border-green-200 hover:bg-green-100 transition">
        <FiLogOut className="w-5 h-5" />
        Log out
      </button>
    </div>
  );
}
