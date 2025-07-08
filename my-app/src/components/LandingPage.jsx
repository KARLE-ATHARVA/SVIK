// MainContent.js (LandingPage.js)
import React from 'react';
import { HiDatabase, HiOutlineCube, HiOutlineChat, HiOutlineUserAdd } from 'react-icons/hi';

export default function MainContent() {
  const stats = [
    { title: 'Products', value: '9856', icon: <HiDatabase size={32} />, bg: 'bg-green-700', overlay: 'bg-green-600/30' },
    { title: 'Ceramic Tiles', value: '9856', icon: <HiOutlineCube size={32} />, bg: 'bg-yellow-700', overlay: 'bg-yellow-600/30' },
    { title: 'Premium Users', value: '893', icon: <HiOutlineChat size={32} />, bg: 'bg-emerald-700', overlay: 'bg-emerald-600/30' },
    { title: 'New User', value: '4531', icon: <HiOutlineUserAdd size={32} />, bg: 'bg-teal-700', overlay: 'bg-teal-600/30' },
  ];

  return (
    <div className="flex flex-col flex-1 p-6 overflow-auto">
      <div className="bg-green-700 text-white rounded-lg p-6 flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome Back, John!!</h2>
          <p className="text-sm md:text-base max-w-xl">
            Welcome to the Viho Family! We are glad that you are visiting this dashboard.
            We will be happy to help you grow your business.
          </p>
        </div>
        {/*<button className="mt-4 md:mt-0 bg-white text-green-700 px-4 py-2 rounded-md font-semibold">
          Update
        </button>*/}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className={`relative ${stat.bg} rounded-lg p-6 text-white overflow-hidden`}>
            <div className="relative z-10">
              <div className="mb-2">{stat.icon}</div>
              <h3 className="text-md font-semibold">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`absolute right-4 bottom-4 w-24 h-24 rounded-full ${stat.overlay} z-0`}></div>
          </div>
        ))}
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Project Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-600 h-4 rounded-full transition-all duration-1000 ease-in-out"
            style={{ width: '70%' }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-gray-600">70% Completed</p>
      </div>
      
      <footer className="mt-auto py-4 text-center text-sm text-gray-500">
        © 2025 TiVi Dashboard. All rights reserved.
      </footer>
    </div>
  );
}