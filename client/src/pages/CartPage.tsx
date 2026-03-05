import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartApi, productsApi } from '../services/api'

export default function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    const token = localStorage.getItem('hartfordvapes_token')
    if (!token) {
      setError('Please login to view your cart')
      setLoading(false)
      return
    }

    try {
      const { data } = await cartApi.get()
      setCart(data)
    } catch (err: any) {
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        await cartApi.removeItem(itemId)
      } else {
        await cartApi.updateQuantity(itemId, quantity)
      }
      loadCart()
    } catch (err) {
      console.error('Failed to update quantity')
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await cartApi.removeItem(itemId)
      loadCart()
    } catch (err) {
      console.error('Failed to remove item')
    }
  }

  const subtotal = cart?.items?.reduce((sum: number, item: any) => 
    sum + (item.product?.price || 0) * item.quantity, 0) || 0
  const tax = subtotal * 0.0825
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + tax + shipping

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <Link to="/auth/login" className="inline-block bg-purple-600 text-white px-6 py-3 rounded-xl font-bold mt-4">
            Login
          </Link>
        </div>
      </div>
    )
  }

  const items = cart?.items || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🛒 Shopping Cart</h1>

        {items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: any) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{item.product?.name || 'Product'}</h3>
                    <p className="text-sm text-gray-500">{item.variant || 'Default'}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border-2 border-gray-200 rounded-xl">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100 rounded-l-xl"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100 rounded-r-xl"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xl font-bold text-purple-600">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8.25%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {subtotal < 50 && (
                    <p className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all mt-6 shadow-lg">
                  Proceed to Checkout
                </button>

                <Link to="/shop" className="block text-center text-purple-600 hover:text-purple-700 font-medium mt-4">
                  Continue Shopping →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Browse our products and add items to your cart!</p>
            <Link to="/shop" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
