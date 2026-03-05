import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  })
})

// Import routes
import authRoutes from './routes/auth'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/orders'
import addressRoutes from './routes/addresses'

// Use routes
app.use('/api/auth', authRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/addresses', addressRoutes)

// Products (simplified for now)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, page = '1', limit = '20' } = req.query
    
    const where: any = { isActive: true, inStock: true }
    
    if (category && category !== 'all') {
      where.category = { slug: category as string }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { brand: { contains: search as string, mode: 'insensitive' } }
      ]
    }
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      }),
      prisma.product.count({ where })
    ])
    
    res.json({
      data: products,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string))
    })
  } catch (error) {
    console.error('Products error:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

app.get('/api/products/deals', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isOnSale: true, isActive: true, inStock: true },
      take: 10,
      include: { category: true }
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals' })
  }
})

app.get('/api/products/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { 
        category: true,
        reviews: { 
          include: { user: { select: { name: true } } }, 
          take: 10 
        }
      }
    })
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } }
    })
    
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { 
        children: true,
        _count: { select: { products: true } }
      }
    })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Seed data endpoint (for demo)
app.post('/api/seed', async (req, res) => {
  try {
    // Create categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'disposables' },
        update: {},
        create: { name: 'Disposables', slug: 'disposables', icon: '🧴', description: 'Ready to use vapes' }
      }),
      prisma.category.upsert({
        where: { slug: 'e-liquids' },
        update: {},
        create: { name: 'E-Liquids', slug: 'e-liquids', icon: '🧪', description: 'Premium e-juice' }
      }),
      prisma.category.upsert({
        where: { slug: 'devices' },
        update: {},
        create: { name: 'Devices', slug: 'devices', icon: '🔋', description: 'Vape devices' }
      }),
    ])

    // Sample products
    const products = [
      {
        name: 'ELF Bar BC5000',
        slug: 'elf-bar-bc5000',
        description: 'The ELF Bar BC5000 offers up to 5000 puffs with mesh coil and 10ml e-liquid capacity.',
        categoryId: categories[0].id,
        brand: 'ELF Bar',
        images: ['https://placehold.co/400x400/6366f1/white?text=ELF+Bar'],
        price: 19.99,
        comparePrice: 24.99,
        inStock: true,
        stock: 100,
        rating: 4.5,
        reviewCount: 128,
        isFeatured: true,
        isOnSale: true,
        nicotineLevels: ['0mg', '3mg', '5mg'],
        flavors: ['Watermelon', 'Strawberry', 'Mango', 'Blue Razz']
      },
      {
        name: 'Lost Mary QM600',
        slug: 'lost-mary-qm600',
        description: 'Lost Mary QM600 offers 600 puffs in a compact design.',
        categoryId: categories[0].id,
        brand: 'Lost Mary',
        images: ['https://placehold.co/400x400/ec4899/white?text=Lost+Mary'],
        price: 14.99,
        inStock: true,
        stock: 150,
        rating: 4.3,
        reviewCount: 89,
        isFeatured: true,
        isOnSale: false,
        nicotineLevels: ['0mg', '2mg', '5mg'],
        flavors: ['Berry', 'Fruity', 'Mint']
      },
      {
        name: 'Raz DA15000',
        slug: 'raz-da15000',
        description: 'Raz DA15000 features smart display and 15,000 puffs.',
        categoryId: categories[0].id,
        brand: 'Raz',
        images: ['https://placehold.co/400x400/8b5cf6/white?text=Raz'],
        price: 24.99,
        comparePrice: 29.99,
        inStock: true,
        stock: 75,
        rating: 4.7,
        reviewCount: 256,
        isFeatured: true,
        isOnSale: true,
        nicotineLevels: ['0mg', '5mg', '50mg'],
        flavors: ['Birthday Cake', 'Miami Mint', 'Strawberry Gelato']
      },
      {
        name: 'Vaporesso XROS Pro',
        slug: 'vaporesso-xros-pro',
        description: 'Advanced pod system with adjustable airflow.',
        categoryId: categories[2].id,
        brand: 'Vaporesso',
        images: ['https://placehold.co/400x400/10b981/white?text=XROS+Pro'],
        price: 49.99,
        inStock: true,
        stock: 30,
        rating: 4.6,
        reviewCount: 67,
        isFeatured: false,
        isOnSale: false,
        nicotineLevels: [],
        flavors: []
      },
    ]

    for (const product of products) {
      await prisma.product.upsert({
        where: { slug: product.slug },
        update: product,
        create: product
      })
    }

    res.json({ message: 'Database seeded successfully', count: products.length })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: 'Failed to seed data' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
