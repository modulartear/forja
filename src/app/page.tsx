'use client'

import { useState, useEffect, useCallback } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image1: string | null
  image2: string | null
  categoryId?: string | null
  category?: { id: string; name: string; slug: string } | null
}

interface Combo {
  id: string
  name: string
  description: string
  items: string
  originalPrice: number
  price: number
  image1: string | null
  image2: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  isActive: boolean
  _count?: { products: number }
}

export default function Home() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing')
  const [products, setProducts] = useState<Product[]>([])
  const [combos, setCombos] = useState<Combo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [LandingPage, setLandingPage] = useState<React.ComponentType<any> | null>(null)
  const [DashboardPage, setDashboardPage] = useState<React.ComponentType<any> | null>(null)

  // Dynamic imports
  useEffect(() => {
    import('@/components/landing/LandingPage').then((mod) => {
      setLandingPage(() => mod.default)
    })
    import('@/components/dashboard/Dashboard').then((mod) => {
      setDashboardPage(() => mod.default)
    })
  }, [])

  // Payment status from hash
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)

  // Hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash
      if (hash === '#dashboard') {
        setView('dashboard')
        setPaymentStatus(null)
      } else if (hash === '#pago-exitoso') {
        setView('landing')
        setPaymentStatus('exitoso')
      } else if (hash === '#pago-fallido') {
        setView('landing')
        setPaymentStatus('fallido')
      } else if (hash === '#pago-pendiente') {
        setView('landing')
        setPaymentStatus('pendiente')
      } else {
        setView('landing')
        setPaymentStatus(null)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // Fetch data for landing page
  const fetchLandingData = useCallback(async () => {
    try {
      const [pRes, cRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/combos'),
        fetch('/api/categories'),
      ])
      const pData = await pRes.json()
      const cData = await cRes.json()
      const catData = await catRes.json()
      setProducts(Array.isArray(pData) ? pData : [])
      setCombos(Array.isArray(cData) ? cData : [])
      setCategories(Array.isArray(catData) ? catData : [])
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchLandingData()
  }, [fetchLandingData])

  if (view === 'dashboard' && DashboardPage) {
    return (
      <DashboardPage
        onGoBack={() => {
          window.location.hash = ''
          setView('landing')
          fetchLandingData()
        }}
      />
    )
  }

  if (view === 'landing' && LandingPage) {
    return (
      <LandingPage
        products={products}
        combos={combos}
        categories={categories}
        onGoToAdmin={() => {
          window.location.hash = '#dashboard'
          setView('dashboard')
        }}
        paymentStatus={paymentStatus}
      />
    )
  }

  // Loading state
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#05080f' }}>
      <div className="text-center">
        <img src="/forja-logo.jpg" alt="Forja Store"
          className="w-20 h-20 rounded-full mx-auto mb-5 object-cover"
          style={{ boxShadow: '0 0 30px rgba(26,159,255,0.6)' }} />
        <p className="text-[#1a9fff] text-sm font-bold tracking-widest">CARGANDO...</p>
      </div>
    </div>
  )
}
