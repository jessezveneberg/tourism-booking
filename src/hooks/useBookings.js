import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useMyBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user) return
    fetchBookings()
  }, [user])

  async function fetchBookings() {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        services ( id, name, location_city, images, base_price,
          service_categories(name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  async function cancelBooking(bookingId) {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', user.id)
    if (!error) fetchBookings()
    return { error }
  }

  return { bookings, loading, cancelBooking, refetch: fetchBookings }
}

export async function createBooking({ serviceId, startDate, endDate, guestsCount, totalPrice, specialRequests, userId }) {
  // Генеруємо унікальний номер бронювання
  const bookingNumber = 'B-' + Math.random().toString(36).substr(2, 8).toUpperCase()

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id:          userId,
      service_id:       serviceId,
      booking_number:   bookingNumber,
      status:           'pending',
      start_date:       startDate,
      end_date:         endDate,
      guests_count:     guestsCount,
      total_price:      totalPrice,
      special_requests: specialRequests,
      currency:         'UAH',
    })
    .select()
    .single()

  return { data, error }
}
