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
  isFeatured?: boolean
  isOnSale?: boolean
}

const categories = [
  { id: 'disposables', name: 'Disposables', icon: '🧴', description: 'Ready to use, no charging needed' },
  { id: 'e-liquids', name: 'E-Liquids', icon: '🧪', description: 'Premium e-juice in many flavors' },
  { id: 'pods', name: 'Pods', icon: '🎯', description: 'Pod systems & cartridges' },
  { id: 'devices', name: 'Devices', icon: '🔋', description: 'Vape mods & starter kits' },
  { id: 'accessories', name: 'Accessories', icon: '🔧', description: 'Coils, chargers & more' },
]

// Default product images by category
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
  
  // Check brand for default image
  for (const [brand, img] of Object.entries(defaultImages)) {
    if (product.brand?.toLowerCase().includes(brand.toLowerCase())) {
      return img
    }
  }
  
  return 'https://placehold.co/400x400/374151/white?text=Product'
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [dealsProducts, setDealsProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?limit=12')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setFeaturedProducts(data.data.filter((p: Product) => p.isFeatured))
          setDealsProducts(data.data.filter((p: Product) => p.isOnSale))
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 text-9xl">💨</div>
          <div className="absolute bottom-10 right-10 text-7xl">🔥</div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <span className="inline-block bg-purple-500/30 text-purple-200 px-4 py-1 rounded-full text-sm font-medium mb-6">
              ✨ Premium Quality Vapes
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Premium Vapes, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Great Prices</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Discover our curated selection of the best vaping products. 
              From disposables to premium devices, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Shop Now →
              </Link>
              <Link
                to="/deals"
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
              >
                🔥 Hot Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop/${cat.id}`}
                className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center hover:shadow-xl hover:scale-105 transition-all"
              >
                <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="font-bold text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">⭐ Featured Products</h2>
            <Link to="/shop" className="text-purple-600 hover:text-purple-700 font-semibold">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-xl h-72 animate-pulse"></div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured products yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Deals Section */}
      <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">🔥 Hot Deals</h2>
              <p className="text-gray-600 mt-1">Limited time offers - Grab them before they're gone!</p>
            </div>
            <Link to="/deals" className="text-purple-600 hover:text-purple-700 font-semibold">
              View All Deals →
            </Link>
          </div>
          
          {dealsProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {dealsProducts.map((product) => (
                <ProductCard key={product.id} product={product} showSale />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No deals available right now. Check back later!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">New to Vaping?</h2>
          <p className="text-slate-400 text-lg mb-8">
            Check out our beginner-friendly devices and starter kits. 
            Need help? Our team is here to assist you.
          </p>
          <Link
            to="/shop/devices"
            className="inline-block bg-purple-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-purple-700 transition-all transform hover:scale-105"
          >
            Browse Starter Kits
          </Link>
        </div>
      </section>
    </div>
  )
}

function ProductCard({ product, showSale }: { product: Product; showSale?: boolean }) {
  const imageUrl = getProductImage(product)
  
  return (
    <Link to={`/product/${product.slug}`} className="group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
        <div className="aspect-square relative bg-gray-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/374151/white?text=Product'
            }}
          />
          {showSale && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              SALE
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 font-medium">{product.brand}</p>
          <h3 className="font-bold text-gray-900 mt-1 line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xl font-bold text-purple-600">${product.price}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through">${product.comparePrice}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
