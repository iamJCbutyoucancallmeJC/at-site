// close-us-hm-intl-leak.mjs
//
// PURPOSE
//   Closes the "US Happy Mail ships free to CA/AU/GB" leak.
//
//   ROOT CAUSE: the $13 Monthly + $72 6-Month US HM variants and the $16 IHM
//   product all sit on ONE delivery profile ("Happy Mail Subscription",
//   gid://shopify/DeliveryProfile/137416638784). That profile has an
//   International zone [AU,CA,GB] with Free Shipping, added 2026-05-27 (Path B
//   Phase B.3) to serve IHM. Shopify delivery zones apply to EVERY member of the
//   profile, so the US $13/$72 variants ALSO ship free to CA/AU/GB. A US buyer
//   gifting HM to an intl address gets free intl postage that the $13/$72 price
//   never accounted for -- a recurring margin leak (subscription => every renewal).
//   Verified live 2026-05-30 via Storefront cartCreate (US buyer -> Toronto addr
//   -> $13 USD, Free Shipping, checkout resolves).
//
//   FIX: separate the products onto two profiles.
//     - NEW profile "Happy Mail International" carries the IHM Path B SPG
//       (81132388672) + an International zone [AU,CA,GB] Free Shipping.
//     - The EXISTING "Happy Mail Subscription" profile loses its International
//       zone, becoming US-only. The US $13/$72 variants can then ONLY ship US.
//
//   RESULT: US HM gift-to-intl finds NO delivery option (checkout blocked = leak
//   closed). IHM still ships free to CA/AU/GB for legit intl buyers (unchanged).
//
// SAFETY
//   - DRY-RUN by default. Pass --execute to mutate the live store.
//   - IHM has ZERO subscribers (verified 2026-05-30 via Recharge): moving its SPG
//     to a new profile disrupts no live subscriber.
//   - The 189 active Monthly + 1 active 6-Month US subs are NOT touched (their
//     SPGs stay on the existing profile; only the intl zone is removed).
//   - Reversible: re-add the International zone to the old profile + delete the
//     new profile (rollback steps printed at the end).
//
// SCOPES: needs write_shipping (the at-site headless token HAS it as of 2026-05-30;
//   credentials.md line 31 is stale -- token scopes were widened).
//
// RUN: ADMIN_TOKEN=$(curl ... client_credentials ...) node scripts/close-us-hm-intl-leak.mjs [--execute]

const DOMAIN = "q9x1sj-hc.myshopify.com";
const TOKEN = process.env.ADMIN_TOKEN;
const API = "2026-07";
const ENDPOINT = `https://${DOMAIN}/admin/api/${API}/graphql.json`;
const EXECUTE = process.argv.includes("--execute");

// --- Known live IDs (verified 2026-05-30) ---
const SHARED_PROFILE = "gid://shopify/DeliveryProfile/137416638784"; // "Happy Mail Subscription"
const INTL_ZONE_ON_SHARED = "gid://shopify/DeliveryZone/584046543168"; // [AU,CA,GB] to DELETE from shared
const IHM_SPG = "gid://shopify/SellingPlanGroup/81132388672"; // IHM Monthly (Path B) -> moves to new profile
const SHOP_LOCATION = "gid://shopify/Location/111770370368"; // sole store location (the new profile must carry it)

if (!TOKEN) { console.error("Missing ADMIN_TOKEN env var."); process.exit(1); }

async function q(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error("GraphQL: " + JSON.stringify(json.errors));
  return json.data;
}

function log(...a) { console.log(...a); }

async function main() {
  log(`\n=== close-us-hm-intl-leak (${EXECUTE ? "EXECUTE" : "DRY-RUN"}) ===\n`);

  // STEP 1: Create a dedicated IHM delivery profile, attaching the IHM SPG and an
  // International zone [AU,CA,GB] Free Shipping. deliveryProfileCreate lets us set
  // the zone + method + the SPG association in one shot.
  log("STEP 1: create 'Happy Mail International' profile (IHM SPG + intl Free Shipping)");
  const createInput = {
    name: "Happy Mail International",
    sellingPlanGroupsToAssociate: [IHM_SPG],
    locationGroupsToCreate: [{
      locationsToAdd: [SHOP_LOCATION], // a custom profile must carry the shop's location
      zonesToCreate: [{
        name: "International",
        // Shopify requires province coverage for CA/AU when creating a zone;
        // includeAllProvinces mirrors the existing shared-profile intl zone (all provinces).
        countries: [
          { code: "CA", includeAllProvinces: true },
          { code: "AU", includeAllProvinces: true },
          { code: "GB", includeAllProvinces: true },
        ],
        methodDefinitionsToCreate: [{
          name: "Free Shipping",
          active: true,
          rateDefinition: { price: { amount: "0.00", currencyCode: "USD" } },
        }],
      }],
    }],
  };

  if (!EXECUTE) {
    log("  [dry-run] would deliveryProfileCreate with:");
    log("  " + JSON.stringify(createInput, null, 2).replace(/\n/g, "\n  "));
  } else {
    const r = await q(`
      mutation($profile: DeliveryProfileInput!) {
        deliveryProfileCreate(profile: $profile) {
          profile { id name sellingPlanGroups(first:10){nodes{id name}}
            profileLocationGroups { locationGroupZones(first:10){nodes{zone{name countries{code{countryCode}}} methodDefinitions(first:5){nodes{name active}}}} } }
          userErrors { field message }
        }
      }`, { profile: createInput });
    const ue = r.deliveryProfileCreate.userErrors;
    if (ue.length) { console.error("  userErrors:", JSON.stringify(ue)); process.exit(1); }
    const np = r.deliveryProfileCreate.profile;
    log("  CREATED:", np.id, "|", np.name);
    log("  SPGs:", np.sellingPlanGroups.nodes.map(s=>s.name).join(", "));
  }

  // STEP 2: Remove the International zone from the shared profile -> it becomes US-only.
  log("\nSTEP 2: delete International zone from shared profile -> US-only");
  if (!EXECUTE) {
    log(`  [dry-run] would deliveryProfileUpdate(${SHARED_PROFILE}) zonesToDelete: [${INTL_ZONE_ON_SHARED}]`);
  } else {
    // zonesToDelete is a TOP-LEVEL field on DeliveryProfileInput (not nested under the location group).
    const r = await q(`
      mutation($id: ID!, $profile: DeliveryProfileInput!) {
        deliveryProfileUpdate(id: $id, profile: $profile) {
          profile { id name profileLocationGroups { locationGroupZones(first:10){nodes{zone{name countries{code{countryCode}}}}} } }
          userErrors { field message }
        }
      }`, {
        id: SHARED_PROFILE,
        profile: { zonesToDelete: [INTL_ZONE_ON_SHARED] },
      });
    const ue = r.deliveryProfileUpdate.userErrors;
    if (ue.length) { console.error("  userErrors:", JSON.stringify(ue)); process.exit(1); }
    const zones = r.deliveryProfileUpdate.profile.profileLocationGroups.flatMap(g=>g.locationGroupZones.nodes);
    log("  shared profile zones now:", zones.map(z=>`${z.zone.name}[${z.zone.countries.map(c=>c.code.countryCode).join(",")}]`).join(", "));
  }

  log("\n=== ROLLBACK (if needed) ===");
  log("  1. deliveryProfileUpdate(" + SHARED_PROFILE + ") add back International zone [CA,AU,GB] Free Shipping");
  log("  2. deliveryProfileDelete(<new 'Happy Mail International' profile id>)  (re-associates IHM SPG to shared)");
  log(EXECUTE ? "\nDONE. Re-run the cart smoke test to verify." : "\nDRY-RUN complete. Re-run with --execute to apply.");
}

main().catch(e => { console.error(e); process.exit(1); });
