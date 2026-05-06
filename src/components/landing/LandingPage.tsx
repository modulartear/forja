'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Truck,
  Zap,
  Star,
  Package,
  CreditCard,
  MessageCircle,
  CircleCheckBig,
  CircleX,
  CircleAlert,
  ShoppingCart,
  Plus,
  ChevronRight,
  Tag,
  Filter,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { CartSheet } from '@/components/cart/CartSheet'

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

interface LandingPageProps {
  products: Product[]
  combos: Combo[]
  categories: Category[]
  storeConfig?: {
    STORE_NAME?: string
    STORE_LOGO?: string
    STORE_FAVICON?: string
    STORE_TITLE?: string
    STORE_DESCRIPTION?: string
    STORE_WHATSAPP?: string
  }
  onGoToAdmin: () => void
  paymentStatus: string | null
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

/* ── Product Card ─────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  const [imgIndex, setImgIndex] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const images = [product.image1, product.image2].filter(Boolean) as string[]
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image1, type: 'product' })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <motion.div variants={fadeInUp}>
      <div
        className="forja-card group cursor-pointer rounded-xl overflow-hidden"
        onClick={() => { window.location.href = '/producto/' + product.id }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#070c18]">
          {images.length > 0 ? (
            <>
              <img
                src={images[imgIndex % images.length]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setImgIndex(i) }}
                      className={`h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-[#1a9fff] w-5' : 'bg-white/30 w-1.5'}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#1a9fff]/30">
              <Package className="w-16 h-16" />
            </div>
          )}
          {/* Price badge */}
          <div className="absolute top-3 right-3 bg-[#1a9fff] text-white text-sm font-bold px-3 py-1 rounded-lg shadow-lg"
            style={{ boxShadow: '0 0 12px rgba(26,159,255,0.6)' }}>
            ${product.price.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
          </div>
          {/* Category badge */}
          {product.category && (
            <div className="absolute top-3 left-3 bg-[#05080f]/80 backdrop-blur-sm text-[#1a9fff] text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#1a9fff]/30"
              style={{ boxShadow: '0 0 8px rgba(26,159,255,0.2)' }}>
              <Tag className="w-3 h-3 inline mr-1 -mt-0.5" />
              {product.category.name}
            </div>
          )}
          {/* Add to cart overlay */}
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shadow-lg transition-all ${
                addedToCart
                  ? 'bg-[#1a9fff] text-white'
                  : 'bg-[#05080f]/90 text-[#1a9fff] border border-[#1a9fff]/50 hover:border-[#1a9fff]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {addedToCart ? '¡Agregado!' : 'Agregar'}
            </motion.button>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-white mb-1.5 leading-tight">{product.name}</h3>
          <p className="text-[#5c8ab0] text-sm line-clamp-2 leading-relaxed">{product.description}</p>
          <button
            onClick={handleAddToCart}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all md:hidden ${
              addedToCart
                ? 'bg-[#1a9fff]/20 text-[#1a9fff] border border-[#1a9fff]/40'
                : 'bg-[#1a9fff]/10 text-[#1a9fff] border border-[#1a9fff]/20 hover:bg-[#1a9fff]/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            {addedToCart ? 'Agregado al carrito' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Combo Card ───────────────────────────────── */
function ComboCard({ combo }: { combo: Combo }) {
  const [imgIndex, setImgIndex] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const images = [combo.image1, combo.image2].filter(Boolean) as string[]
  const discount = combo.originalPrice > 0 ? Math.round((1 - combo.price / combo.originalPrice) * 100) : 0
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({ id: combo.id, name: combo.name, price: combo.price, image: combo.image1, type: 'combo' })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <motion.div variants={fadeInUp}>
      <div
        className="group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{
          background: '#0a0f1e',
          border: '1px solid rgba(26,159,255,0.35)',
          boxShadow: '0 0 0 transparent',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 24px rgba(26,159,255,0.2), 0 8px 40px rgba(0,0,0,0.6)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 transparent')}
        onClick={() => { window.location.href = '/producto/' + combo.id + '?type=combo' }}
      >
        {/* Discount ribbon */}
        {discount > 0 && (
          <div className="relative">
            <div className="absolute top-0 left-0 bg-red-500 text-white font-bold text-xs px-4 py-1.5 rounded-br-xl z-10"
              style={{ boxShadow: '0 0 10px rgba(239,68,68,0.5)' }}>
              -{discount}% OFF
            </div>
          </div>
        )}
        <div className="relative aspect-square overflow-hidden bg-[#070c18]">
          {images.length > 0 ? (
            <>
              <img
                src={images[imgIndex % images.length]}
                alt={combo.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setImgIndex(i) }}
                      className={`h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-[#1a9fff] w-5' : 'bg-white/30 w-1.5'}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#1a9fff]/30">
              <Star className="w-16 h-16" />
            </div>
          )}
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shadow-lg transition-all ${
                addedToCart
                  ? 'bg-[#1a9fff] text-white'
                  : 'bg-[#05080f]/90 text-[#1a9fff] border border-[#1a9fff]/50'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {addedToCart ? '¡Agregado!' : 'Agregar'}
            </motion.button>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-[#1a9fff] border border-[#1a9fff]/40 bg-[#1a9fff]/10">
              COMBO
            </span>
            <h3 className="font-bold text-lg text-white leading-tight">{combo.name}</h3>
          </div>
          <p className="text-[#5c8ab0] text-sm mb-4 line-clamp-2">{combo.description}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#1a9fff]" style={{ textShadow: '0 0 12px rgba(26,159,255,0.5)' }}>
              ${combo.price.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </span>
            {combo.originalPrice > 0 && (
              <span className="text-sm text-[#5c8ab0] line-through">
                ${combo.originalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all md:hidden ${
              addedToCart
                ? 'bg-[#1a9fff]/20 text-[#1a9fff] border border-[#1a9fff]/40'
                : 'bg-[#1a9fff]/10 text-[#1a9fff] border border-[#1a9fff]/20 hover:bg-[#1a9fff]/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            {addedToCart ? 'Agregado al carrito' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Payment Result ───────────────────────────── */
function PaymentResult({ status, onDismiss }: { status: 'exitoso' | 'fallido' | 'pendiente'; onDismiss: () => void }) {
  const config = {
    exitoso: {
      icon: CircleCheckBig, color: 'text-[#1a9fff]', bg: 'bg-[#1a9fff]/10', border: 'border-[#1a9fff]/30',
      title: '¡Pago exitoso!', subtitle: 'Tu pedido fue recibido. Te contactaremos a la brevedad para coordinar el envío.',
      btnClass: 'neon-btn text-white',
    },
    fallido: {
      icon: CircleX, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30',
      title: 'El pago no se completó', subtitle: 'Hubo un problema con el pago. Podés intentar nuevamente o contactarnos por WhatsApp.',
      btnClass: 'bg-red-500 hover:bg-red-600 text-white',
    },
    pendiente: {
      icon: CircleAlert, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30',
      title: 'Pago pendiente', subtitle: 'Tu pago está siendo procesado. Te enviaremos confirmación cuando se acredite.',
      btnClass: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    },
  }
  const c = config[status]
  const CIcon = c.icon
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#05080f' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
        <div className={`${c.bg} ${c.border} border-2 rounded-3xl p-10 space-y-6`}>
          <div className={`w-20 h-20 ${c.bg} rounded-full flex items-center justify-center mx-auto`}>
            <CIcon className={`w-10 h-10 ${c.color}`} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{c.title}</h1>
            <p className="text-[#5c8ab0] mt-3 leading-relaxed">{c.subtitle}</p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Button className={`w-full h-12 ${c.btnClass} font-bold rounded-xl text-base`} onClick={onDismiss}>
              Volver a la tienda
            </Button>
            {status !== 'exitoso' && (
              <Button variant="outline" className="w-full h-11 rounded-xl gap-2 border-[#1a9fff]/30 text-[#1a9fff] hover:bg-[#1a9fff]/10"
                onClick={() => window.open(whatsappUrl, '_blank')}>
                <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Main Landing Page ────────────────────────── */
export default function LandingPage({ products, combos, categories, storeConfig, onGoToAdmin, paymentStatus }: LandingPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const storeName = storeConfig?.STORE_NAME || 'FORJA'
  const storeLogo = storeConfig?.STORE_LOGO || '/forja-logo.jpg'
  const storeWhatsapp = storeConfig?.STORE_WHATSAPP || ''
  const storeDescription = storeConfig?.STORE_DESCRIPTION || 'Los mejores productos, los mejores precios. Descubrí nuestra selección exclusiva y hacé tu pedido hoy.'
  const whatsappUrl = storeWhatsapp ? `https://wa.me/${storeWhatsapp}` : 'https://wa.me/'

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoryId === selectedCategory)
    : products

  if (paymentStatus) {
    return (
      <PaymentResult
        status={paymentStatus as 'exitoso' | 'fallido' | 'pendiente'}
        onDismiss={() => { window.location.hash = '' }}
      />
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#05080f' }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{ background: 'rgba(5,8,15,0.85)', borderColor: 'rgba(26,159,255,0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={storeLogo} alt={storeName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover neon-flicker"
                  style={{ boxShadow: '0 0 16px rgba(26,159,255,0.6)' }} />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-wider neon-text">{storeName}</span>
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white/60">STORE</span>
            </div>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#productos" className="text-[#5c8ab0] hover:text-[#1a9fff] transition-colors font-medium text-sm tracking-wide">
                PRODUCTOS
              </a>
              <a href="#combos" className="text-[#5c8ab0] hover:text-[#1a9fff] transition-colors font-medium text-sm tracking-wide">
                COMBOS
              </a>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <CartSheet />
              <button onClick={onGoToAdmin}
                className="text-[#5c8ab0]/50 hover:text-[#1a9fff]/50 text-xs transition-colors px-2 py-1">
                Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden scanlines"
        style={{ background: 'linear-gradient(135deg, #05080f 0%, #070d1f 50%, #040b18 100%)' }}>
        {/* Background glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20"
            style={{ background: 'radial-gradient(circle, #1a9fff, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-15"
            style={{ background: 'radial-gradient(circle, #0066cc, transparent)' }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(rgba(26,159,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(26,159,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
        </div>

        <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-44 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            {/* Logo hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <img src={storeLogo} alt={storeName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover"
                style={{ boxShadow: '0 0 40px rgba(26,159,255,0.7), 0 0 80px rgba(26,159,255,0.3)' }} />
            </motion.div>

            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-semibold tracking-widest text-[#1a9fff] border border-[#1a9fff]/30 bg-[#1a9fff]/5">
              <Zap className="w-3.5 h-3.5" />
              TIENDA ONLINE OFICIAL
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-4 leading-none tracking-tight">
              {storeName}
            </h1>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 tracking-widest neon-text neon-flicker">
              STORE
            </h2>
            <p className="text-base sm:text-lg text-[#5c8ab0] max-w-2xl mx-auto mb-12 leading-relaxed">
              {storeDescription}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#productos">
                <button className="neon-btn forja-pulse text-white font-bold text-base px-10 py-4 rounded-xl flex items-center gap-2">
                  Ver Productos <ChevronRight className="w-5 h-5" />
                </button>
              </a>
              <a href="#combos">
                <button className="text-[#1a9fff] font-bold text-base px-10 py-4 rounded-xl border border-[#1a9fff]/40 bg-[#1a9fff]/5 hover:bg-[#1a9fff]/10 transition-all flex items-center gap-2">
                  Ver Combos <ChevronRight className="w-5 h-5" />
                </button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-[2]"
          style={{ background: 'linear-gradient(to top, #05080f, transparent)' }} />
      </section>

      {/* ── Trust Badges ── */}
      <section className="py-12 border-y" style={{ borderColor: 'rgba(26,159,255,0.1)', background: '#07090f' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, label: 'Calidad Garantizada', desc: 'Productos premium' },
              { icon: Truck, label: 'Envío Rápido', desc: 'A todo el país' },
              { icon: Zap, label: 'Entrega Segura', desc: 'Sin sorpresas' },
              { icon: Star, label: 'Mejores Precios', desc: 'Siempre competitivos' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center p-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'rgba(26,159,255,0.08)', border: '1px solid rgba(26,159,255,0.2)' }}>
                  <item.icon className="w-6 h-6 text-[#1a9fff]" />
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base mb-0.5">{item.label}</h3>
                <p className="text-[#5c8ab0] text-xs sm:text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products Section ── */}
      <section id="productos" className="py-20 sm:py-28" style={{ background: '#05080f' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-[#1a9fff] border border-[#1a9fff]/25 bg-[#1a9fff]/5">
              CATÁLOGO
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              Nuestros <span className="neon-text">Productos</span>
            </h2>
            <p className="text-[#5c8ab0] max-w-xl mx-auto">
              Seleccionados con criterio, entregados con compromiso.
            </p>
          </motion.div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                  selectedCategory === null
                    ? 'bg-[#1a9fff] text-white border-[#1a9fff]'
                    : 'bg-[#0a0f1e] text-[#5c8ab0] border-[#1a9fff]/20 hover:border-[#1a9fff]/50 hover:text-[#1a9fff]'
                }`}
                style={selectedCategory === null ? { boxShadow: '0 0 16px rgba(26,159,255,0.4)' } : {}}
              >
                <Filter className="w-3.5 h-3.5" />
                Todos
              </button>
              {categories.filter(c => c.isActive).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                    selectedCategory === category.id
                      ? 'bg-[#1a9fff] text-white border-[#1a9fff]'
                      : 'bg-[#0a0f1e] text-[#5c8ab0] border-[#1a9fff]/20 hover:border-[#1a9fff]/50 hover:text-[#1a9fff]'
                  }`}
                  style={selectedCategory === category.id ? { boxShadow: '0 0 16px rgba(26,159,255,0.4)' } : {}}
                >
                  {category.image ? (
                    <img src={category.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <Tag className="w-3.5 h-3.5" />
                  )}
                  {category.name}
                  {category._count && (
                    <span className={`text-xs ml-0.5 ${selectedCategory === category.id ? 'text-white/70' : 'text-[#5c8ab0]/60'}`}>
                      ({category._count.products})
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {filteredProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }}
            >
              {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(26,159,255,0.05)', border: '1px solid rgba(26,159,255,0.15)' }}>
                <Package className="w-10 h-10 text-[#1a9fff]/30" />
              </div>
              <p className="text-[#5c8ab0] text-lg">
                {selectedCategory
                  ? 'No hay productos en esta categoría'
                  : 'Pronto tendremos productos disponibles'}
              </p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mt-4 text-[#1a9fff] text-sm font-semibold hover:underline"
                >
                  Ver todos los productos
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Combos Section ── */}
      {combos.length > 0 && (
        <section id="combos" className="py-20 sm:py-28"
          style={{ background: 'linear-gradient(180deg, #07090f 0%, #05080f 100%)', borderTop: '1px solid rgba(26,159,255,0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-14">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-[#1a9fff] border border-[#1a9fff]/25 bg-[#1a9fff]/5">
                OFERTAS ESPECIALES
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                Combos con <span className="neon-text">Descuento</span>
              </h2>
              <p className="text-[#5c8ab0] max-w-xl mx-auto">
                La mejor relación calidad-precio para tu pedido.
              </p>
            </motion.div>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }}>
              {combos.map((combo) => <ComboCard key={combo.id} combo={combo} />)}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #040b18 0%, #07101e 50%, #040a15 100%)', borderTop: '1px solid rgba(26,159,255,0.15)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(26,159,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(26,159,255,1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-15"
            style={{ background: 'radial-gradient(ellipse, #1a9fff, transparent)' }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">
              ¿Listo para hacer tu pedido?
            </h2>
            <p className="text-[#5c8ab0] text-lg mb-10 max-w-2xl mx-auto">
              Contactanos por WhatsApp y te asesoramos en todo el proceso.
            </p>
            <button
              onClick={() => window.open(whatsappUrl, '_blank')}
              className="neon-btn forja-pulse text-white font-bold text-lg px-12 py-4 rounded-xl inline-flex items-center gap-3"
            >
              <MessageCircle className="w-5 h-5" />
              Contactar por WhatsApp
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 border-t" style={{ background: '#03050c', borderColor: 'rgba(26,159,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={storeLogo} alt={storeName}
                className="w-9 h-9 rounded-full object-cover"
                style={{ boxShadow: '0 0 10px rgba(26,159,255,0.4)' }} />
              <span className="text-lg font-black text-white tracking-wider">{storeName}</span>
              <span className="text-lg font-black text-white/40 tracking-wider">STORE</span>
            </div>
            <div className="flex items-center gap-2 text-[#5c8ab0]">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs">Pagos seguros con MercadoPago</span>
            </div>
            <p className="text-[#5c8ab0] text-xs">© {new Date().getFullYear()} Forja Store. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
