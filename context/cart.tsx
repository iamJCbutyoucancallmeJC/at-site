"use client"

import React, { createContext, useContext, useEffect, useReducer, useState } from "react"
import { trackEvent } from "@/lib/analytics"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CartItem = {
  variantId: string
  productHandle: string
  title: string
  price: string        // formatted, e.g. "$16.00"
  priceAmount: number  // numeric for totals
  imageUrl: string
  quantity: number
  sellingPlanId?: string  // set for subscription products
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; item: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; variantId: string }
  | { type: "UPDATE_QTY"; variantId: string; quantity: number }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "HYDRATE"; items: CartItem[] }

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: string
  isOpen: boolean
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, quantity: number) => void
  openCart: () => void
  closeCart: () => void
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.variantId === action.item.variantId)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.variantId === action.item.variantId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: 1 }],
      }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.variantId !== action.variantId),
      }
    case "UPDATE_QTY":
      if (action.quantity < 1) {
        return {
          ...state,
          items: state.items.filter((i) => i.variantId !== action.variantId),
        }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.variantId === action.variantId ? { ...i, quantity: action.quantity } : i
        ),
      }
    case "OPEN":
      return { ...state, isOpen: true }
    case "CLOSE":
      return { ...state, isOpen: false }
    case "HYDRATE":
      return { ...state, items: action.items }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "at-cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isOpen: false })
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored) as CartItem[]
        if (Array.isArray(items)) dispatch({ type: "HYDRATE", items })
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items, hydrated])

  const count = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotalAmount = state.items.reduce((sum, i) => sum + i.priceAmount * i.quantity, 0)
  const subtotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(subtotalAmount)

  function addItem(item: Omit<CartItem, "quantity">) {
    dispatch({ type: "ADD_ITEM", item })
    dispatch({ type: "OPEN" })
    trackEvent("add_to_cart", {
      product_name: item.title,
      variant_id: item.variantId,
      product_handle: item.productHandle,
    })
  }

  function removeItem(variantId: string) {
    dispatch({ type: "REMOVE_ITEM", variantId })
  }

  function updateQty(variantId: string, quantity: number) {
    dispatch({ type: "UPDATE_QTY", variantId, quantity })
  }

  function openCart() {
    dispatch({ type: "OPEN" })
  }

  function closeCart() {
    dispatch({ type: "CLOSE" })
  }

  return (
    <CartContext.Provider
      value={{ items: state.items, count, subtotal, isOpen: state.isOpen, addItem, removeItem, updateQty, openCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
