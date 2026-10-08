// /paperworld: the FIXED path Amy's printed Paper World booth QR encodes (t824,
// reused per stop since Seattle). Since the event kit (t1101) it is an alias:
// it redirects, query string intact, to the booth page of whichever stop
// carries qrAlias "paperworld" in lib/events-content.ts. Retargeting a stop is
// now a config entry, not an edit to this file. Never mint /paperworld-<city>.

import { redirect } from "next/navigation"
import { boothPath, resolveQrAlias } from "@/lib/events-content"

type SearchParams = Record<string, string | string[] | undefined>

export default async function PaperworldAlias({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const event = resolveQrAlias("paperworld")
  const target = event ? boothPath(event) : "/happy-mail"
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) v.forEach((x) => qs.append(k, x))
    else if (v !== undefined) qs.set(k, v)
  }
  redirect(qs.size > 0 ? `${target}?${qs.toString()}` : target)
}
