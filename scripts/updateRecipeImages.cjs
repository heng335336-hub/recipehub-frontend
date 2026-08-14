/**
 * RecipeHub — backfill recipe images
 * -----------------------------------------------------------------------
 * Your recipes were seeded with imageUrl: "" (empty). This script fills
 * in a real image URL for every recipe that doesn't have one yet, using
 * the recipe's title to look up a matching photo.
 *
 * NOTE on the image source:
 * The URLs in your original url_of_imgs.txt used source.unsplash.com,
 * which Unsplash fully shut down in 2024 (see
 * https://unsplash.com/documentation/changelog — "Unsplash Source
 * sunset", June 11 2024). Those links no longer return images. This
 * script instead builds working, keyword-matched URLs from
 * loremflickr.com (free, no API key, currently operational), using the
 * exact same recipe titles as keys — see recipeImageMap.json.
 *
 * SETUP:
 * 1. Copy this file AND recipeImageMap.json into your project's
 *    scripts/ folder (next to seed.cjs and serviceAccountKey.json).
 * 2. Make sure firebase-admin is installed (it already is, since
 *    seed.cjs needs it).
 *
 * RUN IT:
 *      node scripts/updateRecipeImages.cjs
 *
 * By default this only fills in recipes whose imageUrl is empty/missing
 * — it will NOT overwrite an image you already set manually. Pass
 * --force to overwrite every recipe's image instead:
 *      node scripts/updateRecipeImages.cjs --force
 * -----------------------------------------------------------------------
 */

const admin = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");
const fs = require("fs");

const FORCE = process.argv.includes("--force");

const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const db = getFirestore();

const IMAGE_MAP = JSON.parse(
  fs.readFileSync(path.join(__dirname, "recipeImageMap.json"), "utf8")
);

function slugTags(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

// Used only if a recipe's title isn't found in recipeImageMap.json
// (e.g. a recipe you added yourself after seeding, or one of the
// dynamically-generated modifier+base titles from seed.cjs that never
// made it into the map).
//
// NOTE: this used to build a LoremFlickr keyword-search URL like
// `https://loremflickr.com/640/480/weeknight,paella,food`. LoremFlickr
// returns its own generic placeholder photo whenever no photo matches
// *all* the given keywords at once - multi-word combos miss often, and
// every miss serves the exact same fallback image, which is why many
// different recipes were showing the identical picture. Picsum has no
// "no match" case: a given seed always maps to a specific, unique photo,
// so we use the same scheme recipeImageMap.json already uses.
function fallbackImageUrl(title) {
  const seed = slugTags(title).join("");
  return `https://picsum.photos/seed/${seed}/640/480`;
}

async function run() {
  const snapshot = await db.collection("recipes").get();
  console.log(`Found ${snapshot.size} recipes.`);

  let updated = 0;
  let skipped = 0;
  let batch = db.batch();
  let opsInBatch = 0;
  const BATCH_LIMIT = 400; // Firestore max is 500 writes per batch

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const hasImage = typeof data.imageUrl === "string" && data.imageUrl.trim() !== "";

    if (hasImage && !FORCE) {
      skipped++;
      continue;
    }

    const title = data.title || "";
    const url = IMAGE_MAP[title] || fallbackImageUrl(title);

    batch.update(doc.ref, { imageUrl: url });
    opsInBatch++;
    updated++;

    if (opsInBatch >= BATCH_LIMIT) {
      await batch.commit();
      console.log(`Committed batch — ${updated} updated so far...`);
      batch = db.batch();
      opsInBatch = 0;
    }
  }

  if (opsInBatch > 0) {
    await batch.commit();
  }

  console.log(
    `\n✅ Done. Updated ${updated} recipe(s), skipped ${skipped} (already had an image).`
  );
  process.exit(0);
}

run().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
