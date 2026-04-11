/**
 * Local product catalog — Amy Tangerine
 *
 * Sourced from Squarespace export (products.json) + local images in public/images/products/.
 * Used as fallback when Shopify store is empty (dev) or as primary data source during migration.
 *
 * When Shopify products are imported, getAllProducts() / getProductByHandle() in shopify.ts
 * will return live data and this file becomes unused.
 */

import type { ShopifyProduct } from "./shopify"

function price(amount: string): { amount: string; currencyCode: string } {
  return { amount, currencyCode: "USD" }
}

function imgNodes(slug: string, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    url: `/images/products/${slug}/${i + 1}.jpg`,
    altText: null,
    width: 800,
    height: 800,
  }))
}

function variant(id: string, amount: string): ShopifyProduct["variants"]["nodes"][number] {
  return {
    id,
    title: "Default Title",
    availableForSale: true,
    price: price(amount),
    compareAtPrice: null,
  }
}

function collection(handle: string, title: string) {
  return { handle, title }
}

// ---------------------------------------------------------------------------
// Full catalog
// ---------------------------------------------------------------------------

export const LOCAL_PRODUCTS: ShopifyProduct[] = [
  // ── Sticker Books ──────────────────────────────────────────────────────────
  {
    id: "local-heart-healing-happiness",
    handle: "hearthealinghappiness-sticker-book",
    title: "Heart, Healing & Happiness Sticker Book",
    description:
      "Over 600 uplifting and inspiring stickers for every step of your journey. Embrace daily affirmations, healing symbols, and happiness-themed designs. Perfect for journals, planners, and scrapbooks.",
    descriptionHtml:
      "<p>Over 600 uplifting and inspiring stickers for every step of your journey. Embrace daily affirmations, healing symbols, and happiness-themed designs. Perfect for journals, planners, and scrapbooks.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("30.00"), maxVariantPrice: price("30.00") },
    images: { nodes: imgNodes("hearthealinghappiness-sticker-book", 5) },
    variants: { nodes: [variant("local-hhh-v1", "30.00")] },
    tags: ["sticker-book", "new"],
    productType: "Stickers",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },
  {
    id: "local-colorful-era-washi",
    handle: "washistickerbook-preorder",
    title: "In My Colorful Era Washi Sticker Book",
    description:
      "A sticker book filled with washi-inspired designs celebrating your most colorful era. Ships mid-late April.",
    descriptionHtml:
      "<p>A sticker book filled with washi-inspired designs celebrating your most colorful era. Ships mid-late April.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("25.00"), maxVariantPrice: price("25.00") },
    images: { nodes: imgNodes("washistickerbook-preorder", 4) },
    variants: { nodes: [variant("local-washi-v1", "25.00")] },
    tags: ["sticker-book", "pre-order"],
    productType: "Stickers",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },
  {
    id: "local-sticker-book",
    handle: "pre-order-sticker-book",
    title: "Sticker Book",
    description:
      "Fun stickers for your everyday life. The ultimate sticker book — years in the making and packed with designs for journals, planners, and all your paper projects.",
    descriptionHtml:
      "<p>Fun stickers for your everyday life. The ultimate sticker book — years in the making and packed with designs for journals, planners, and all your paper projects.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("30.00"), maxVariantPrice: price("30.00") },
    images: { nodes: imgNodes("pre-order-sticker-book", 7) },
    variants: { nodes: [variant("local-sb-v1", "30.00")] },
    tags: ["sticker-book"],
    productType: "Stickers",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },
  {
    id: "local-paper-play-bundle",
    handle: "hearthealinghappiness-sticker-book-ycahb-neyrb",
    title: "Paper Play 1 & 2 Books Bundle — Signed Copies",
    description:
      "Two-book bundle of signed copies of Paper Play & Paper Play 2: Cut, Craft + Collage. Autographed exclusively through this listing.",
    descriptionHtml:
      "<p>Two-book bundle of signed copies of Paper Play &amp; Paper Play 2: Cut, Craft + Collage. Autographed exclusively through this listing.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("40.00"), maxVariantPrice: price("40.00") },
    images: { nodes: imgNodes("hearthealinghappiness-sticker-book-ycahb-neyrb", 5) },
    variants: { nodes: [variant("local-ppb-v1", "40.00")] },
    tags: ["bundle", "signed"],
    productType: "Books",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },
  {
    id: "local-make-your-mark",
    handle: "preorder-make-your-mark",
    title: "Make Your Mark",
    description:
      "A compact yet effective tool to get your creative juices flowing. Perfect for on-the-go creative sessions.",
    descriptionHtml:
      "<p>A compact yet effective tool to get your creative juices flowing. Perfect for on-the-go creative sessions.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("20.00"), maxVariantPrice: price("20.00") },
    images: { nodes: imgNodes("preorder-make-your-mark", 4) },
    variants: { nodes: [variant("local-mym-v1", "20.00")] },
    tags: ["book"],
    productType: "Books",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },

  // ── Die Cuts / Bundles ─────────────────────────────────────────────────────
  {
    id: "local-juicy-bits-happy",
    handle: "juicybitsstickers-happyedition",
    title: "Juicy Bits Bundle — Happy Edition",
    description:
      "A surprise bundle of sticker happiness! Each grab bag is filled with a unique mix of stickers, die cuts, and embellishments from Amy's Juicy Bits collection.",
    descriptionHtml:
      "<p>A surprise bundle of sticker happiness! Each grab bag is filled with a unique mix of stickers, die cuts, and embellishments from Amy's Juicy Bits collection.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("19.00"), maxVariantPrice: price("19.00") },
    images: { nodes: imgNodes("juicybitsstickers-happyedition", 2) },
    variants: { nodes: [variant("local-jbh-v1", "19.00")] },
    tags: ["die-cuts", "bundle", "new"],
    productType: "Die Cuts",
    collections: { nodes: [collection("die-cuts", "Die Cuts")] },
  },
  {
    id: "local-juicy-bits-cozy",
    handle: "juicybitsstickers-cozyedition",
    title: "Juicy Bits Bundle — Cozy Edition",
    description:
      "Cozy up to creativity with a surprise bundle of sticker happiness! Each grab bag is filled with a unique mix of stickers, die cuts, and embellishments from Amy's Juicy Bits collection.",
    descriptionHtml:
      "<p>Cozy up to creativity with a surprise bundle of sticker happiness! Each grab bag is filled with a unique mix of stickers, die cuts, and embellishments from Amy's Juicy Bits collection.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("19.00"), maxVariantPrice: price("19.00") },
    images: { nodes: imgNodes("juicybitsstickers-cozyedition", 2) },
    variants: { nodes: [variant("local-jbc-v1", "19.00")] },
    tags: ["die-cuts", "bundle", "new"],
    productType: "Die Cuts",
    collections: { nodes: [collection("die-cuts", "Die Cuts")] },
  },

  // ── Stamps ─────────────────────────────────────────────────────────────────
  {
    id: "local-squeeze-the-day",
    handle: "squeezethedaystamp4x6",
    title: "Squeeze the Day Stamp Set 4x6",
    description:
      "A fresh and citrusy 4x6 photopolymer stamp set. Buy any 3 stamp sets and get a free Amy Tangerine acrylic block (not available for sale anywhere else).",
    descriptionHtml:
      "<p>A fresh and citrusy 4x6 photopolymer stamp set. Buy any 3 stamp sets and get a free Amy Tangerine acrylic block (not available for sale anywhere else).</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("16.00"), maxVariantPrice: price("16.00") },
    images: { nodes: imgNodes("squeezethedaystamp4x6", 2) },
    variants: { nodes: [variant("local-std-v1", "16.00")] },
    tags: ["stamps", "new"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },
  {
    id: "local-moody-stamp",
    handle: "moody2stamp4x6",
    title: "MOODY Stamp Set 4x6",
    description:
      "A bold 4x6 photopolymer stamp set for all your moody, expressive projects. Made in the USA. Buy any 3 stamp sets and get a free acrylic block.",
    descriptionHtml:
      "<p>A bold 4x6 photopolymer stamp set for all your moody, expressive projects. Made in the USA. Buy any 3 stamp sets and get a free acrylic block.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("16.00"), maxVariantPrice: price("16.00") },
    images: { nodes: imgNodes("moody2stamp4x6", 3) },
    variants: { nodes: [variant("local-moody-v1", "16.00")] },
    tags: ["stamps", "new"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },
  {
    id: "local-ugh-stamp",
    handle: "ugh1stamp4x6",
    title: "UGH Stamp Set 4x6",
    description:
      "A relatable and expressive 4x6 photopolymer stamp set. Made in the USA. Buy any 3 stamp sets and get a free acrylic block.",
    descriptionHtml:
      "<p>A relatable and expressive 4x6 photopolymer stamp set. Made in the USA. Buy any 3 stamp sets and get a free acrylic block.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("16.00"), maxVariantPrice: price("16.00") },
    images: { nodes: imgNodes("ugh1stamp4x6", 3) },
    variants: { nodes: [variant("local-ugh-v1", "16.00")] },
    tags: ["stamps", "new"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },
  {
    id: "local-icons1-stamp",
    handle: "icons-stamp-set-4x6-pre-order-ships-mid-november",
    title: "ICONS1 Stamp Set 4x6",
    description:
      "A beautifully designed set of iconic imagery in a 4x6 photopolymer format. Made in the USA, crafted with quality and care.",
    descriptionHtml:
      "<p>A beautifully designed set of iconic imagery in a 4x6 photopolymer format. Made in the USA, crafted with quality and care.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("16.00"), maxVariantPrice: price("16.00") },
    images: { nodes: imgNodes("icons-stamp-set-4x6-pre-order-ships-mid-november", 2) },
    variants: { nodes: [variant("local-icons1-v1", "16.00")] },
    tags: ["stamps"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },
  {
    id: "local-icons2-stamp",
    handle: "icons-stamp-set-4x6-pre-order-ships-mid-november-42b2h",
    title: "ICONS2 Stamp Set 4x6",
    description:
      "The second in the ICONS collection — another set of beautifully crafted iconic imagery in a 4x6 photopolymer format. Made in the USA.",
    descriptionHtml:
      "<p>The second in the ICONS collection — another set of beautifully crafted iconic imagery in a 4x6 photopolymer format. Made in the USA.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("16.00"), maxVariantPrice: price("16.00") },
    images: { nodes: imgNodes("icons-stamp-set-4x6-pre-order-ships-mid-november-42b2h", 2) },
    variants: { nodes: [variant("local-icons2-v1", "16.00")] },
    tags: ["stamps"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },
  {
    id: "local-words1-stamp",
    handle: "words1-stamp-set-4x6-pre-order-ships-mid-november-nhtx9",
    title: "WORDS 1 Stamp Set 4x6",
    description:
      "A 4x6 photopolymer stamp set celebrating the power of words and phrases. Made in the USA.",
    descriptionHtml:
      "<p>A 4x6 photopolymer stamp set celebrating the power of words and phrases. Made in the USA.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("16.00"), maxVariantPrice: price("16.00") },
    images: { nodes: imgNodes("words1-stamp-set-4x6-pre-order-ships-mid-november-nhtx9", 2) },
    variants: { nodes: [variant("local-words1-v1", "16.00")] },
    tags: ["stamps"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },
  {
    id: "local-words2-stamp",
    handle: "words2-stamp-set-4x6-pre-order",
    title: "WORDS 2 Stamp Set 4x6",
    description:
      "The second in the WORDS collection — more beautiful phrases and sentiments in a 4x6 photopolymer format. Made in the USA.",
    descriptionHtml:
      "<p>The second in the WORDS collection — more beautiful phrases and sentiments in a 4x6 photopolymer format. Made in the USA.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("16.00"), maxVariantPrice: price("16.00") },
    images: { nodes: imgNodes("words2-stamp-set-4x6-pre-order", 2) },
    variants: { nodes: [variant("local-words2-v1", "16.00")] },
    tags: ["stamps"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },
  {
    id: "local-memories-dreams-stamp",
    handle: "icons-stamp-set-4x6-pre-order-ships-mid-november-42b2h-kr27c",
    title: "MEMORIES & DREAMS Stamp Set 4x6",
    description:
      "A dreamy 4x6 photopolymer stamp set for capturing memories and manifesting dreams. Made in the USA.",
    descriptionHtml:
      "<p>A dreamy 4x6 photopolymer stamp set for capturing memories and manifesting dreams. Made in the USA.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("16.00"), maxVariantPrice: price("16.00") },
    images: { nodes: imgNodes("icons-stamp-set-4x6-pre-order-ships-mid-november-42b2h-kr27c", 2) },
    variants: { nodes: [variant("local-md-v1", "16.00")] },
    tags: ["stamps"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },
  {
    id: "local-mixtape-stamp",
    handle: "icons-stamp-set-4x6-pre-order-ships-mid-november-42b2h-fn72f",
    title: "MIXTAPE Stamp Set 4x6",
    description:
      "A music-inspired 4x6 photopolymer stamp set with retro vibes and creative energy. Made in the USA.",
    descriptionHtml:
      "<p>A music-inspired 4x6 photopolymer stamp set with retro vibes and creative energy. Made in the USA.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("16.00"), maxVariantPrice: price("16.00") },
    images: { nodes: imgNodes("icons-stamp-set-4x6-pre-order-ships-mid-november-42b2h-fn72f", 2) },
    variants: { nodes: [variant("local-mix-v1", "16.00")] },
    tags: ["stamps"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },
  {
    id: "local-fantastic-cake-stamp",
    handle: "icons-stamp-set-4x6-pre-order-ships-mid-november-42b2h-kr27c-rp245",
    title: "FANTASTIC CAKE Stamp Set 4x6",
    description:
      "A celebration-themed 4x6 photopolymer stamp set. Because every day is worth celebrating. Made in the USA.",
    descriptionHtml:
      "<p>A celebration-themed 4x6 photopolymer stamp set. Because every day is worth celebrating. Made in the USA.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("16.00"), maxVariantPrice: price("16.00") },
    images: { nodes: imgNodes("icons-stamp-set-4x6-pre-order-ships-mid-november-42b2h-kr27c-rp245", 2) },
    variants: { nodes: [variant("local-fc-v1", "16.00")] },
    tags: ["stamps"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },
  {
    id: "local-mini-brush-stamp",
    handle: "icons-stamp-set-4x6-pre-order-ships-mid-november-42b2h-kr27c-rp245-4asfs",
    title: "MINI BRUSH LETTERING Stamp Set 3x4",
    description:
      "A collaborative 3x4 photopolymer stamp set featuring mini brush lettering. Made in the USA with Sakuralala.",
    descriptionHtml:
      "<p>A collaborative 3x4 photopolymer stamp set featuring mini brush lettering. Made in the USA with Sakuralala.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("12.00"), maxVariantPrice: price("12.00") },
    images: { nodes: imgNodes("icons-stamp-set-4x6-pre-order-ships-mid-november-42b2h-kr27c-rp245-4asfs", 1) },
    variants: { nodes: [variant("local-mbl-v1", "12.00")] },
    tags: ["stamps"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },
  {
    id: "local-bundle-three-stamps",
    handle: "bundle-stamp-sets-4x6-pre-order",
    title: "Bundle of THREE 4x6 Stamp Sets",
    description:
      "ICONS 1, WORDS 1, and WORDS 2 stamp sets plus a bonus sticker sheet. Three 4x6 photopolymer stamp sets at a bundle price. Made in the USA.",
    descriptionHtml:
      "<p>ICONS 1, WORDS 1, and WORDS 2 stamp sets plus a bonus sticker sheet. Three 4x6 photopolymer stamp sets at a bundle price. Made in the USA.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("45.00"), maxVariantPrice: price("45.00") },
    images: { nodes: imgNodes("bundle-stamp-sets-4x6-pre-order", 4) },
    variants: { nodes: [variant("local-bts-v1", "45.00")] },
    tags: ["stamps", "bundle"],
    productType: "Stamps",
    collections: { nodes: [collection("stamps", "Stamps")] },
  },

  // ── Mini Kits ──────────────────────────────────────────────────────────────
  {
    id: "local-mini-kit-embellishments",
    handle: "mini-kit-embellishments",
    title: "Picnic in the Park Embellishments Mini Kit",
    description:
      "This mini kit includes embossed puffy stickers and embellishments from Amy Tangerine's Picnic in the Park collection. Free US shipping.",
    descriptionHtml:
      "<p>This mini kit includes embossed puffy stickers and embellishments from Amy Tangerine's Picnic in the Park collection. Free US shipping.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("16.00"), maxVariantPrice: price("16.00") },
    images: { nodes: imgNodes("mini-kit-embellishments", 1) },
    variants: { nodes: [variant("local-mke-v1", "16.00")] },
    tags: ["mini-kit"],
    productType: "Stickers",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },
  {
    id: "local-mini-kit-washi",
    handle: "mini-kit-washi",
    title: "Picnic in the Park Mini Kit with Washi",
    description:
      "This mini kit includes washi tape (8 pcs) and other items from Amy Tangerine's Picnic in the Park collection. Free US shipping.",
    descriptionHtml:
      "<p>This mini kit includes washi tape (8 pcs) and other items from Amy Tangerine's Picnic in the Park collection. Free US shipping.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("22.00"), maxVariantPrice: price("22.00") },
    images: { nodes: imgNodes("mini-kit-washi", 1) },
    variants: { nodes: [variant("local-mkw-v1", "22.00")] },
    tags: ["mini-kit", "washi"],
    productType: "Stickers",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },
  {
    id: "local-mini-kit-tn",
    handle: "mini-kit-tn",
    title: "Picnic in the Park Traveler's Notebook Mini Kit",
    description:
      "This mini kit includes a Traveler's Notebook and Picnic in the Park die-cut shapes (40 pcs, includes glitter pieces). Free US shipping.",
    descriptionHtml:
      "<p>This mini kit includes a Traveler's Notebook and Picnic in the Park die-cut shapes (40 pcs, includes glitter pieces). Free US shipping.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("17.00"), maxVariantPrice: price("17.00") },
    images: { nodes: imgNodes("mini-kit-tn", 1) },
    variants: { nodes: [variant("local-mktn-v1", "17.00")] },
    tags: ["mini-kit", "travelers-notebook"],
    productType: "Stickers",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },

  // ── Craft Supplies ─────────────────────────────────────────────────────────
  {
    id: "local-travel-watercolor",
    handle: "travel-watercolor-set",
    title: "Travel Watercolor Set",
    description:
      "Everything you need to create on the go. Includes 12 watercolor paints, one pencil, one pen, one water bottle, one sponge, and one refillable water brush. Free US shipping.",
    descriptionHtml:
      "<p>Everything you need to create on the go. Includes 12 watercolor paints, one pencil, one pen, one water bottle, one sponge, and one refillable water brush. Free US shipping.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("25.00"), maxVariantPrice: price("25.00") },
    images: { nodes: imgNodes("travel-watercolor-set", 2) },
    variants: { nodes: [variant("local-tws-v1", "25.00")] },
    tags: ["watercolor", "travel"],
    productType: "Craft Supplies",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },
  {
    id: "local-clean-out-box",
    handle: "clean-out-boxes",
    title: "Studio Clean Out Box",
    description:
      "A box full of (mostly) Amy Tangerine products and goodies! Each box is filled with an assortment of Amy Tangerine products — a fun mystery box for paper crafters. Free US shipping.",
    descriptionHtml:
      "<p>A box full of (mostly) Amy Tangerine products and goodies! Each box is filled with an assortment of Amy Tangerine products — a fun mystery box for paper crafters. Free US shipping.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("60.00"), maxVariantPrice: price("60.00") },
    images: { nodes: imgNodes("clean-out-boxes", 1) },
    variants: { nodes: [variant("local-cob-v1", "60.00")] },
    tags: ["bundle", "mystery-box"],
    productType: "Craft Supplies",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },

  // ── Course Bundles ─────────────────────────────────────────────────────────
  {
    id: "local-tn-bundle-a",
    handle: "tn-bundle-a",
    title: "Course Bundle A: Fresh Takes + Traveler's Notebook Kit",
    description:
      "Bundle A includes lifetime access to the self-paced online course Fresh Takes on Traveler's Notebooks: A Creative Memory Keeping Journey, plus the Traveler's Notebook kit. Free US shipping.",
    descriptionHtml:
      "<p>Bundle A includes lifetime access to the self-paced online course <em>Fresh Takes on Traveler's Notebooks</em>, plus the Traveler's Notebook kit. Free US shipping.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("81.00"), maxVariantPrice: price("81.00") },
    images: { nodes: imgNodes("tn-bundle-a", 2) },
    variants: { nodes: [variant("local-tna-v1", "81.00")] },
    tags: ["bundle", "course", "travelers-notebook"],
    productType: "Bundles",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },
  {
    id: "local-tn-bundle-b",
    handle: "tn-bundle-b",
    title: "Course Bundle B: Fresh Takes + Traveler's Notebook Kit + Watercolor Set",
    description:
      "Bundle B includes lifetime access to the Fresh Takes online course, the Traveler's Notebook kit, plus the Travel Watercolor Set. Free US shipping.",
    descriptionHtml:
      "<p>Bundle B includes lifetime access to the <em>Fresh Takes</em> online course, the Traveler's Notebook kit, plus the Travel Watercolor Set. Free US shipping.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("106.00"), maxVariantPrice: price("106.00") },
    images: { nodes: imgNodes("tn-bundle-b", 2) },
    variants: { nodes: [variant("local-tnb-v1", "106.00")] },
    tags: ["bundle", "course", "travelers-notebook", "watercolor"],
    productType: "Bundles",
    collections: { nodes: [collection("stickers", "Stickers")] },
  },

  // ── Happy Mail ─────────────────────────────────────────────────────────────
  {
    id: "local-happy-mail-monthly",
    handle: "happy-mail",
    title: "Happy Mail — Monthly Subscription",
    description:
      "Let me send you mail. Once a month, you'll get an envelope from me filled with fresh & juicy bits I designed just for subscribers — stickers, die cuts, and surprises.",
    descriptionHtml:
      "<p>Let me send you mail. Once a month, you'll get an envelope from me filled with fresh &amp; juicy bits I designed just for subscribers — stickers, die cuts, and surprises.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("13.00"), maxVariantPrice: price("13.00") },
    images: { nodes: imgNodes("happy-mail", 3) },
    variants: { nodes: [variant("local-hm-v1", "13.00")] },
    tags: ["happy-mail", "subscription"],
    productType: "Subscription",
    collections: { nodes: [collection("happy-mail", "Happy Mail")] },
  },
  {
    id: "local-happy-mail-6month",
    handle: "happy-mail-6-month",
    title: "Happy Mail — Six Month Subscription",
    description:
      "Six months of happy, delivered. Get Happy Mail every month for half a year — stickers, die cuts, and surprises designed just for subscribers.",
    descriptionHtml:
      "<p>Six months of happy, delivered. Get Happy Mail every month for half a year — stickers, die cuts, and surprises designed just for subscribers.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("78.00"), maxVariantPrice: price("78.00") },
    images: { nodes: imgNodes("happy-mail-6-month", 2) },
    variants: { nodes: [variant("local-hm6-v1", "78.00")] },
    tags: ["happy-mail", "subscription"],
    productType: "Subscription",
    collections: { nodes: [collection("happy-mail", "Happy Mail")] },
  },

  // ── Apparel ────────────────────────────────────────────────────────────────
  {
    id: "local-raise-them-kind-premium",
    handle: "raise-them-kind-premium-sweatshirt",
    title: "Raise Them Kind Premium Sweatshirt",
    description:
      "Hand-lettered classic sweatshirt silhouette with ribbed crew neck, long sleeve cuffs, and a flat hem. Layer it up or wear it solo — always a statement.",
    descriptionHtml:
      "<p>Hand-lettered classic sweatshirt silhouette with ribbed crew neck, long sleeve cuffs, and a flat hem. Layer it up or wear it solo — always a statement.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("44.00"), maxVariantPrice: price("44.00") },
    images: { nodes: imgNodes("raise-them-kind-premium-sweatshirt", 6) },
    variants: { nodes: [variant("local-rtk-v1", "44.00")] },
    tags: ["apparel", "sweatshirt"],
    productType: "Apparel",
    collections: { nodes: [collection("apparel", "Apparel")] },
  },
  {
    id: "local-raise-them-kind-crew",
    handle: "raise-them-kind-crew-neck-sweatshirt",
    title: "Raise Them Kind Crew Neck Sweatshirt",
    description:
      "This crew-neck sweatshirt is designed for lasting comfort. Pill-resistant fleece stays smooth and fresh. Hand-lettered Amy Tangerine design.",
    descriptionHtml:
      "<p>This crew-neck sweatshirt is designed for lasting comfort. Pill-resistant fleece stays smooth and fresh. Hand-lettered Amy Tangerine design.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("44.00"), maxVariantPrice: price("44.00") },
    images: { nodes: imgNodes("raise-them-kind-crew-neck-sweatshirt", 6) },
    variants: { nodes: [variant("local-rtkc-v1", "44.00")] },
    tags: ["apparel", "sweatshirt"],
    productType: "Apparel",
    collections: { nodes: [collection("apparel", "Apparel")] },
  },
  {
    id: "local-raise-them-kind-hoodie",
    handle: "raise-them-kind-heavy-blend-hooded-sweatshirt",
    title: "Raise Them Kind Hooded Sweatshirt",
    description:
      "This unisex heavy blend hooded sweatshirt is relaxation itself. Made with a thick blend of cotton and polyester for warmth and comfort.",
    descriptionHtml:
      "<p>This unisex heavy blend hooded sweatshirt is relaxation itself. Made with a thick blend of cotton and polyester for warmth and comfort.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("48.00"), maxVariantPrice: price("48.00") },
    images: { nodes: imgNodes("raise-them-kind-heavy-blend-hooded-sweatshirt", 6) },
    variants: { nodes: [variant("local-rtkh-v1", "48.00")] },
    tags: ["apparel", "hoodie"],
    productType: "Apparel",
    collections: { nodes: [collection("apparel", "Apparel")] },
  },
  {
    id: "local-crafty-hoodie",
    handle: "crafty-premium-unisex-pullover-hoodie",
    title: "Crafty Premium Unisex Pullover Hoodie",
    description:
      "This unisex premium pullover hoodie fits like a well-loved favorite, featuring a colorful and inspiring Amy Tangerine design.",
    descriptionHtml:
      "<p>This unisex premium pullover hoodie fits like a well-loved favorite, featuring a colorful and inspiring Amy Tangerine design.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("58.00"), maxVariantPrice: price("58.00") },
    images: { nodes: imgNodes("crafty-premium-unisex-pullover-hoodie", 5) },
    variants: { nodes: [variant("local-cph-v1", "58.00")] },
    tags: ["apparel", "hoodie"],
    productType: "Apparel",
    collections: { nodes: [collection("apparel", "Apparel")] },
  },
  {
    id: "local-crafty-sweatshirt",
    handle: "premium-unisex-crewneck-sweatshirt",
    title: "Crafty Premium Unisex Sweatshirt",
    description:
      "This unisex premium crewneck sweatshirt fits like a well-loved favorite, featuring a colorful and inspiring Amy Tangerine design.",
    descriptionHtml:
      "<p>This unisex premium crewneck sweatshirt fits like a well-loved favorite, featuring a colorful and inspiring Amy Tangerine design.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("48.00"), maxVariantPrice: price("48.00") },
    images: { nodes: imgNodes("premium-unisex-crewneck-sweatshirt", 5) },
    variants: { nodes: [variant("local-puc-v1", "48.00")] },
    tags: ["apparel", "sweatshirt"],
    productType: "Apparel",
    collections: { nodes: [collection("apparel", "Apparel")] },
  },
  {
    id: "local-imagine-sweatshirt",
    handle: "imagine-the-possibilities-unisex-sweatshirt",
    title: "Imagine the Possibilities Unisex Sweatshirt",
    description:
      "This unisex premium crewneck sweatshirt fits like a well-loved favorite, featuring the Imagine the Possibilities design by Amy Tangerine.",
    descriptionHtml:
      "<p>This unisex premium crewneck sweatshirt fits like a well-loved favorite, featuring the <em>Imagine the Possibilities</em> design by Amy Tangerine.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("48.00"), maxVariantPrice: price("48.00") },
    images: { nodes: imgNodes("imagine-the-possibilities-unisex-sweatshirt", 4) },
    variants: { nodes: [variant("local-itps-v1", "48.00")] },
    tags: ["apparel", "sweatshirt"],
    productType: "Apparel",
    collections: { nodes: [collection("apparel", "Apparel")] },
  },
  {
    id: "local-crafty-vneck",
    handle: "crafty-womens-v-neck-t-shirt",
    title: "Crafty Women's V-Neck T-Shirt",
    description:
      "Crafty and vibrant, just like you. This women's v-neck t-shirt fits like a well-loved favorite with a modern slim fit.",
    descriptionHtml:
      "<p>Crafty and vibrant, just like you. This women's v-neck t-shirt fits like a well-loved favorite with a modern slim fit.</p>",
    availableForSale: true,
    priceRange: { minVariantPrice: price("32.00"), maxVariantPrice: price("32.00") },
    images: { nodes: imgNodes("crafty-womens-v-neck-t-shirt", 4) },
    variants: { nodes: [variant("local-cvnt-v1", "32.00")] },
    tags: ["apparel", "t-shirt"],
    productType: "Apparel",
    collections: { nodes: [collection("apparel", "Apparel")] },
  },
]

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getAllLocalProducts(): ShopifyProduct[] {
  return LOCAL_PRODUCTS
}

export function getLocalProductByHandle(handle: string): ShopifyProduct | null {
  return LOCAL_PRODUCTS.find((p) => p.handle === handle) ?? null
}

export function getLocalProductsByCategory(category: string): ShopifyProduct[] {
  return LOCAL_PRODUCTS.filter((p) =>
    p.collections.nodes.some((c) => c.handle === category)
  )
}

/** Returns the first N products, optionally filtered by tag */
export function getFeaturedProducts(limit = 8, tag?: string): ShopifyProduct[] {
  const products = tag
    ? LOCAL_PRODUCTS.filter((p) => p.tags.includes(tag))
    : LOCAL_PRODUCTS
  return products.slice(0, limit)
}
