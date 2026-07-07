import PageEngagementTracker from "@/components/page-engagement-tracker"
import AffiliateCard from "@/components/affiliate-card"
import TrackableLink from "@/components/trackable-link"
import { getAffiliatePickLists, amazonHref } from "@/lib/affiliate"

// Affiliate content is authored in Shopify and may change anytime; read fresh.
export const dynamic = "force-dynamic"

export const metadata = {
  title: "Shop My Faves | Amy Tangerine",
  description:
    "The third-party tools, supplies, and gear Amy actually uses for her best creative life. Hand-picked favorites, linked on Amazon.",
}

// The required Amazon Associates disclosure. The first sentence is Amazon's
// REQUIRED verbatim statement -- do not reword it (it protects Amy's live
// Associates account). The second sentence is plain-English context for visitors.
const DISCLOSURE =
  "As an Amazon Associate I earn from qualifying purchases. These are products I genuinely use and recommend; if you buy through these links, I may earn a small commission at no extra cost to you."

export default async function ShopMyFavesPage() {
  const lists = await getAffiliatePickLists()

  return (
    <>
      <PageEngagementTracker page="shop-my-faves" />

      {/* ── Intro (adapted from Amy's Amazon storefront bio) ── */}
      <section
        className="py-16 md:py-24 px-6 md:px-16"
        style={{ background: "var(--color-orange-light)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4"
            style={{ color: "var(--color-orange)" }}
          >
            Shop My Faves
          </p>
          <h1
            className="text-[34px] md:text-[52px] font-bold leading-[1.05] tracking-tight mb-6"
            style={{ color: "var(--color-text-primary)" }}
          >
            Fresh and juicy favorites
            <br />
            for your best creative life.
          </h1>
          <p
            className="text-[16px] md:text-[18px] leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            After always getting asked what supplies I&rsquo;m using, what I&rsquo;m
            wearing, or where something is from, I gathered the things I love all in
            one place. These are the tools, supplies, and finds I actually reach for.
            Hope you&rsquo;re inspired to get those creative juices flowing.
          </p>
        </div>
      </section>

      {/* ── Disclosure (FTC + Amazon required, persistent at top of content) ── */}
      <div
        className="px-6 md:px-16 py-4 border-b text-center"
        style={{ background: "var(--color-gray-light)", borderColor: "var(--color-border)" }}
      >
        <p
          className="max-w-3xl mx-auto text-[12px] leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {DISCLOSURE}
        </p>
      </div>

      {/* ── Lists ── */}
      {lists.length === 0 ? (
        <section className="py-24 px-6 text-center">
          <p className="text-[16px]" style={{ color: "var(--color-text-secondary)" }}>
            Amy&rsquo;s favorites are on their way. Check back soon!
          </p>
        </section>
      ) : (
        <div className="py-12 md:py-16 px-6 md:px-16">
          <div className="max-w-6xl mx-auto flex flex-col gap-16 md:gap-20">
            {lists.map((list) => (
              <section key={list.id} id={list.slug} className="scroll-mt-24">
                <div className="mb-7 md:mb-9 max-w-2xl">
                  <h2
                    className="text-[24px] md:text-[32px] font-bold leading-tight tracking-tight"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {list.title}
                  </h2>
                  {list.description && (
                    <p
                      className="mt-2 text-[15px] leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {list.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                  {list.picks.map((pick) => (
                    <AffiliateCard
                      key={pick.id}
                      pick={pick}
                      href={amazonHref(pick)}
                      listTitle={list.title}
                    />
                  ))}
                </div>

                {/* "See all N on Amazon" deep-link to the full idea list. We show a
                    curated subset on-site; this sends browsers to Amy's full list. */}
                {list.listUrl && (
                  <div className="mt-7 md:mt-8">
                    <TrackableLink
                      href={list.listUrl}
                      event="affiliate_click"
                      eventData={{
                        link_type: "see_all_list",
                        list_title: list.title,
                        destination: list.listUrl,
                        page: "shop-my-faves",
                      }}
                      target="_blank"
                      rel="noopener sponsored nofollow"
                      className="inline-flex items-center gap-1.5 text-[14px] font-semibold transition-opacity hover:opacity-70"
                      style={{ color: "var(--color-orange)" }}
                    >
                      {list.itemCount
                        ? `See all ${list.itemCount} on Amazon`
                        : "See all on Amazon"}
                      <span aria-hidden="true">&rarr;</span>
                    </TrackableLink>
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer disclosure echo (so it's visible after a long scroll too) ── */}
      <div
        className="px-6 md:px-16 py-8 border-t text-center"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p
          className="max-w-3xl mx-auto text-[12px] leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {DISCLOSURE}
        </p>
      </div>
    </>
  )
}
