import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              TourBook
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Зручна платформа для бронювання туристичних послуг в Україні.
              Тури, готелі, екскурсії та трансфери в одному місці.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Навігація</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Головна</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Всі послуги</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">Мої бронювання</Link></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">Увійти</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white font-semibold mb-3">Контакти</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                +380 (44) 123-45-67
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                info@tourbook.ua
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                Київ, Україна
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} TourBook. Всі права захищено.
        </div>
      </div>
    </footer>
  )
}
