import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useServices(filters = {}) {
  const [services, setServices] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    fetchServices()
  }, [filters.category, filters.city, filters.search, filters.maxPrice])

  async function fetchServices() {
    setLoading(true)
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          service_categories ( id, name, slug ),
          profiles ( full_name )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (filters.category)  query = query.eq('category_id', filters.category)
      if (filters.city)      query = query.ilike('location_city', `%${filters.city}%`)
      if (filters.maxPrice)  query = query.lte('base_price', filters.maxPrice)
      if (filters.search)    query = query.ilike('name', `%${filters.search}%`)

      const { data, error } = await query
      if (error) throw error
      setServices(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { services, loading, error, refetch: fetchServices }
}

export function useService(id) {
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!id) return
    supabase
      .from('services')
      .select(`
        *,
        service_categories ( id, name, slug ),
        profiles ( id, full_name, phone ),
        reviews ( id, rating, comment, created_at, profiles(full_name) )
      `)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setService(data)
        setLoading(false)
      })
  }, [id])

  return { service, loading, error }
}

export function useCategories() {
  const [categories, setCategories] = useState([])
  useEffect(() => {
    supabase.from('service_categories').select('*').then(({ data }) => {
      setCategories(data || [])
    })
  }, [])
  return categories
}
