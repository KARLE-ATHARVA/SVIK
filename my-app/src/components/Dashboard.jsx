import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Topbar />


      </div>
    </div>
  );
}
