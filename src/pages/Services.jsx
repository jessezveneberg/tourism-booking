import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useServices, useCategories } from '../hooks/useServices'
import ServiceCard from '../components/ServiceCard'
import Spinner from '../components/Spinner'

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categories = useCategories()

  const [search,   setSearch]   = useState(searchParams.get('search') || '')
  const [city,     setCity]     = useState(searchParams.get('city') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [showFilters, setShowFilters] = useState(false)

  const { services, loading } = useServices({ search, city, category, maxPrice })

  useEffect(() => {
    const p = {}
    if (search)   p.search = search
    if (city)     p.city = city
    if (category) p.category = category
    if (maxPrice) p.maxPrice = maxPrice
    setSearchParams(p)
  }, [search, city, category, maxPrice])

  function clearFilters() {
    setSearch(''); setCity(''); setCategory(''); setMaxPrice('')
  }

  const hasFilters = search || city || category || maxPrice

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Туристичні послуги</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 btn-secondary text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Фільтри
          {hasFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Пошук за назвою послуги..."
          className="input pl-10"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Місто</label>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Київ, Карпати..."
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input"
            >
              <option value="">Всі категорії</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Макс. ціна (грн): {maxPrice || '∞'}
            </label>
            <input
              type="range"
              min="0" max="50000" step="500"
              value={maxPrice || 50000}
              onChange={e => setMaxPrice(e.target.value === '50000' ? '' : e.target.value)}
              className="w-full accent-blue-600"
            />
          </div>
          {hasFilters && (
            <div className="md:col-span-3">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
                Скинути фільтри
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <Spinner text="Завантаження..." />
      ) : services.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-medium text-gray-700">Нічого не знайдено</p>
          <p className="text-gray-500 text-sm mt-1">Спробуйте змінити фільтри або пошуковий запит</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-primary mt-4">
              Скинути фільтри
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Знайдено: <span className="font-semibold text-gray-800">{services.length}</span> послуг
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </>
      )}
    </div>
  )
}
