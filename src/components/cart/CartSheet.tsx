'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  X,
  Package,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react'
import { useCart, type CartItem } from '@/context/CartContext'

function CartItemRow({ item, onUpdate, onRemove }: { item: CartItem; onUpdate: (id: string, qty: number) => void; onRemove: (id: string) => void }) {
  const [removing, setRemoving] = useState(false)

  const handleRemove = () => {
    setRemoving(true)
    setTimeout(() => onRemove(item.id), 300)
  }

  return (
    <AnimatePresence>
      {!removing ? (
        <motion.div
          layout
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20, height: 0 }}
          transition={{ duration: 0.3 }}
          className="flex gap-3 p-3 rounded-xl"
          style={{ background: '#0d1426', border: '1px solid rgba(26,159,255,0.15)' }}
        >
          {/* Image */}
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
            style={{ background: '#070c18' }}>
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#1a9fff]/30">
                <Package className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-white text-sm truncate">{item.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {item.type === 'combo' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-[#1a9fff] border border-[#1a9fff]/40 bg-[#1a9fff]/10">COMBO</span>
                  )}
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="p-1 rounded-lg hover:bg-red-500/10 text-[#5c8ab0] hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2">
              {/* Quantity Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdate(item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ border: '1px solid rgba(26,159,255,0.25)', background: 'rgba(26,159,255,0.05)' }}
                >
                  <Minus className="w-3 h-3 text-[#1a9fff]" />
                </button>
                <span className="w-8 text-center font-semibold text-sm text-white">{item.quantity}</span>
                <button
                  onClick={() => onUpdate(item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ border: '1px solid rgba(26,159,255,0.25)', background: 'rgba(26,159,255,0.05)' }}
                >
                  <Plus className="w-3 h-3 text-[#1a9fff]" />
                </button>
              </div>

              {/* Price */}
              <span className="font-bold text-[#1a9fff] text-sm"
                style={{ textShadow: '0 0 8px rgba(26,159,255,0.4)' }}>
                ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function CartSheet() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-[#a0c4e8] hover:text-[#1a9fff] hover:bg-[#0a0f1e] p-2 rounded-full transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-[#1a9fff] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
              style={{ boxShadow: '0 0 8px rgba(26,159,255,0.5)' }}
            >
              {totalItems}
            </motion.span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col p-0"
        style={{ background: '#05080f', borderLeft: '1px solid rgba(26,159,255,0.15)' }}>
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3"
          style={{ borderBottom: '1px solid rgba(26,159,255,0.1)' }}>
          <SheetTitle className="flex items-center gap-2 text-lg text-white">
            <ShoppingBag className="w-5 h-5 text-[#1a9fff]" />
            Mi Carrito
            {totalItems > 0 && (
              <Badge className="text-[#1a9fff] border border-[#1a9fff]/40 bg-[#1a9fff]/10 text-xs ml-1">{totalItems} {totalItems === 1 ? 'item' : 'items'}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(26,159,255,0.06)', border: '1px solid rgba(26,159,255,0.15)' }}>
                <ShoppingCart className="w-10 h-10 text-[#1a9fff]/30" />
              </div>
              <p className="text-white font-medium">Tu carrito esta vacio</p>
              <p className="text-[#5c8ab0] text-sm mt-1">Agrega productos para comenzar</p>
            </div>
          ) : (
            <AnimatePresence>
              {items.map(item => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdate={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="px-5 py-4 space-y-4"
            style={{ background: '#0a0f1e', borderTop: '1px solid rgba(26,159,255,0.15)' }}>
            {/* Total */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#5c8ab0]">
                <span>Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                <span className="text-white">${totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between items-center pt-2"
                style={{ borderTop: '1px solid rgba(26,159,255,0.1)' }}>
                <span className="font-bold text-white text-lg">Total</span>
                <span className="font-extrabold text-[#1a9fff] text-2xl"
                  style={{ textShadow: '0 0 12px rgba(26,159,255,0.5)' }}>
                  ${totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                className="w-full h-12 neon-btn text-white font-bold rounded-xl gap-2"
                onClick={() => {
                  window.location.href = '/carrito'
                }}
              >
                Finalizar Compra
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-[#5c8ab0] hover:text-red-400 text-xs"
                onClick={clearCart}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Vaciar carrito
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
