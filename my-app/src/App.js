import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './components/Dashboard';
import LoginHistory from './pages/LoginHistory';
import AdminActivityLog from './pages/AdminActivityLog';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/loginHistory" element={<LoginHistory/>}/>
        <Route path="/adminActivity" element={<AdminActivityLog/>}/>

      </Routes>
    </Router>
  );
}
