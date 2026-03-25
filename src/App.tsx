import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PrescriptionList from './pages/PrescriptionList';
import FulfillmentHistory from './pages/FulfillmentHistory';
import InventoryList from './pages/InventoryList';
import PharmacyQueue from './pages/PharmacyQueue';
import Agenda from './pages/Agenda';
import PatientHistory from './pages/PatientHistory';
import Consultas from './pages/Consultas';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import StaffManagement from './pages/Admin/StaffManagement';
import Reports from './pages/Admin/Reports';
import AdminPanel from './pages/Admin/AdminPanel';

// Placeholder components for other pages
const Admin = () => (
  <AdminPanel />
);

const Unauthorized = () => (
  <div className="h-screen flex items-center justify-center bg-slate-50 p-4">
    <div className="text-center max-w-md">
      <h1 className="text-6xl font-black text-slate-200 mb-4">403</h1>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Acceso Denegado</h2>
      <p className="text-slate-500 mb-8">No tiene los permisos necesarios para acceder a esta sección.</p>
      <button 
        onClick={() => window.history.back()}
        className="px-6 py-3 bg-[#023E8A] text-white rounded-xl font-bold hover:bg-[#0047AB] transition-colors"
      >
        Regresar
      </button>
    </div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            
            <Route path="/pacientes" element={
              <ProtectedRoute allowedRoles={['admin', 'medico']}>
                <PatientList />
              </ProtectedRoute>
            } />

            <Route path="/pacientes/:id/historial" element={
              <ProtectedRoute allowedRoles={['admin', 'medico']}>
                <PatientHistory />
              </ProtectedRoute>
            } />
            
            <Route path="/agenda" element={
              <ProtectedRoute allowedRoles={['medico', 'admin']}>
                <Agenda />
              </ProtectedRoute>
            } />
            
            <Route path="/consultas" element={
              <ProtectedRoute allowedRoles={['medico']}>
                <Consultas />
              </ProtectedRoute>
            } />
            
            <Route path="/farmacia" element={
              <ProtectedRoute allowedRoles={['admin', 'farmacia']}>
                <PrescriptionList />
              </ProtectedRoute>
            } />

            <Route path="/farmacia/inventario" element={
              <ProtectedRoute allowedRoles={['admin', 'farmacia']}>
                <InventoryList />
              </ProtectedRoute>
            } />

            <Route path="/farmacia/recetas" element={
              <ProtectedRoute allowedRoles={['admin', 'farmacia']}>
                <PharmacyQueue />
              </ProtectedRoute>
            } />

            <Route path="/farmacia/historial" element={
              <ProtectedRoute allowedRoles={['farmacia']}>
                <FulfillmentHistory />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            } />

            <Route path="/admin/personal" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StaffManagement />
              </ProtectedRoute>
            } />

            <Route path="/admin/reportes" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Reports />
              </ProtectedRoute>
            } />
            
            <Route path="/perfil" element={<Profile />} />
            
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
