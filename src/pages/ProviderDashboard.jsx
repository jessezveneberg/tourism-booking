import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, TrendingUp, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'

function ServiceForm({ service, categories, onSave, onCancel }) {
  const { user } = useAuth()
  const [form, setForm] = useState(service || {
    name: '', description: '', base_price: '',
    max_capacity: 10, location_city: '', category_id: '',
    images: [],
  })
  const [loading, setLoading] = useState(false)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.base_price || !form.category_id) {
      toast.error('Заповніть обов\'язкові поля')
      return
    }
    setLoading(true)
    const payload = { ...form, provider_id: user.id, base_price: Number(form.base_price) }
    const { error } = service
      ? await supabase.from('services').update(payload).eq('id', service.id)
      : await supabase.from('services').insert(payload)
    setLoading(false)
    if (error) toast.error(error.message)
    else { toast.success(service ? 'Послугу оновлено' : 'Послугу додано ✅'); onSave() }
  }

  return (
    <div className="card p-6 mb-6">
      <h3 className="font-bold text-lg mb-4">{service ? 'Редагувати послугу' : 'Нова послуга'}</h3>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Назва *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="Тур до Карпат" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Категорія *</label>
          <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className="input">
            <option value="">Оберіть категорію</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Місто</label>
          <input value={form.location_city} onChange={e => set('location_city', e.target.value)} className="input" placeholder="Карпати" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ціна (грн/особа) *</label>
          <input type="number" value={form.base_price} onChange={e => set('base_price', e.target.value)} className="input" placeholder="1500" min="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Макс. гостей</label>
          <input type="number" value={form.max_capacity} onChange={e => set('max_capacity', Number(e.target.value))} className="input" min="1" max="100" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input resize-none" rows={4} placeholder="Детальний опис послуги..." />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">URL зображень (через кому)</label>
          <input
            value={form.images?.join(', ')}
            onChange={e => set('images', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            className="input" placeholder="https://... , https://..."
          />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Збереження...' : 'Зберегти'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">Скасувати</button>
        </div>
      </form>
    </div>
  )
}

export default function ProviderDashboard() {
  const { user, profile }   = useAuth()
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editSvc, setEditSvc]   = useState(null)
  const [tab, setTab]           = useState('services')

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    setLoading(true)
    const [svcRes, catRes, bkgRes] = await Promise.all([
      supabase.from('services').select('*').eq('provider_id', user.id).order('created_at', { ascending: false }),
      supabase.from('service_categories').select('*'),
      supabase.from('bookings').select('*, services(name), profiles(full_name)').in(
        'service_id',
        (await supabase.from('services').select('id').eq('provider_id', user.id)).data?.map(s => s.id) || []
      ).order('created_at', { ascending: false }),
    ])
    setServices(svcRes.data || [])
    setCategories(catRes.data || [])
    setBookings(bkgRes.data || [])
    setLoading(false)
  }

  async function toggleActive(svc) {
    await supabase.from('services').update({ is_active: !svc.is_active }).eq('id', svc.id)
    toast.success(svc.is_active ? 'Послугу деактивовано' : 'Послугу активовано')
    load()
  }

  async function deleteService(id) {
    if (!confirm('Видалити послугу?')) return
    await supabase.from('services').delete().eq('id', id)
    toast.success('Видалено')
    load()
  }

  async function updateBookingStatus(id, status) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    toast.success('Статус оновлено')
    load()
  }

  if (loading) return <Spinner text="Завантаження кабінету..." />

  const stats = {
    total:     bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    revenue:   bookings.filter(b => ['confirmed','completed'].includes(b.status))
                       .reduce((s, b) => s + Number(b.total_price), 0),
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Кабінет постачальника</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Всього бронювань', value: stats.total, icon: <Calendar className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Підтверджені',     value: stats.confirmed, icon: <Users className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
          { label: 'Виручка (грн)',    value: stats.revenue.toLocaleString('uk-UA'), icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {['services', 'bookings'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px
              ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'services' ? `Послуги (${services.length})` : `Бронювання (${bookings.length})`}
          </button>
        ))}
      </div>

      {tab === 'services' && (
        <div>
          {(showForm || editSvc) ? (
            <ServiceForm
              service={editSvc}
              categories={categories}
              onSave={() => { setShowForm(false); setEditSvc(null); load() }}
              onCancel={() => { setShowForm(false); setEditSvc(null) }}
            />
          ) : (
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 mb-6">
              <Plus className="w-4 h-4" /> Додати послугу
            </button>
          )}

          {services.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">🏔️</p>
              <p>Послуг ще немає. Додайте першу!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map(s => (
                <div key={s.id} className="card p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.location_city} · {Number(s.base_price).toLocaleString('uk-UA')} грн</p>
                  </div>
                  <span className={`badge ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {s.is_active ? 'Активна' : 'Неактивна'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(s)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Увімк/Вимк">
                      {s.is_active ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button onClick={() => setEditSvc(s)} className="p-1.5 rounded hover:bg-gray-100 text-blue-600" title="Редагувати">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteService(s.id)} className="p-1.5 rounded hover:bg-gray-100 text-red-600" title="Видалити">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'bookings' && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">📋</p>
              <p>Бронювань ще немає</p>
            </div>
          ) : bookings.map(b => (
            <div key={b.id} className="card p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{b.services?.name}</p>
                <p className="text-sm text-gray-500">
                  {b.profiles?.full_name} · {new Date(b.start_date).toLocaleDateString('uk-UA')} · {b.guests_count} ос.
                </p>
                <p className="text-sm font-semibold text-blue-600 mt-1">{Number(b.total_price).toLocaleString('uk-UA')} грн</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  b.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                  b.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'}`}>
                  {b.status === 'pending' ? 'Очікує' : b.status === 'confirmed' ? 'Підтверджено' :
                   b.status === 'completed' ? 'Завершено' : 'Скасовано'}
                </span>
                {b.status === 'pending' && (
                  <button onClick={() => updateBookingStatus(b.id, 'confirmed')}
                    className="text-xs btn-primary py-1 px-2">Підтвердити</button>
                )}
                {b.status === 'confirmed' && (
                  <button onClick={() => updateBookingStatus(b.id, 'completed')}
                    className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 font-medium">Завершити</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
