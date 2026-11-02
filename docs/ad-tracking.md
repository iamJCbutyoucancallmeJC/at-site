# Ad conversion tracking (Meta + Pinterest)

Shipped dark: nothing loads and nothing sends until the env vars below exist in Vercel.
With all of them unset the site renders no `fbq` / `pintrk` code and the webhook skips the ad send
(its ack says `"ads": "ad-env-missing"`).

## Env vars

| Var | Where | Gates |
| --- | --- | --- |
| `NEXT_PUBLIC_META_PIXEL_ID` | client (build-time) | Meta Pixel snippet + browser events. Digits only. |
| `NEXT_PUBLIC_PINTEREST_TAG_ID` | client (build-time) | Pinterest tag snippet + browser events. Digits only. |
| `META_PIXEL_ID` | server | Meta Conversions API Purchase (needs the token too). Same id as the public one. |
| `META_CAPI_TOKEN` | server | Meta CAPI access token (Events Manager > Settings > Conversions API). |
| `META_TEST_EVENT_CODE` | server, optional | Sends CAPI events as test events (Events Manager > Test events). Remove after testing. |
| `PINTEREST_AD_ACCOUNT_ID` | server | Pinterest Conversions API Purchase (needs the token too). |
| `PINTEREST_CAPI_TOKEN` | server | Pinterest conversion access token (Ads Manager > Conversions). |
| `PINTEREST_CAPI_TEST` | server, optional | `1` sends with `?test=true` (validated, not counted). Remove after testing. |

`NEXT_PUBLIC_*` values are baked in at build, so a change needs a redeploy.

## Which event fires where

| Event | Meta | Pinterest | Fires from |
| --- | --- | --- | --- |
| Page view | `PageView` | `page` | Snippets in `app/layout.tsx` (first load); `components/ad-page-views.tsx` (each client-side navigation). Meta's own history tracking is off so it never doubles. |
| Gift landing | `ViewContent` (`content_name: gift`, value 72) | `pagevisit` | `components/ad-view-content.tsx`, mounted on `app/gift/page.tsx`. |
| Add to cart | `AddToCart` | `addtocart` | `context/cart.tsx` `addItem`, next to GA4 `add_to_cart` (the single add path). |
| Checkout handoff | `InitiateCheckout` | `custom` | Every redirect to Shopify's hosted checkout: `components/cart-drawer.tsx` (next to GA4 `begin_checkout`), `app/gift/gift-form.tsx`, `app/keep`, `app/back`, `app/happy-mail/yt`, `components/events/booth-offer.tsx`, `components/class/join-class-button.tsx`. Pinterest's `checkout` IS its purchase conversion, so the handoff goes as `custom`. |
| Purchase | `Purchase` (CAPI) | `checkout` (CAPI) | Server only: `app/api/webhooks/orders-create/route.ts` -> `lib/ad-conversions.ts`. Checkout runs on Shopify's hosted checkout, where site code never runs. |

Browser helpers live in `lib/analytics.ts` (`trackAdEvent`, `readAdClickIds`). Every event carries an
`event_id` (browser: a fresh UUID; Purchase: the Shopify order id), so a webhook retry, or any other
sender using the same id, dedupes.

**Click ids.** Each checkout handoff sends the `_fbp`, `_fbc` and `_epik` cookies; the checkout route
stamps them as hidden cart attributes (`adClickAttributes`), Shopify copies them onto the order's
`note_attributes`, and the webhook passes them as Meta `fbp`/`fbc` and Pinterest `click_id`. The
Purchase also carries SHA-256 hashed email, phone (digits with country code), name, city, state, zip,
country and Shopify customer id, plus the buyer's IP and user agent from the order.

## Exclusions (Purchase is never sent for)

Decided by `adPurchaseSkipReason` in `lib/ad-conversions.ts`; the webhook ack shows the reason under `ads`.

- `test-order`: Shopify test orders.
- `zero-dollar-order`: total of $0 (Recharge prepaid cycles, prepaid re-ups, freebies). Same root as the
  GA4 skip in commit e7bd222.
- `recharge-renewal`: tag `Subscription Recurring Order`, or a Recharge-owned source
  (`subscription_contract*`, app `294517`). A `Subscription First Order` from a site checkout DOES count.
- `wholesale-order`: tagged `Faire` or `wholesale`.
- `pos-order`, `draft-order`.
- `not-a-site-checkout`: anything not from the site's checkout (source `web` or the headless app id).

The send runs in `after()` with a 5 second timeout per platform. A failed or slow ad API is logged
(`[ad-conversions] ...`) and never delays or fails the webhook ack.

## Go-live

1. Get the ids and tokens from Amy's Meta Business and Pinterest Ads accounts.
2. Vercel > at-site > Settings > Environment Variables, **Production**: set the six vars above, plus
   `META_TEST_EVENT_CODE` and `PINTEREST_CAPI_TEST=1` for the first test.
3. Merge `feat/ad-tracking` (or redeploy if already merged) so the public ids are baked into the build.
4. Verify the browser side:
   - Meta Events Manager > Test events: open the site, see `PageView`; open /gift, see `ViewContent`;
     add to cart, see `AddToCart`; open checkout, see `InitiateCheckout`.
   - Pinterest Tag Helper (Chrome extension): same steps, see `page`, `pagevisit`, `addtocart`, `custom`.
5. Verify the server side: place one Shopify test order through the site (Bogus gateway). Its webhook
   ack must say `"ads": "test-order"`, which proves the exclusion. Then remove `META_TEST_EVENT_CODE`
   and `PINTEREST_CAPI_TEST`, redeploy, and confirm one real paid Purchase: it appears in Meta Events
   Manager (Purchase, source Server, deduped by order id) and in Pinterest's Conversions overview, and
   the Vercel log shows `[orders-create] ad purchase <id> { meta: 'sent', pinterest: 'sent' }`.
6. Before turning on Shopify's own Facebook & Instagram or Pinterest sales-channel pixels, check they do
   not report Purchase to the same pixel: they use their own event ids, so both would count.
