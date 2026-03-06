import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Star, Users, Calendar, ArrowLeft, Phone } from 'lucide-react'
import { useService } from '../hooks/useServices'
import { createBooking } from '../hooks/useBookings'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'

function ReviewItem({ review }) {
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
          {review.profiles?.full_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {review.profiles?.full_name || 'Анонім'}
          </p>
          <div className="flex">
            {[1,2,3,4,5].map(n => (
              <Star key={n} className={`w-3 h-3 ${n <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>
      </div>
      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
    </div>
  )
}

export default function ServiceDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const { service, loading, error } = useService(id)

  const [startDate,   setStartDate]   = useState('')
  const [endDate,     setEndDate]     = useState('')
  const [guests,      setGuests]      = useState(1)
  const [requests,    setRequests]    = useState('')
  const [booking,     setBooking]     = useState(false)
  const [activeImg,   setActiveImg]   = useState(0)

  if (loading) return <Spinner text="Завантаження..." />
  if (error || !service) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-5xl mb-4">😕</p>
      <p className="text-lg text-gray-700">Послугу не знайдено</p>
      <Link to="/services" className="btn-primary mt-4 inline-block">← Назад до каталогу</Link>
    </div>
  )

  const images     = service.images?.length ? service.images : [PLACEHOLDER]
  const totalPrice = service.base_price * guests
  const reviews    = service.reviews || []
  const avgRating  = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  async function handleBook() {
    if (!user) { navigate('/auth'); return }
    if (!startDate) { toast.error('Оберіть дату початку'); return }

    setBooking(true)
    const { data, error } = await createBooking({
      serviceId:      service.id,
      startDate,
      endDate:        endDate || startDate,
      guestsCount:    guests,
      totalPrice,
      specialRequests: requests,
      userId:         user.id,
    })
    setBooking(false)

    if (error) {
      toast.error('Помилка бронювання: ' + error.message)
    } else {
      toast.success(`Бронювання ${data.booking_number} створено! ✅`)
      navigate('/my-bookings')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/services" className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Назад до каталогу
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — info */}
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="rounded-xl overflow-hidden mb-3">
            <img
              src={images[activeImg]}
              alt={service.name}
              className="w-full h-72 md:h-96 object-cover"
              onError={e => { e.target.src = PLACEHOLDER }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-16 object-cover rounded-lg cursor-pointer flex-shrink-0 border-2 transition-colors
                    ${activeImg === i ? 'border-blue-500' : 'border-transparent'}`}
                  onError={e => { e.target.src = PLACEHOLDER }}
                />
              ))}
            </div>
          )}

          {/* Title & meta */}
          <div className="mb-2">
            {service.service_categories && (
              <span className="badge bg-blue-100 text-blue-700 mb-2">
                {service.service_categories.name}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{service.name}</h1>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-blue-500" />
              {service.location_city || 'Україна'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-500" />
              до {service.max_capacity} осіб
            </span>
            {avgRating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {avgRating} ({reviews.length} відгуків)
              </span>
            )}
          </div>

          <div className="prose max-w-none text-gray-700 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Опис</h3>
            <p className="leading-relaxed">{service.description || 'Детальний опис незабаром.'}</p>
          </div>

          {/* Provider contact */}
          {service.profiles && (
            <div className="card p-4 mb-8 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                {service.profiles.full_name?.[0] || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-800">{service.profiles.full_name}</p>
                <p className="text-sm text-gray-500">Постачальник послуги</p>
              </div>
              {service.profiles.phone && (
                <a href={`tel:${service.profiles.phone}`} className="ml-auto flex items-center gap-1 text-blue-600 text-sm">
                  <Phone className="w-4 h-4" />
                  {service.profiles.phone}
                </a>
              )}
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Відгуки ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">Відгуків ще немає. Будьте першим!</p>
            ) : (
              <div className="card p-4 divide-y divide-gray-100">
                {reviews.map(r => <ReviewItem key={r.id} review={r} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right — booking card */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <div className="mb-4">
              <span className="text-3xl font-bold text-blue-600">
                {Number(service.base_price).toLocaleString('uk-UA')}
              </span>
              <span className="text-gray-500 ml-1">грн / особа</span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Дата початку *
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата завершення
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  onChange={e => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  Кількість гостей
                </label>
                <select
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="input"
                >
                  {Array.from({ length: service.max_capacity }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'особа' : n < 5 ? 'особи' : 'осіб'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Побажання (необов'язково)
                </label>
                <textarea
                  value={requests}
                  onChange={e => setRequests(e.target.value)}
                  rows={3}
                  placeholder="Особливі побажання..."
                  className="input resize-none"
                />
              </div>
            </div>

            {/* Price summary */}
            <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{Number(service.base_price).toLocaleString('uk-UA')} × {guests} ос.</span>
                <span>{Number(totalPrice).toLocaleString('uk-UA')} грн</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 mt-1 pt-1 border-t border-blue-200">
                <span>Разом</span>
                <span className="text-blue-600">{Number(totalPrice).toLocaleString('uk-UA')} грн</span>
              </div>
            </div>

            <button
              onClick={handleBook}
              disabled={booking}
              className="btn-primary w-full py-3 text-base"
            >
              {booking ? 'Бронювання...' : user ? 'Забронювати' : 'Увійти та забронювати'}
            </button>

            {!user && (
              <p className="text-xs text-center text-gray-500 mt-2">
                Потрібна реєстрація для бронювання
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
