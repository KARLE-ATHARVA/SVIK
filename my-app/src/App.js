import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/ProtectedRoute'; //
import 'react-toastify/dist/ReactToastify.css';
import './index.css'; 

import LoginPage from './pages/LoginPage';
import Dashboard from './components/Dashboard';
import Reportspage from './pages/Reportspage';
import MasterTablesPage from './pages/MasterTablesPage';
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
import AddTilePage from './pages/AddTilePage';
import EditTilePage from './pages/EditTilePage';

export default function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Router>
          {/* ToastContainer added at root so all components can use toast */}
          <ToastContainer 
            
          />

          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute>} />    
            <Route path="/masterTables" element={ <ProtectedRoute> <MasterTablesPage /> </ProtectedRoute>} />
            <Route path="/reportsPage" element={ <ProtectedRoute> <Reportspage /> </ProtectedRoute> } />
            <Route path="/loginHistory" element={ <ProtectedRoute> <LoginHistory /> </ProtectedRoute>} />
            <Route path="/adminActivity" element={ <ProtectedRoute> <AdminActivityLog /> </ProtectedRoute>} />
            <Route path="/userActivity" element={<ProtectedRoute> <UserActivityLog /> </ProtectedRoute>} />
            <Route path="/sizeMaster" element={<ProtectedRoute> <SizeMasterPage /> </ProtectedRoute>} />
            <Route path="/applicationMaster" element={<ProtectedRoute> <ApplicationMasterPage /> </ProtectedRoute>} />
            <Route path="/tileMaster" element={<ProtectedRoute> <TileMasterPage /> </ProtectedRoute>} />
            <Route path="/profileMaster" element={<ProtectedRoute> <ProfileMasterPage /> </ProtectedRoute>} />
            <Route path="/colorMaster" element={<ProtectedRoute> <ColorMasterPage /> </ProtectedRoute>} />
            <Route path="/categoryMaster" element={<ProtectedRoute> <CategoryMasterPage /> </ProtectedRoute>} />
            <Route path="/spaceMaster" element={<ProtectedRoute> <SpaceMasterPage /> </ProtectedRoute>} />
            <Route path="/finishMaster" element={<ProtectedRoute> <FinishMasterPage /> </ProtectedRoute>} />
            <Route path="/userMaster" element={<ProtectedRoute> <UserMasterPage /> </ProtectedRoute>} />
            <Route path="/companyMaster" element={<ProtectedRoute> <CompanyMasterPage /> </ProtectedRoute>} />
            <Route path="/loginMaster" element={<ProtectedRoute> <LoginMasterPage /> </ProtectedRoute>} />
            <Route path="/planMaster" element={<ProtectedRoute> <PlanMasterPage /> </ProtectedRoute>} />
            <Route path="/add-tile" element={<ProtectedRoute> <AddTilePage /> </ProtectedRoute>} />
            <Route path="/edit-tile/:tileId" element={<ProtectedRoute> <EditTilePage /> </ProtectedRoute>} />
          </Routes>
        </Router>
      </SidebarProvider>
    </ThemeProvider>
  );
}
