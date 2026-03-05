import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import DealsPage from './pages/DealsPage'
import CartPage from './pages/CartPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AgeVerification from './components/AgeVerification'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  const [showAgeGate, setShowAgeGate] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const verified = localStorage.getItem('hartfordvapes_age_verified')
    if (verified === 'true') {
      setShowAgeGate(false)
      setIsVerified(true)
    }
  }, [])

  const handleVerified = () => {
    localStorage.setItem('hartfordvapes_age_verified', 'true')
    setShowAgeGate(false)
    setIsVerified(true)
  }

  if (showAgeGate) {
    return <AgeVerification onVerified={handleVerified} />
  }

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="shop/:category" element={<ShopPage />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="cart" element={<CartPage />} />
        </Route>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
      </Routes>
    </AuthProvider>
  )
}
