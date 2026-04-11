'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics'

export default function VariantTracker({ variantId }: { variantId: string }) {
  const hasFired = useRef(false)
  const timeReached = useRef(false)
  const scrollReached = useRef(false)

  useEffect(() => {
    const checkAndFire = () => {
      if (timeReached.current && scrollReached.current && !hasFired.current) {
        hasFired.current = true
        trackEvent('variant_engagement', { variant_id: variantId, engaged: true })
      }
    }

    const timer = setTimeout(() => {
      timeReached.current = true
      checkAndFire()
    }, 30000)

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const scrollPercent = (window.scrollY / docHeight) * 100
      if (scrollPercent >= 50) {
        scrollReached.current = true
        checkAndFire()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [variantId])

  return null
}
