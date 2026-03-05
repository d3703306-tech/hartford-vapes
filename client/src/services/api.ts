import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hartfordvapes_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hartfordvapes_token')
      localStorage.removeItem('hartfordvapes_user')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () => api.get('/auth/me'),
  
  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put('/auth/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
}

// Products API
export const productsApi = {
  getAll: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/products', { params }),
  
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  
  getDeals: () => api.get('/products/deals'),
  
  getCategories: () => api.get('/categories'),
}

// Cart API
export const cartApi = {
  get: () => api.get('/cart'),
  
  addItem: (data: { productId: string; quantity?: number; variant?: string }) =>
    api.post('/cart/items', data),
  
  updateQuantity: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  
  clear: () => api.delete('/cart'),
}

// Orders API
export const ordersApi = {
  getAll: () => api.get('/orders'),
  
  getByNumber: (orderNumber: string) => api.get(`/orders/${orderNumber}`),
  
  create: (data: { 
    shippingAddressId: string; 
    billingAddressId?: string; 
    paymentMethod: string;
    notes?: string;
  }) => api.post('/orders', data),
  
  cancel: (orderNumber: string) => api.post(`/orders/${orderNumber}/cancel`),
}

// Payments API
export const paymentsApi = {
  createPaymentIntent: (orderId: string) =>
    api.post('/payments/create-payment-intent', { orderId }),
  
  confirm: (orderId: string, paymentIntentId: string) =>
    api.post('/payments/confirm', { orderId, paymentIntentId }),
}

// Addresses API
export const addressesApi = {
  getAll: () => api.get('/addresses'),
  
  create: (data: any) => api.post('/addresses', data),
  
  update: (id: string, data: any) => api.put(`/addresses/${id}`, data),
  
  delete: (id: string) => api.delete(`/addresses/${id}`),
  
  setDefault: (id: string) => api.post(`/addresses/${id}/default`),
}

// Reviews API
export const reviewsApi = {
  create: (data: { productId: string; rating: number; title?: string; content?: string }) =>
    api.post('/reviews', data),
  
  getByProduct: (productId: string) => api.get(`/reviews/product/${productId}`),
}

export default api
