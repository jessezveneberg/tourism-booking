import { Link } from 'react-router-dom'
import { MapPin, Star, Users, ArrowRight } from 'lucide-react'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop'

const CATEGORY_COLORS = {
  tours:      'bg-green-100 text-green-700',
  hotels:     'bg-blue-100 text-blue-700',
  excursions: 'bg-purple-100 text-purple-700',
  transfers:  'bg-orange-100 text-orange-700',
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      <span className="text-sm font-medium text-gray-700">
        {rating ? Number(rating).toFixed(1) : 'Новинка'}
      </span>
    </div>
  )
}

export default function ServiceCard({ service }) {
  const image     = service.images?.[0] || PLACEHOLDER
  const category  = service.service_categories
  const colorClass = CATEGORY_COLORS[category?.slug] || 'bg-gray-100 text-gray-700'

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = PLACEHOLDER }}
        />
        {category && (
          <span className={`badge absolute top-3 left-3 ${colorClass}`}>
            {category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 line-clamp-2">
          {service.name}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{service.location_city || 'Україна'}</span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {service.description || 'Опис незабаром...'}
        </p>

        <div className="flex items-center justify-between mb-4">
          <StarRating rating={service.rating_avg} />
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Users className="w-4 h-4" />
            <span>до {service.max_capacity} ос.</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              {Number(service.base_price).toLocaleString('uk-UA')}
            </span>
            <span className="text-gray-500 text-sm ml-1">грн</span>
          </div>
          <Link
            to={`/services/${service.id}`}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Детальніше
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
