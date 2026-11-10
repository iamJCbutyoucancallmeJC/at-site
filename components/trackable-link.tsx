'use client'

import { trackEvent, type AnalyticsEvent } from '@/lib/analytics'

interface TrackableLinkProps {
  href: string
  event: AnalyticsEvent
  eventData?: Record<string, string | number | boolean>
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  target?: string
  rel?: string
  /** "page" on the link that names the page you are on (the active shop chip). */
  ariaCurrent?: "page"
}

export default function TrackableLink({
  href,
  event,
  eventData,
  className,
  style,
  children,
  target,
  rel,
  ariaCurrent,
}: TrackableLinkProps) {
  return (
    <a
      href={href}
      onClick={() => trackEvent(event, eventData)}
      className={className}
      style={style}
      target={target}
      rel={rel}
      aria-current={ariaCurrent}
    >
      {children}
    </a>
  )
}
