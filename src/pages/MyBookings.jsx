import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Hash, X, Star } from 'lucide-react'
import { useMyBookings } from '../hooks/useBookings'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { useState } from 'react'

const STATUS_CONFIG = {
  pending:   { label: 'Очікує',     color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Підтверджено', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Скасовано',  color: 'bg-red-100 text-red-700' },
  completed: { label: 'Завершено',  color: 'bg-blue-100 text-blue-700' },
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=130&fit=crop'

function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating,  setRating]  = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    await onSubmit({ rating, comment, bookingId: booking.id, serviceId: booking.service_id })
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card p-6 w-full max-w-md">
        <h3 className="font-bold text-lg mb-4">Залишити відгук</h3>
        <p className="text-sm text-gray-500 mb-4">{booking.services?.name}</p>
        <div className="flex gap-1 mb-4">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setRating(n)}>
              <Star className={`w-8 h-8 transition-colors ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
        <textarea
          value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Ваш коментар (необов'язково)..."
          rows={4} className="input resize-none mb-4"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Скасувати</button>
          <button onClick={submit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Надсилання...' : 'Надіслати'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyBookings() {
  const { user }  = useAuth()
  const { bookings, loading, cancelBooking, refetch } = useMyBookings()
  const [reviewBooking, setReviewBooking] = useState(null)

  async function handleCancel(id) {
    if (!confirm('Скасувати бронювання?')) return
    const { error } = await cancelBooking(id)
    if (error) toast.error('Помилка скасування')
    else toast.success('Бронювання скасовано')
  }

  async function handleReviewSubmit({ rating, comment, bookingId, serviceId }) {
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id, service_id: serviceId,
      booking_id: bookingId, rating, comment,
    })
    if (error) toast.error('Помилка: ' + (error.message.includes('unique') ? 'Відгук вже залишено' : error.message))
    else { toast.success('Відгук додано! ⭐'); refetch() }
  }

  if (loading) return <Spinner text="Завантаження бронювань..." />

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Мої бронювання</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-5xl mb-4">🗺️</p>
          <p className="text-lg font-medium text-gray-700 mb-2">У вас ще немає бронювань</p>
          <p className="text-gray-500 text-sm mb-6">Знайдіть тур або готель і відправляйтесь у подорож!</p>
          <Link to="/services" className="btn-primary">Переглянути послуги</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => {
            const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
            const img = b.services?.images?.[0] || PLACEHOLDER
            const canCancel  = ['pending', 'confirmed'].includes(b.status)
            const canReview  = b.status === 'completed'

            return (
              <div key={b.id} className="card p-4 md:p-6 flex flex-col md:flex-row gap-4">
                <img
                  src={img} alt={b.services?.name}
                  className="w-full md:w-36 h-32 md:h-auto object-cover rounded-lg flex-shrink-0"
                  onError={e => { e.target.src = PLACEHOLDER }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                      {b.services?.name || 'Послуга'}
                    </h3>
                    <span className={`badge flex-shrink-0 ${status.color}`}>{status.label}</span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" />
                      {b.booking_number}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(b.start_date).toLocaleDateString('uk-UA')}
                      {b.end_date && b.end_date !== b.start_date && ` — ${new Date(b.end_date).toLocaleDateString('uk-UA')}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {b.guests_count} {b.guests_count === 1 ? 'особа' : 'осіб'}
                    </span>
                    {b.services?.location_city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {b.services.location_city}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600 text-lg">
                      {Number(b.total_price).toLocaleString('uk-UA')} грн
                    </span>
                    <div className="flex gap-2">
                      {canReview && (
                        <button
                          onClick={() => setReviewBooking(b)}
                          className="flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                          <Star className="w-4 h-4" /> Відгук
                        </button>
                      )}
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          <X className="w-4 h-4" /> Скасувати
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}
