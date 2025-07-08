// Dashboard.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MainContent from '../pages/LandingPage';

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <MainContent />
      </div>
    </div>
  );
}