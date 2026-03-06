import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MapPin, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Auth() {
  const [searchParams]  = useSearchParams()
  const [tab, setTab]   = useState(searchParams.get('tab') === 'register' ? 'register' : 'login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // Login fields
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  // Register extra fields
  const [fullName, setFullName] = useState('')
  const [confirm,  setConfirm]  = useState('')

  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/')
  }, [user])

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) { toast.error('Заповніть всі поля'); return }
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) toast.error(error.message === 'Invalid login credentials' ? 'Невірний email або пароль' : error.message)
    else { toast.success('Ласкаво просимо!'); navigate('/') }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!fullName || !email || !password) { toast.error('Заповніть всі поля'); return }
    if (password !== confirm) { toast.error('Паролі не збігаються'); return }
    if (password.length < 6) { toast.error('Пароль мінімум 6 символів'); return }
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) toast.error(error.message)
    else toast.success('Реєстрація успішна! Перевірте email для підтвердження.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-2xl">
            <MapPin className="w-7 h-7" />
            TourBook
          </Link>
          <p className="text-gray-500 text-sm mt-1">Бронювання туристичних послуг</p>
        </div>

        <div className="card p-8">
          {/* Tabs */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors
                  ${tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {t === 'login' ? 'Увійти' : 'Реєстрація'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" className="input pr-10" required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Вхід...' : 'Увійти'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Повне ім'я</label>
                <input
                  type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Іван Петренко" className="input" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Мінімум 6 символів" className="input pr-10" required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Підтвердження пароля</label>
                <input
                  type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Повторіть пароль" className="input" required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Реєстрація...' : 'Зареєструватись'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
