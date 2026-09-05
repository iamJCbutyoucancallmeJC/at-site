import type { Metadata } from "next"
import { Changelog, asChangelog } from "@/components/changelog/Changelog"
import "@/components/changelog/changelog.css"
import raw from "@/changelog.json"

// The design changelog for amytangerine.com (t1356, built 2026-09-05): how the
// site got the way it is, newest first, the choices with their alternatives and
// the comps beside the shipped thing. PUBLIC on JC's word 9/5 ("yes on at"):
// indexable, in the sitemap, linked from the footer. Notes describe process,
// never customer or revenue specifics. Figures live in public/changelog/.
//
// Component + CSS under components/changelog/ are vendored from the vault's
// shared module (changelog-sync.py); the record is changelog.json at the repo
// root. A design pick lands with its entry in the same commit.
const data = asChangelog(raw)

export const metadata: Metadata = {
  title: "Changelog | Amy Tangerine",
  description: "How amytangerine.com got the way it is, newest first: the design changelog.",
  ...(data.site.noindex ? { robots: { index: false, follow: false } } : {}),
}

export default function ChangelogPage() {
  return (
    <div className="at-log">
      <section
        className="py-12 md:py-16 px-6 md:px-16"
        style={{ background: "var(--color-gray-light)" }}
      >
        <div className="max-w-5xl mx-auto">
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Changelog
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mt-2">How this site got the way it is</h1>
        </div>
      </section>

      <Changelog data={data} as="section" masthead={false} />
    </div>
  )
}
