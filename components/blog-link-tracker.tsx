'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

// Post bodies are stored HTML (dangerouslySetInnerHTML), so their links can't carry
// onClick props. One delegated listener per post page fires GA4 `external_link` for
// any off-site link inside .blog-body. A link with data-cta (the .blog-button CTAs
// the blog-automation flow writes, e.g. the Ranger collection button) reports that
// name; plain inline links report "inline". Clicks only: conversions on the other
// side (Ranger's store) are not visible to us.
export default function BlogLinkTracker({ slug }: { slug: string }) {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.('.blog-body a[href]') as HTMLAnchorElement | null
      if (!a) return
      let url: URL
      try {
        url = new URL(a.href, window.location.href)
      } catch {
        return
      }
      if (url.hostname === window.location.hostname) return
      trackEvent('external_link', {
        destination: url.hostname.replace(/^www\./, ''),
        cta: a.dataset.cta || 'inline',
        link_text: (a.textContent || '').trim().slice(0, 100),
        source_page: `blog:/${slug}`,
      })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [slug])

  return null
}
