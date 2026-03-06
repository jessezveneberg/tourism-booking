import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MapPin, Menu, X, User, LogOut, Calendar, Plus } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    toast.success('Ви вийшли з системи')
    navigate('/')
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`text-sm font-medium transition-colors hover:text-blue-600
        ${location.pathname === to ? 'text-blue-600' : 'text-gray-700'}`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <MapPin className="w-6 h-6" />
          TourBook
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLink('/', 'Головна')}
          {navLink('/services', 'Послуги')}
          {user && navLink('/my-bookings', 'Мої бронювання')}
          {profile?.role === 'provider' && navLink('/provider', 'Кабінет')}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">{profile?.full_name?.split(' ')[0] || 'Профіль'}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Вихід
              </button>
            </div>
          ) : (
            <>
              <Link to="/auth" className="btn-secondary text-sm py-1.5">
                Увійти
              </Link>
              <Link to="/auth?tab=register" className="btn-primary text-sm py-1.5">
                Реєстрація
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-4">
          {navLink('/', 'Головна')}
          {navLink('/services', 'Послуги')}
          {user && navLink('/my-bookings', 'Мої бронювання')}
          {profile?.role === 'provider' && navLink('/provider', 'Кабінет постачальника')}
          {user ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              {navLink('/profile', 'Профіль')}
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 text-left"
              >
                Вийти
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Link to="/auth" onClick={() => setOpen(false)} className="btn-secondary flex-1 text-center text-sm">
                Увійти
              </Link>
              <Link to="/auth?tab=register" onClick={() => setOpen(false)} className="btn-primary flex-1 text-center text-sm">
                Реєстрація
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
