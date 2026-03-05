import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

export default function ProductPage() {
  const { slug } = useParams()
  const [selectedFlavor, setSelectedFlavor] = useState('')
  const [selectedNicotine, setSelectedNicotine] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Demo product data
  const product = {
    id: '1',
    name: 'ELF Bar BC5000',
    slug: slug,
    description: 'The ELF Bar BC5000 offers up to 5000 puffs with mesh coil and 10ml e-liquid capacity. Experience smooth flavor delivery with every puff. Perfect for beginners and experienced vapers alike. Features:\n\n• 5000 puffs capacity\n• Rechargeable battery\n• Mesh coil for better flavor\n• 10ml e-liquid\n• Draw-activated',
    category: 'disposables',
    brand: 'ELF Bar',
    price: 19.99,
    comparePrice: 24.99,
    inStock: true,
    stock: 100,
    rating: 4.5,
    reviewCount: 128,
    isOnSale: true,
    nicotineLevels: ['0mg', '3mg', '5mg'],
    flavors: ['Watermelon', 'Strawberry', 'Mango', 'Blue Razz', 'Strawberry Banana'],
    images: ['https://placehold.co/600x600/6366f1/white?text=ELF+Bar+BC5000']
  }

  const getMainImage = () => {
    return product.images[0] || 'https://placehold.co/600x600/374151/white?text=Product'
  }

  const handleAddToCart = () => {
    alert(`Added ${quantity} x ${product.name} to cart!`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="text-purple-600 hover:text-purple-700 mb-6 inline-block font-medium">
          ← Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={getMainImage()}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details Section */}
          <div>
            <p className="text-purple-600 font-medium">{product.brand}</p>
            <h1 className="text-4xl font-bold text-gray-900 mt-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}>★</span>
                ))}
              </div>
              <span className="text-gray-500">({product.reviewCount} reviews)</span>
              <span className="text-gray-300">|</span>
              <span className="text-green-600 font-medium">In Stock</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mt-6">
              <span className="text-4xl font-bold text-purple-600">${product.price}</span>
              {product.comparePrice && (
                <>
                  <span className="text-2xl text-gray-400 line-through">${product.comparePrice}</span>
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    SAVE ${(product.comparePrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Flavor Selection */}
            {product.flavors.length > 0 && (
              <div className="mt-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">Select Flavor</label>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map((flavor) => (
                    <button
                      key={flavor}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        selectedFlavor === flavor
                          ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nicotine Selection */}
            {product.nicotineLevels.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">Nicotine Strength</label>
                <div className="flex flex-wrap gap-2">
                  {product.nicotineLevels.map((nic) => (
                    <button
                      key={nic}
                      onClick={() => setSelectedNicotine(nic)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        selectedNicotine === nic
                          ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {nic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="mt-8 flex gap-4">
              <div className="flex items-center border-2 border-gray-200 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-gray-100 rounded-l-xl"
                >
                  −
                </button>
                <span className="px-6 py-3 font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-gray-100 rounded-r-xl"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.inStock ? '🛒 Add to Cart' : 'Out of Stock'}
              </button>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h3 className="font-bold text-gray-900 mb-3">Description</h3>
              <div className="text-gray-600 whitespace-pre-line">{product.description}</div>
            </div>

            {/* Warning */}
            <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ WARNING: This product contains nicotine. Nicotine is an addictive chemical.
              </p>
            </div>

            {/* Features */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-800">Free Shipping $50+</span>
              </div>
              <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-800">Same Day Dispatch</span>
              </div>
              <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-800">Secure Checkout</span>
              </div>
              <div className="bg-green-50 rounded-xl p-3 flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm text-green-800">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
