import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home              from './pages/Home'
import Services          from './pages/Services'
import ServiceDetail     from './pages/ServiceDetail'
import Auth              from './pages/Auth'
import MyBookings        from './pages/MyBookings'
import Profile           from './pages/Profile'
import ProviderDashboard from './pages/ProviderDashboard'
import NotFound          from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter basename="/tourism-booking">
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/services"    element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/auth"        element={<Auth />} />

              <Route path="/my-bookings" element={
                <ProtectedRoute><MyBookings /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              <Route path="/provider" element={
                <ProtectedRoute><ProviderDashboard /></ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
