// affiliate-picks-data.mjs  (t816 -- AT affiliate shop content)
//
// The curated v1 content for /shop-my-faves: 5 of Amy's evergreen Amazon idea
// lists, ~8-10 featured items each, pulled from her public storefront
// (amazon.com/shop/amytangerine) on 2026-06-24. Each item carries its ASIN (the
// stable product id -> https://www.amazon.com/dp/<ASIN>), a display-cleaned title
// (Amazon's raw SEO titles trimmed to a human name), and a NOTE DRAFTED IN AMY'S
// VOICE by JC/Claude -- Amy edits these before/after publish (d055).
//
// `count` is the canonical list size shown on her storefront tile (the "See all N
// on Amazon" CTA target), NOT the number of featured items here.
// `listId` builds the deep-link: /shop/amytangerine/list/<listId>.
//
// NO images here -- v1 launches text-forward; SiteStripe images are a later pass.
// NO prices -- Amazon prohibits cached prices.
//
// This file is data only. scripts/populate-affiliate-lists.mjs consumes it.

export const AFFILIATE_LISTS = [
  {
    // Amy's OWN KDP books (JC-ruled 2026-07-06: merchandise at top of page; start
    // with these 2, more to come). No listId -- there's no Amazon idea list for
    // these, so no "See all" deep-link (populate script writes list_url as empty).
    listId: null,
    title: "My Books",
    slug: "my-books",
    count: 2,
    sortOrder: 0,
    description:
      "The ones I made myself! Books and notebooks designed to be used hard: torn, snipped, painted, and filled with your everyday memories.",
    picks: [
      { asin: "B0H414S9DK", title: "Sunshine & Rainbows Traveler's Notebook",
        note: "My traveler's notebook: a colorful foundation for creativity, memories, and everyday joy." },
      { asin: "B0GVF8HP46", title: "Paper Play 3: Junk Journal Edition",
        note: "The third Paper Play! A whole book of pages made to be cut, torn, layered, and collaged." },
    ],
  },
  {
    listId: "L7F4JUTVJ39Z",
    title: "Favorite Crafty Must Haves",
    slug: "favorite-crafty-must-haves",
    count: 96,
    sortOrder: 1,
    description:
      "The supplies I reach for again and again. The ones that have earned a permanent spot on my desk.",
    picks: [
      { asin: "B0B87XPWB2", title: "Kuretake Gansai Tambi Watercolor Set (24 Colors)",
        note: "The watercolors I keep coming back to. The color payoff is unreal and they reactivate beautifully." },
      { asin: "B0BBZ3P542", title: "Pentel Brush Touch Sign Pens (24 Colors)",
        note: "My everyday brush pens for lettering and quick color. The flexible tip is so forgiving." },
      { asin: "B0DP64MRXV", title: "Pilot Kakuno Fountain Pen (Smiley Face Nib)",
        note: "The little smiley on the nib makes me happy every single time. Writes like a dream, too." },
      { asin: "B0FFCDJJVB", title: "Zebra Mildliner Dual-Tip Stamp Markers",
        note: "Mildliners but with cute stamps built in. Dangerous in the best way for journal pages." },
      { asin: "B0044S5JNC", title: "Dr. Ph. Martin's Hydrus Watercolor (Set 1)",
        note: "When I want colors that glow, these liquid watercolors are it. A little goes a long way." },
      { asin: "B0FX2D61GC", title: "Postage Stamp Punch (Rectangular)",
        note: "Turns any paper into faux postage stamps. Such a fun detail for snail mail and journals." },
      { asin: "B0FJ2PPXNX", title: "Hobonichi Techo Graph Notebook (A5)",
        note: "The paper quality is worth the hype. Takes my pens and paint without bleeding through." },
      // Paper Play (B0GVF8HP46) moved to the "My Books" list 2026-07-06 -- it's
      // Amy's own book; same pick metaobject (keyed by ASIN), keeps its image.
    ],
  },
  {
    listId: "1UZFZL126K67Q",
    title: "Photo printer favorites",
    slug: "photo-printer-favorites",
    count: 14,
    sortOrder: 2,
    description:
      "I print photos small and often. These are the little machines that turn phone pics into something you can hold.",
    picks: [
      { asin: "B0BF6T86WD", title: "Canon Selphy CP1500 Wireless Photo Printer",
        note: "My workhorse for 4x6 prints. The color holds up and it's wireless, so I print straight from my phone." },
      { asin: "B001BJKO3M", title: "Canon KP-108IN Ink & Paper Set",
        note: "The refill set for the Selphy. Buy it with the printer so you never run out mid-project." },
      { asin: "B0DFHM5R9T", title: "Fujifilm Instax Mini Link 3 Printer",
        note: "Instax-size prints with that soft, dreamy look. The kids love watching them develop." },
      { asin: "B09GXMRPV8", title: "Fujifilm Instax Link Wide Printer",
        note: "When I want a wider instant print with room for a caption. Great for layouts." },
      { asin: "B084TKMXZ2", title: "Canon Selphy Square QX10 Photo Printer",
        note: "Square prints that look so good in a journal. Tiny enough to toss in a bag." },
      { asin: "B0DGQRQG77", title: "Canon Selphy QX20 Photo Printer",
        note: "The newer square Selphy. A little upgrade and just as easy to use." },
      { asin: "B08FST3H95", title: "Kodak Mini 2 Retro Photo Printer",
        note: "A pocket printer for sticker-back prints. Fun for on-the-go memory keeping." },
      { asin: "B0BHSPW6NV", title: "Liene Pearl K100 2x3 Photo Printer",
        note: "Affordable little printer that does sticky-back prints. A nice starter for the kids." },
      { asin: "B0BGM5WRQ1", title: "Canon Ivy 2 Mini Photo Printer",
        note: "Slim, sticky-backed prints that go right into a journal. The one I hand to my daughter." },
    ],
  },
  {
    listId: "3SOGIB7QKUN4V",
    title: "Studio Photo & Video Essentials",
    slug: "studio-photo-video-essentials",
    count: 7,
    sortOrder: 3,
    description:
      "The gear behind my YouTube videos and studio shots. Nothing fancier than what I actually use.",
    picks: [
      { asin: "B0CG19FGQ5", title: "DJI Osmo Pocket 3 Creator Combo",
        note: "My favorite little vlogging camera. The stabilization makes everything look smooth and intentional." },
      { asin: "B002VA464S", title: "Blue Yeti USB Microphone",
        note: "The mic I record voiceovers with. Plug-and-play, and it makes a real difference in sound." },
      { asin: "B0B8J1JFLC", title: "Overhead Camera Desk Mount Rig",
        note: "How I get those top-down crafting shots. Sturdy enough that I stopped worrying about it tipping." },
      { asin: "B09X114FP9", title: "Ulanzi J12 Wireless Lavalier Mic",
        note: "Tiny clip-on mic for clean audio when I'm moving around. No more echoey room sound." },
      { asin: "B09X7DMBVF", title: "SanDisk Extreme Pro 256GB microSD Card",
        note: "Fast, roomy card that keeps up with 4K. Buy a couple so you're never caught full." },
      { asin: "B07Q3471S2", title: "Dimmable LED Ring Light with Tripod",
        note: "The easy lighting fix. Clips up fast and makes my hands and projects look so much better on camera." },
      { asin: "B0CM5TS3LP", title: "Apple iMac (M3, 24-inch)",
        note: "Where all the editing happens. The big bright screen makes color work a joy." },
    ],
  },
  {
    listId: "2S2DNSTVKRJBL",
    title: "Painting fun - kits and sets",
    slug: "painting-fun-kits-and-sets",
    count: 19,
    sortOrder: 4,
    description:
      "For when you just want to play with color. The paints, pads, and little kits I love getting messy with.",
    picks: [
      { asin: "B07DW9HQSQ", title: "Sakura Koi Watercolor Pocket Set (24 Colors)",
        note: "The travel watercolor set that started a lot of my paint play. Slips right into a bag." },
      { asin: "B08SQB58S8", title: "Golden High Flow Acrylics (Fluorescent Set)",
        note: "These neons are so alive. Great for splatter, lettering, and anything that needs to pop." },
      { asin: "B085LP88JY", title: "Dina Wakley Gloss Spray Bundle with Blending Sticks",
        note: "Mixed-media magic. The sprays layer up into the most gorgeous backgrounds." },
      { asin: "B079NPS1X4", title: "Dina Wakley Media Acrylic Paint",
        note: "Creamy, pigment-rich acrylics that play well with everything else on my table." },
      { asin: "B0047F8KQ0", title: "Sennelier Oil Pastels (Set of 72)",
        note: "Buttery oil pastels that feel like a treat. The full set is pure happiness." },
      { asin: "B07FG1L9M8", title: "Canson XL Watercolor Paper Pad",
        note: "My go-to practice paper. Affordable enough that you stop being precious and just paint." },
      { asin: "B08Z7GLWQV", title: "Wood Panels for Painting (6-Pack, 8x8)",
        note: "Little wood panels for finished pieces. I love how paint sits on the surface." },
      { asin: "B06XSFL4MS", title: "Blank Nesting Dolls (Unfinished Wood)",
        note: "A fun, unexpected thing to paint with the kids. Everyone makes them their own." },
    ],
  },
  {
    listId: "SG4ZEO3MZTJF",
    title: "Crafty Kids Gift Guide",
    slug: "crafty-kids-gift-guide",
    count: 33,
    sortOrder: 5,
    description:
      "Tried-and-true picks for the little makers in your life. Mess-free wins and open-ended favorites we actually use.",
    picks: [
      { asin: "B077Y55MGR", title: "Crayola Color Wonder Paintbrush Pens & Paper",
        note: "Mess-free paint that only shows up on the special paper. A parent's dream for car trips." },
      { asin: "B00AHAJ8TC", title: "Crayola Color Wonder Mini Markers (Pastel)",
        note: "The mess-free markers we keep in every bag. No stained couches, all the coloring." },
      { asin: "B0BYT6PJHT", title: "Crayola Color Wonder Coloring Pages (50ct)",
        note: "Refill pages so the Color Wonder fun never runs out. Stocking-stuffer gold." },
      { asin: "B00JPJF9V2", title: "Ooly Lil' Watercolor Paint Pods (36 Colors)",
        note: "Adorable washable watercolors sized for little hands. The colors are surprisingly lovely." },
      { asin: "B0D2KYN2JT", title: "Blank Hardcover Books for Kids (30-Pack)",
        note: "We make our own little books constantly. A whole stack means nobody has to wait a turn." },
      { asin: "B0BVQJDYLC", title: "Felt Letter Board with Letters (10x10)",
        note: "Equal parts decor and play. The kids leave me the funniest messages." },
      { asin: "B0GJZDCH9J", title: "Cute Sticker Book (1300+ Stickers)",
        note: "A giant sticker book is always a hit. Perfect for journaling and gifting alike." },
      { asin: "B07J3GTXYD", title: "Moleskine Cahier Journals (Large, Lined)",
        note: "Simple soft-cover notebooks I buy in bulk for the kids' writing and doodles." },
    ],
  },
]
