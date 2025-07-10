// Dashboard.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MainContent from '../pages/LandingPage';

export default function Dashboard() {


  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar  />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar  />
        <MainContent />
      </div>
    </div>
  );
}