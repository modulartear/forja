'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChevronLeft,
  CreditCard,
  MessageCircle,
  Loader2,
  Package,
  Truck,
  Shield,
} from 'lucide-react'
import {
  BuyerForm,
  ShippingAddressForm,
  ShippingSelector,
  handleMercadoPago,
  fallbackShipping,
} from '@/components/checkout/CheckoutForms'

interface ProductData {
  id: string
  name: string
  description: string
  price: number
  image1: string | null
  image2: string | null
  items?: string
  originalPrice?: number
}

function CheckoutContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const type = searchParams.get('type') || 'product'
  const qtyParam = parseInt(searchParams.get('qty') || '1', 10)

  const [item, setItem] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [quantity] = useState(qtyParam || 1)
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerDni, setBuyerDni] = useState('')
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [selectedShippingId, setSelectedShippingId] = useState('standard')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch(`/api/products/${id}?type=${type}`)
        if (!res.ok) throw new Error('Producto no encontrado')
        const data = await res.json()
        setItem(data.item)
      } catch {
        setError('No pudimos cargar este producto.')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id, type])

  const provinces = [
    { code: 'B', name: 'Buenos Aires' },
    { code: 'C', name: 'Ciudad Autonoma de Buenos Aires' },
    { code: 'K', name: 'Catamarca' },
    { code: 'H', name: 'Chaco' },
    { code: 'U', name: 'Chubut' },
    { code: 'X', name: 'Cordoba' },
    { code: 'W', name: 'Corrientes' },
    { code: 'E', name: 'Entre Rios' },
    { code: 'P', name: 'Formosa' },
    { code: 'Y', name: 'Jujuy' },
    { code: 'L', name: 'La Pampa' },
    { code: 'F', name: 'La Rioja' },
    { code: 'M', name: 'Mendoza' },
    { code: 'N', name: 'Misiones' },
    { code: 'Q', name: 'Neuquen' },
    { code: 'R', name: 'Rio Negro' },
    { code: 'A', name: 'Salta' },
    { code: 'J', name: 'San Juan' },
    { code: 'D', name: 'San Luis' },
    { code: 'Z', name: 'Santa Cruz' },
    { code: 'S', name: 'Santa Fe' },
    { code: 'G', name: 'Santiago del Estero' },
    { code: 'V', name: 'Tierra del Fuego' },
    { code: 'T', name: 'Tucuman' },
  ]

  const unitPrice = item?.price || 0
  const activeOptions = [fallbackShipping.standard, fallbackShipping.express]
  const selectedOption = activeOptions.find(o => o.id === selectedShippingId) || activeOptions[0]
  const shippingCost = selectedOption.cost
  const shippingLabel = selectedOption.label
  const totalPrice = unitPrice * quantity + shippingCost

  const onMP = async () => {
    if (!buyerName || !buyerEmail) {
      setPayError('Completa nombre y email para continuar')
      return
    }
    if (!postalCode) {
      setPayError('Ingresa tu codigo postal para el envio')
      return
    }
    setPayError('')
    setPayLoading(true)
    try {
      // 1. Create the order in the database
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType: type === 'combo' ? 'combo' : 'product',
          itemId: item!.id,
          itemName: item!.name,
          itemPrice: unitPrice,
          quantity,
          subtotal: unitPrice * quantity,
          buyerName,
          buyerEmail,
          buyerPhone: buyerPhone || undefined,
          buyerDni: buyerDni || undefined,
          shippingMethod: selectedOption.label,
          shippingCost,
          shippingProvince: province,
          shippingCity: city,
          shippingStreet: street,
          shippingNumber: number,
          shippingFloor: floor || undefined,
          shippingCp: postalCode,
          total: totalPrice,
        }),
      })

      if (!orderRes.ok) {
        const orderError = await orderRes.json()
        throw new Error(orderError.error || 'Error al crear el pedido')
      }

      const orderData = await orderRes.json()
      const savedOrderId = orderData.orderId || ''

      // 2. Create MercadoPago preference
      await handleMercadoPago({
        title: item!.name,
        description: item!.description,
        price: unitPrice,
        quantity,
        shippingCost,
        shippingLabel,
        buyerName,
        buyerEmail,
        buyerPhone,
        buyerDni,
        itemType: type === 'combo' ? 'combo' : 'product',
        itemId: item!.id,
        shippingProvince: province,
        shippingCity: city,
        shippingStreet: street,
        shippingNumber: number,
        shippingFloor: floor,
        shippingCp: postalCode,
        shippingMethod: selectedOption.label,
        orderId: savedOrderId,
      })
    } catch (e: unknown) {
      setPayError(e instanceof Error ? e.message : 'Error al procesar el pago')
    } finally {
      setPayLoading(false)
    }
  }

  const handleWhatsApp = () => {
    const addrStr = street ? `${street} ${number}, ${city}, ${province} (CP: ${postalCode})` : postalCode
    const itemLabel = type === 'combo' ? 'combo' : 'producto'
    const msg = encodeURIComponent(
      `Hola! Me interesa el ${itemLabel}: ${item?.name}\nCantidad: ${quantity}\nEnvio a: ${addrStr}\nTotal estimado: $${totalPrice.toLocaleString('es-AR')}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: '#05080f' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Skeleton className="w-40 h-8 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#05080f' }}>
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(26,159,255,0.06)', border: '1px solid rgba(26,159,255,0.2)' }}>
            <Package className="w-10 h-10 text-[#1a9fff]/30" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Producto no encontrado</h2>
          <p className="text-[#5c8ab0] mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/'} className="neon-btn text-white font-bold">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  const images = [item.image1, item.image2].filter(Boolean) as string[]

  return (
    <div className="min-h-screen" style={{ background: '#05080f' }}>
      {/* Top Bar — Dark Neon */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b"
        style={{ background: 'rgba(5,8,15,0.85)', borderColor: 'rgba(26,159,255,0.15)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => window.location.href = `/producto/${id}${type === 'combo' ? '?type=combo' : ''}`}
            className="flex items-center gap-2 text-[#5c8ab0] hover:text-[#1a9fff] transition-colors font-medium text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al producto
          </button>
          <div className="h-4 w-px" style={{ background: 'rgba(26,159,255,0.2)' }} />
          <span className="text-sm font-semibold text-white">Checkout</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* LEFT: Forms (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Product Summary — Dark Neon */}
            <div className="rounded-xl p-5"
              style={{ background: '#0a0f1e', border: '1px solid rgba(26,159,255,0.15)' }}>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                  style={{ background: '#070c18' }}>
                  {images.length > 0 ? (
                    <img src={images[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#1a9fff]/30">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white truncate">{item.name}</h3>
                  <p className="text-sm text-[#5c8ab0] mt-0.5">Cantidad: {quantity}</p>
                  <p className="text-[#1a9fff] font-bold mt-1"
                    style={{ textShadow: '0 0 8px rgba(26,159,255,0.4)' }}>
                    ${(unitPrice * quantity).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-xl p-5"
              style={{ background: '#0a0f1e', border: '1px solid rgba(26,159,255,0.15)' }}>
              <ShippingAddressForm
                postalCode={postalCode} setPostalCode={setPostalCode}
                province={province} setProvince={setProvince}
                city={city} setCity={setCity}
                street={street} setStreet={setStreet}
                number={number} setNumber={setNumber}
                floor={floor} setFloor={setFloor}
                onQuote={() => {}}
                quoting={false}
                quoteError={''}
                provinces={provinces}
              />
            </div>

            {/* Shipping Method */}
            <div className="rounded-xl p-5"
              style={{ background: '#0a0f1e', border: '1px solid rgba(26,159,255,0.15)' }}>
              <ShippingSelector
                selectedShippingId={selectedShippingId}
                setSelectedShippingId={setSelectedShippingId}
              />
            </div>

            {/* Buyer Info */}
            <div className="rounded-xl p-5"
              style={{ background: '#0a0f1e', border: '1px solid rgba(26,159,255,0.15)' }}>
              <BuyerForm
                buyerName={buyerName} setBuyerName={setBuyerName}
                buyerEmail={buyerEmail} setBuyerEmail={setBuyerEmail}
                buyerPhone={buyerPhone} setBuyerPhone={setBuyerPhone}
                buyerDni={buyerDni} setBuyerDni={setBuyerDni}
              />
            </div>
          </div>

          {/* RIGHT: Order Summary (2/5) — Dark Neon */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-16 space-y-4">
              <div className="rounded-xl p-5 space-y-4"
                style={{ background: '#0a0f1e', border: '1px solid rgba(26,159,255,0.15)' }}>
                <h3 className="font-bold text-white text-lg">Resumen del pedido</h3>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm text-[#5c8ab0]">
                    <span>Precio unitario</span>
                    <span className="text-white">${unitPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#5c8ab0]">
                    <span>Cantidad</span>
                    <span className="text-white">x{quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#5c8ab0]">
                    <span>Subtotal</span>
                    <span className="text-white">${(unitPrice * quantity).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#5c8ab0]">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Envio ({shippingLabel})
                    </span>
                    <span className={shippingCost === 0 ? 'text-[#1a9fff] font-semibold' : 'text-white'}>
                      {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString('es-AR')}`}
                    </span>
                  </div>
                  <Separator style={{ background: 'rgba(26,159,255,0.15)' }} />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-lg">Total</span>
                    <span className="font-extrabold text-[#1a9fff] text-2xl"
                      style={{ textShadow: '0 0 12px rgba(26,159,255,0.5)' }}>
                      ${totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {payError && (
                  <div className="rounded-lg p-3"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <p className="text-red-400 text-sm">{payError}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    className="w-full h-14 neon-btn forja-pulse text-white text-base font-bold rounded-xl gap-3"
                    onClick={onMP}
                    disabled={payLoading}
                  >
                    {payLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    Pagar con MercadoPago
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-[#1a9fff] border-[#1a9fff]/20 hover:bg-[#1a9fff]/10 hover:border-[#1a9fff]/40 font-semibold rounded-xl gap-2"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar por WhatsApp
                  </Button>
                </div>

                {/* Security badges */}
                <div className="flex items-center justify-center gap-4 pt-3"
                  style={{ borderTop: '1px solid rgba(26,159,255,0.1)' }}>
                  <div className="flex items-center gap-1.5 text-xs text-[#5c8ab0]">
                    <Shield className="w-4 h-4 text-[#1a9fff]" />
                    Compra segura
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#5c8ab0]">
                    <CreditCard className="w-3.5 h-3.5 text-[#1a9fff]" />
                    Pago protegido
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ background: '#05080f' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <Skeleton className="w-40 h-8 mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
