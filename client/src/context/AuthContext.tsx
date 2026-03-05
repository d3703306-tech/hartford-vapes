import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../services/api'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>
  logout: () => void
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('hartfordvapes_token')
    if (token) {
      try {
        const { data } = await authApi.getMe()
        setUser(data)
      } catch (error) {
        localStorage.removeItem('hartfordvapes_token')
        localStorage.removeItem('hartfordvapes_user')
      }
    }
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('hartfordvapes_token', data.token)
    localStorage.setItem('hartfordvapes_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const register = async (email: string, password: string, name: string, phone?: string) => {
    const { data } = await authApi.register({ email, password, name, phone })
    localStorage.setItem('hartfordvapes_token', data.token)
    localStorage.setItem('hartfordvapes_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('hartfordvapes_token')
    localStorage.removeItem('hartfordvapes_user')
    setUser(null)
  }

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    const { data: updatedUser } = await authApi.updateProfile(data)
    setUser(updatedUser)
    localStorage.setItem('hartfordvapes_user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
