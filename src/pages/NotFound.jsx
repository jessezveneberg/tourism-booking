import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl mb-4">🗺️</p>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <p className="text-lg text-gray-500 mb-6">Сторінку не знайдено</p>
      <Link to="/" className="btn-primary">← На головну</Link>
    </div>
  )
}
