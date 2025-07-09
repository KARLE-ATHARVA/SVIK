import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './components/Dashboard';
import LoginHistory from './pages/LoginHistory';
import AdminActivityLog from './pages/AdminActivityLog';
import UserActivityLog from './pages/UserActivityLog';
import SizeMasterPage from './pages/SizeMasterPage';
import ApplicationMasterPage from './pages/ApplicationMasterPage';
import TileMasterPage from './pages/TileMasterPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/loginHistory" element={<LoginHistory/>}/>
        <Route path="/adminActivity" element={<AdminActivityLog/>}/>
        <Route path="/userActivity" element={<UserActivityLog/>}/>
        <Route path="/sizeMaster" element={<SizeMasterPage />} />
        <Route path="/applicationMaster" element={<ApplicationMasterPage />} />
        <Route path="/tileMaster" element={<TileMasterPage />} />
      </Routes>
    </Router>
  );
}
