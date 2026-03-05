import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: string
  brand: string
  category: string
  inStock: boolean
}

const categories = [
  { id: 'all', name: 'All Products', icon: '🛍️' },
  { id: 'disposables', name: 'Disposables', icon: '🧴' },
  { id: 'e-liquids', name: 'E-Liquids', icon: '🧪' },
  { id: 'pods', name: 'Pods', icon: '🎯' },
  { id: 'devices', name: 'Devices', icon: '🔋' },
  { id: 'accessories', name: 'Accessories', icon: '🔧' },
]

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

export default function ShopPage() {
  const { category } = useParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(category || 'all')

  useEffect(() => {
    setLoading(true)
    const cat = category || 'all'
    setSelectedCategory(cat)
    
    fetch(`/api/products?category=${cat}&limit=20`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.data || [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [category])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {categories.find(c => c.id === selectedCategory)?.name || 'Shop'}
          </h1>
          <p className="text-gray-500 mt-1">Browse our selection of premium vaping products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 px-2">Categories</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop/${cat.id === 'all' ? '' : cat.id}`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-2xl h-80 animate-pulse"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <p className="text-gray-500 mb-4">{products.length} products found</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg">No products found in this category.</p>
                <Link to="/shop" className="text-purple-600 hover:text-purple-700 font-medium mt-4 inline-block">
                  Browse all products →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
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
          {product.comparePrice && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              SALE
            </span>
          )}
          {!product.inStock && (
            <span className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-medium px-4 py-2 bg-gray-800 rounded-lg">Out of Stock</span>
            </span>
          )}
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
