import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, MapPin, Star, Shield, Clock } from 'lucide-react'
import { useServices, useCategories } from '../hooks/useServices'
import ServiceCard from '../components/ServiceCard'
import Spinner from '../components/Spinner'

const CATEGORY_ICONS = {
  tours:      '🏔️',
  hotels:     '🏨',
  excursions: '🗺️',
  transfers:  '🚌',
}

export default function Home() {
  const navigate  = useNavigate()
  const [search, setSearch] = useState('')
  const [city,   setCity]   = useState('')

  const categories          = useCategories()
  const { services, loading } = useServices({})

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (city)   params.set('city', city)
    navigate(`/services?${params.toString()}`)
  }

  const featured = services.slice(0, 6)

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white py-24 px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(29,78,216,0.85), rgba(29,78,216,0.85)),
            url('https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1400&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Відкрий Україну разом з TourBook
          </h1>
          <p className="text-blue-100 text-xl mb-10">
            Тури, готелі, екскурсії та трансфери — бронюй онлайн за хвилину
          </p>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl"
          >
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Що шукаєте? (тур, готель...)"
                className="flex-1 outline-none text-gray-800 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 px-3 border-t md:border-t-0 md:border-l border-gray-200">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Місто або регіон"
                className="flex-1 outline-none text-gray-800 py-2 text-sm"
              />
            </div>
            <button type="submit" className="btn-primary px-8 py-3 rounded-xl text-base">
              Знайти
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Категорії послуг</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/services?category=${cat.id}`}
              className="card p-6 text-center hover:shadow-md transition-shadow hover:border-blue-200 border-2 border-transparent group"
            >
              <div className="text-4xl mb-3">
                {CATEGORY_ICONS[cat.slug] || '🌍'}
              </div>
              <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured services */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Популярні пропозиції</h2>
          <Link to="/services" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Переглянути всі →
          </Link>
        </div>

        {loading ? (
          <Spinner text="Завантаження послуг..." />
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Послуги ще не додані</p>
            <p className="text-sm mt-1">Будьте першим постачальником!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
      </section>

      {/* Why us */}
      <section className="bg-blue-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Чому обирають TourBook?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="w-8 h-8 text-blue-600" />, title: 'Безпечне бронювання', desc: 'Захищені платежі та підтверджені постачальники' },
              { icon: <Clock  className="w-8 h-8 text-blue-600" />, title: 'Миттєве підтвердження', desc: 'Отримайте підтвердження бронювання одразу' },
              { icon: <Star   className="w-8 h-8 text-blue-600" />, title: 'Перевірені відгуки', desc: 'Чесні оцінки від реальних мандрівників' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
