import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Leader from './pages/Leader';
import Holidays from './pages/Holidays';
import QRScan from './pages/QRScan';
import Chat from './pages/Chat';
import Gallery from './pages/Gallery';
import Champions from './pages/Champions';
import EventMoments from './pages/EventMoments';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8 max-w-7xl">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<Events />} />
              <Route path="/holidays" element={<Holidays />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/champions" element={<Champions />} />
              <Route path="/moments" element={<EventMoments />} />
              
              {/* Protected Routes (require authentication) */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/qr-scan" element={
                <PrivateRoute>
                  <QRScan />
                </PrivateRoute>
              } />
              <Route path="/chat" element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              } />
              
              {/* Admin Only Routes */}
              <Route path="/admin" element={
                <PrivateRoute requiredRole="admin">
                  <Admin />
                </PrivateRoute>
              } />
              
              {/* Leader Only Routes */}
              <Route path="/leader" element={
                <PrivateRoute requiredRole="leader">
                  <Leader />
                </PrivateRoute>
              } />
              
              {/* Catch all - 404 Not Found */}
              <Route path="*" element={
                <div className="text-center py-12">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <p className="text-gray-500 mb-4">Page not found</p>
                  <a href="/" className="text-primary hover:underline">Go back home</a>
                </div>
              } />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;