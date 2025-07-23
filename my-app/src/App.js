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
import ProfileMasterPage from './pages/ProfileMasterPage';
import ColorMasterPage from './pages/ColorMasterPage';
import CategoryMasterPage from './pages/CategoryMasterPage';
import SpaceMasterPage from './pages/SpaceMasterPage';
import FinishMasterPage from './pages/FinishMasterPage';
import UserMasterPage from './pages/UserMasterPage';
import CompanyMasterPage from './pages/CompanyMasterPage';
import LoginMasterPage from './pages/LoginMasterPage';
import PlanMasterPage from './pages/PlanMasterPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/loginHistory" element={<LoginHistory/>}/>
        <Route path="/adminActivity" element={<AdminActivityLog/>}/>
        <Route path="/userActivity" element={<UserActivityLog/>}/>
        <Route path="/sizeMaster" element={<SizeMasterPage />} />
        <Route path="/applicationMaster" element={<ApplicationMasterPage />} />
        <Route path="/tileMaster" element={<TileMasterPage />} />
        <Route path="/profileMaster" element={<ProfileMasterPage />} />
        <Route path="/colorMaster" element={<ColorMasterPage />} />
        <Route path="/categoryMaster" element={<CategoryMasterPage />} />
        <Route path="/spaceMaster" element={<SpaceMasterPage />} />
        <Route path="/finishMaster" element={<FinishMasterPage />} />
        <Route path="/userMaster" element={<UserMasterPage />} />
        <Route path="/companyMaster" element={<CompanyMasterPage />} />
        <Route path="/loginMaster" element={<LoginMasterPage />} />
        <Route path="/planMaster" element={<PlanMasterPage />} />

      </Routes>
    </Router>
  );
}
