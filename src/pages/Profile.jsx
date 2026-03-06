import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { User, Mail, Phone, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { profile, updateProfile, user } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone,    setPhone]    = useState(profile?.phone || '')
  const [loading,  setLoading]  = useState(false)

  // Password change
  const [oldPass,  setOldPass]  = useState('')
  const [newPass,  setNewPass]  = useState('')
  const [passLoad, setPassLoad] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await updateProfile({ full_name: fullName, phone })
    setLoading(false)
    if (error) toast.error('Помилка збереження')
    else toast.success('Профіль оновлено ✅')
  }

  async function handlePassword(e) {
    e.preventDefault()
    if (newPass.length < 6) { toast.error('Пароль мінімум 6 символів'); return }
    setPassLoad(true)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setPassLoad(false)
    if (error) toast.error(error.message)
    else { toast.success('Пароль змінено ✅'); setOldPass(''); setNewPass('') }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Мій профіль</h1>

      {/* Avatar + email info */}
      <div className="card p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
          {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-lg">{profile?.full_name || 'Користувач'}</p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" /> {user?.email}
          </p>
          <span className="badge bg-blue-100 text-blue-700 mt-1">
            {profile?.role === 'provider' ? '🏢 Постачальник' : profile?.role === 'admin' ? '⚙️ Адмін' : '👤 Користувач'}
          </span>
        </div>
      </div>

      {/* Edit profile form */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" /> Особиста інформація
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Повне ім'я</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="input" placeholder="Іван Петренко"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" /> Телефон
            </label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="input" placeholder="+380 (xx) xxx-xx-xx"
              type="tel"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">🔒 Змінити пароль</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Новий пароль</label>
            <input
              type="password" value={newPass}
              onChange={e => setNewPass(e.target.value)}
              className="input" placeholder="Мінімум 6 символів"
            />
          </div>
          <button type="submit" disabled={passLoad} className="btn-secondary flex items-center gap-2">
            {passLoad ? 'Оновлення...' : 'Змінити пароль'}
          </button>
        </form>
      </div>
    </div>
  )
}
