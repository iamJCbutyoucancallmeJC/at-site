'use client'

import { usePageEngagement } from '@/hooks/use-page-engagement'

export default function PageEngagementTracker({ page }: { page: string }) {
  usePageEngagement(page)
  return null
}
