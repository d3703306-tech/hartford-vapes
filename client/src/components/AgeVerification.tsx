import { useState } from 'react'
import { Link } from 'react-router-dom'

interface AgeVerificationProps {
  onVerified: () => void
}

export default function AgeVerification({ onVerified }: AgeVerificationProps) {
  const [birthDate, setBirthDate] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!birthDate) {
      setError('Please enter your date of birth')
      return
    }

    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    if (age >= 21) {
      onVerified()
    } else {
      setError('You must be 21 or older to enter this site')
    }
  }

  return (
    <div className="age-overlay">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-6">🔞</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Age Verification Required
        </h1>
        <p className="text-gray-600 mb-6">
          You must be 21 years or older to enter this website.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Enter Site
          </button>
        </form>

        <p className="text-gray-500 text-sm mt-6">
          By entering, you agree to our{' '}
          <Link to="#" className="text-primary-600 hover:underline">Terms</Link>
          {' '}and{' '}
          <Link to="#" className="text-primary-600 hover:underline">Privacy Policy</Link>
        </p>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-500">
            This website sells vaping products intended for adults 21+.
          </p>
        </div>
      </div>
    </div>
  )
}
