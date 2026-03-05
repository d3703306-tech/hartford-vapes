import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: string
  brand: string
}

const defaultImages: Record<string, string> = {
  'ELF Bar': 'https://placehold.co/400x400/6366f1/white?text=ELF+Bar',
  'Lost Mary': 'https://placehold.co/400x400/ec4899/white?text=Lost+Mary',
  'Raz': 'https://placehold.co/400x400/8b5cf6/white?text=Raz',
  'Vaporesso': 'https://placehold.co/400x400/10b981/white?text=Vaporesso',
  'Smok': 'https://placehold.co/400x400/f59e0b/white?text=Smok',
  'Juicy': 'https://placehold.co/400x400/ef4444/white?text=Juicy',
}

const getProductImage = (product: Product): string => {
  try {
    const images = JSON.parse(product.images || '[]')
    if (images && images.length > 0) return images[0]
  } catch {}
  
  for (const [brand, img] of Object.entries(defaultImages)) {
    if (product.brand?.toLowerCase().includes(brand.toLowerCase())) {
      return img
    }
  }
  
  return 'https://placehold.co/400x400/374151/white?text=Product'
}

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products/deals')
      .then(res => res.json())
      .then(data => {
        setProducts(data || [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">🔥</div>
          <h1 className="text-5xl font-bold mb-4">Hot Deals</h1>
          <p className="text-xl text-red-100">Limited time offers - Save big on top brands!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const savings = product.comparePrice ? product.comparePrice - product.price : 0
              const percentOff = product.comparePrice ? Math.round((savings / product.comparePrice) * 100) : 0
              
              return (
                <Link key={product.id} to={`/product/${product.slug}`} className="group">
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                    <div className="aspect-square relative bg-gray-100 overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/374151/white?text=Product'
                        }}
                      />
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                        {percentOff}% OFF
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-500 font-medium">{product.brand}</p>
                      <h3 className="font-bold text-gray-900 mt-1 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-2xl font-bold text-red-600">${product.price}</span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-400 line-through">${product.comparePrice}</span>
                        )}
                      </div>
                      {savings > 0 && (
                        <p className="text-sm text-green-600 mt-1 font-medium">Save ${savings.toFixed(2)}!</p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-500 text-lg">No deals available right now.</p>
            <p className="text-gray-400 mt-2">Check back later for amazing offers!</p>
            <Link to="/shop" className="text-purple-600 hover:text-purple-700 font-medium mt-4 inline-block">
              Browse all products →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
