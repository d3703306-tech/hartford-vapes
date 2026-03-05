import { Outlet, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check for logged in user
    const userData = localStorage.getItem('hartfordvapes_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('hartfordvapes_token')
    localStorage.removeItem('hartfordvapes_user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl">💨</span>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                HartfordVapes
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/shop" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                Shop
              </Link>
              <Link to="/deals" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                <span className="text-red-500">🔥</span> Deals
              </Link>
              <Link to="/cart" className="text-gray-600 hover:text-purple-600 font-medium transition-colors flex items-center gap-1">
                <span>🛒</span>
              </Link>
              
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 font-medium">Hi, {user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/auth/login" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg transition-all">
                  Login
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <Link to="/shop" className="block py-2 text-gray-600 hover:text-purple-600 font-medium">
                Shop
              </Link>
              <Link to="/deals" className="block py-2 text-gray-600 hover:text-purple-600 font-medium">
                🔥 Deals
              </Link>
              <Link to="/cart" className="block py-2 text-gray-600 hover:text-purple-600 font-medium">
                🛒 Cart
              </Link>
              {user ? (
                <>
                  <div className="py-2 text-gray-600 font-medium">Hi, {user.name}</div>
                  <button onClick={handleLogout} className="block py-2 text-red-600 font-medium">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/auth/login" className="block py-2 text-purple-600 font-medium">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">💨</span>
                <span className="text-xl font-bold">HartfordVapes</span>
              </div>
              <p className="text-slate-400 text-sm">
                Your trusted source for premium vaping products.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold mb-4 text-lg">Shop</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/shop/disposables" className="hover:text-white">Disposables</Link></li>
                <li><Link to="/shop/e-liquids" className="hover:text-white">E-Liquids</Link></li>
                <li><Link to="/shop/devices" className="hover:text-white">Devices</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold mb-4 text-lg">Support</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="#">Contact Us</Link></li>
                <li><Link to="#">FAQs</Link></li>
                <li><Link to="#">Shipping</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold mb-4 text-lg">Legal</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="#">Terms</Link></li>
                <li><Link to="#">Privacy</Link></li>
                <li><Link to="#">Age Verification</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-10 pt-8 text-center text-slate-400 text-sm">
            <p>© 2026 HartfordVapes. All rights reserved.</p>
            <p className="mt-2">⚠️ WARNING: 21+ only.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
