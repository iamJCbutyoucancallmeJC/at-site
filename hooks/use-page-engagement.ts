'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export function usePageEngagement(pageName: string) {
  useEffect(() => {
    // Scroll depth tracking
    const scrollThresholds = [25, 50, 75, 100]
    const firedScrollEvents = new Set<number>()

    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const scrollPercent = Math.round((window.scrollY / docHeight) * 100)

      for (const threshold of scrollThresholds) {
        if (scrollPercent >= threshold && !firedScrollEvents.has(threshold)) {
          firedScrollEvents.add(threshold)
          trackEvent('scroll_depth', { depth_percent: threshold, page: pageName })
        }
      }
    }

    // Time on page tracking
    const timeMarks = [10, 30, 60, 120]
    const timers = timeMarks.map((seconds) =>
      setTimeout(() => {
        trackEvent('time_on_page', { seconds, page: pageName })
      }, seconds * 1000)
    )

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      timers.forEach(clearTimeout)
    }
  }, [pageName])
}
