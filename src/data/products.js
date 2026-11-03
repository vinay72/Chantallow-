// src/data/products.js
// Single source of truth for every product. Home cards, the product detail
// page, the cart and the wishlist all look products up from here by id/slug.
//
// Fields used by the product detail page:
//   name, subtitle, badge
//   description   -> string, or array of strings (one per paragraph)
//   ingredients   -> string
//   directions    -> string, or array of strings (shown as a numbered list)
//   directionsNote-> bold line under the directions (e.g. "Use within 12 months of opening.")

import { mediaUrl } from "../api/client";
import amberGlowCard from "../assets/product/new/1.jpg";
import amethystReliefCard from "../assets/product/new/2.jpg";
import jasperReviveCard from "../assets/product/new/3.jpg";
import malachiteFusionCard from "../assets/product/new/4.jpg";
import obsidianInfusionCard from "../assets/product/new/5.jpg";
import olivineReliefCard from "../assets/product/new/6.jpg";
import bareWhippedTallowCard from "../assets/product/new/7.jpg";
import talumaHairCareCard from "../assets/product/new/8.jpg";

import amberGlowJar from "../assets/beauty/amber-glow.jpg";
import amethystReliefJar from "../assets/productdetailimages/Amethyst Relief/front 4oz.png";
import jasperReviveJar from "../assets/beauty/jasper-revive.jpg";
import malachiteFusionJar from "../assets/beauty/malachite-fusion.jpg";
import olivineReliefJar from "../assets/beauty/olivine-relief.jpg";
import obsidianInfusionJar from "../assets/beauty/obsidian-infusion.jpg";
import talumaHairCareJar from "../assets/beauty/taluma-hair-care.jpg";
import bareWhippedTallowJar from "../assets/beauty/bare-whipped-tallow.jpg";
import furkindFront2oz from "../assets/productdetailimages/Furkind/front 2oz.jpg";
import furkindFront4oz from "../assets/productdetailimages/Furkind/front 4oz.png";

const skinDescription = (infusion) =>
    `A rich, nourishing tallow crème made with grass-fed, grass-finished beef tallow${
        infusion ? ` and infused with ${infusion}` : ""
    } to deeply moisturize and support soft, healthy-looking skin naturally.`;

// Default directions for the skin crèmes (used when a product has none of its own)
export const DEFAULT_DIRECTIONS =
    "Apply a small scoop and rub into skin. Use as needed for whole body skin care. External use only. Patch test first.";
export const DEFAULT_DIRECTIONS_NOTE = "Use within 1 year.";

// NOTE: price / oldPrice of 0 are placeholders. Put your real prices here and
// every page (cards, detail, cart totals) updates automatically.
export const PRODUCTS = [
    {
        id: 1,
        slug: "amber-glow",
        name: "Amber Glow",
        // Name + photo used in the cart, wish list, checkout and Quick View: big jar (4oz) + small jar (2oz)
        displayName: "Amber Glow (4oz) + Bare Whipped Tallow (2oz)",
        subtitle: "1122+ MGO Manuka Honey + Lavender Infused Tallow",
        price: 80,
        oldPrice: 89,
        badge: "SALE 20% OFF",
        cardImage: amethystReliefCard,
        gallery: [amberGlowJar, amberGlowCard],
        description: "Premium 1122+ MGO Manuka Honey helps hydrate and nourish skin with natural antioxidants and amino acids. Royal Jelly and Bee Pollen provide vitamins and minerals that support skin vitality and a healthy-looking glow. Lavender, jojoba oil, and grass-fed tallow help soothe dryness, lock in moisture, and maintain supple skin.",
        ingredients: "Grass-Fed Suet Tallow, 1122+ MGO Manuka Honey, Organic Lavender, Royal Jelly, Bee Pollen, Pure Honey, Jojoba Oil",
        attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Dry skin"],
    },
    {
        id: 2,
        slug: "amethyst-relief",
        name: "Amethyst Relief",
        // Name + photo used in the cart, wish list, checkout and Quick View: big jar (4oz) + small jar (2oz)
        displayName: "Amethyst Relief (4oz) + Jasper Revive (2oz)",
        subtitle: "Lavender Infused & Whipped Tallow",
        price: 0,
        oldPrice: 0,
        cardImage: olivineReliefCard,
        gallery: [amethystReliefJar, amethystReliefCard],
        description: "Organic Lavender helps soothe dry, irritated skin while providing a calming botanical aroma. Grass-fed tallow delivers skin-loving fatty acids and Vitamins A, D, E, and K to support skin renewal and barrier health. Together, they provide lasting hydration, softness, and comfort for healthy-looking skin.",
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Organic Lavender",
        attributes: ["Skin Type: Dry", "Item Form: Whipped Cream", "Used For: Soothing"],
    },
    {
        id: 3,
        slug: "jasper-revive",
        name: "Jasper Revive",
        // Name + photo used in the cart, wish list, checkout and Quick View: big jar (4oz) + small jar (2oz)
        displayName: "Jasper Revive (4oz) + Obsidian Infusion (2oz)",
        subtitle: "Coffee Infused Tallow",
        price: 0,
        oldPrice: 0,
        badge: "SALE 20% OFF",
        cardImage: jasperReviveCard,
        gallery: [jasperReviveJar, jasperReviveCard],
        description: "Colombian Coffee is rich in antioxidants that help protect skin from environmental stressors and promote a refreshed complexion. Its beneficial plant compounds support smoother-looking skin texture and tone. Vitamin-rich grass-fed tallow deeply moisturizes, softens rough areas, and helps maintain skin elasticity.",
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Organic Whole Bean Colombian Coffee",
        attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Revitalizing"],
    },
    {
        id: 4,
        slug: "malachite-fusion",
        name: "Malachite Fusion",
        // Name + photo used in the cart, wish list, checkout and Quick View: big jar (4oz) + small jar (2oz)
        displayName: "Malachite Fusion (4oz) + Amethyst Relief (2oz)",
        subtitle: "Moringa + Butterfly Pea Infused Tallow",
        price: 66,
        oldPrice: 89,
        badge: "SALE 20% OFF",
        cardImage: amberGlowCard,
        gallery: [malachiteFusionJar, malachiteFusionCard],
        description: "Vitamin-rich Moringa helps support collagen production, skin firmness, and a brighter complexion. Antioxidant-rich Butterfly Pea Flower helps protect against environmental stress and promotes radiant-looking skin. Rosemary provides additional antioxidant support, while grass-fed tallow delivers deep hydration and lasting softness.",
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Moringa, Butterfly Pea Flower, Rosemary, Frankincense, Myrrh",
        attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Hydration"],
    },
    {
        id: 5,
        slug: "obsidian-infusion",
        name: "Obsidian Infusion",
        // Name + photo used in the cart, wish list, checkout and Quick View: big jar (4oz) + small jar (2oz)
        displayName: "Obsidian Infusion (4oz) + Taluma Hair Care (2oz)",
        subtitle: "Cacao Infused Tallow",
        price: 0,
        oldPrice: 0,
        cardImage: talumaHairCareCard,
        gallery: [obsidianInfusionJar, obsidianInfusionCard],
        description: "Organic Cacao provides antioxidants and minerals that support smoother, radiant, youthful-looking skin. Hazelnut Coffee adds antioxidant benefits while delivering a warm, comforting aroma. Grass-fed tallow nourishes with essential fatty acids and vitamins to maintain deep hydration, softness, and skin elasticity.",
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Organic Cacao Nibs, Organic Cacao Powder, Hazelnut Ground Coffee",
        attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Dry skin"],
    },
    {
        id: 6,
        slug: "olivine-relief",
        name: "Olivine Relief",
        // Name + photo used in the cart, wish list, checkout and Quick View: big jar (4oz) + small jar (2oz)
        displayName: "Olivine Relief (4oz) + Malachite Fusion (2oz)",
        subtitle: "Zechstein Magnesium + Arnica Tallow Balm",
        price: 0,
        oldPrice: 0,
        cardImage: malachiteFusionCard,
        gallery: [olivineReliefJar, olivineReliefCard],
        description: "Zechstein Magnesium helps ease muscle tension and promote relaxation, providing soothing comfort to tired, overworked muscles. Arnica Montana and Willow Bark are traditionally used to help relieve soreness, aches, and discomfort after physical activity. Lavender, Frankincense, and Myrrh provide calming botanical benefits, while grass-fed tallow deeply nourishes and moisturizes the skin.",
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Zechstein Magnesium Chloride, Arnica Montana, Willow Bark, Lavender, Frankincense, Myrrh, Ginkgo Biloba",
        attributes: ["Skin Type: All", "Item Form: Balm", "Used For: Muscle relief"],
    },
    {
        id: 7,
        slug: "taluma-hair-care",
        name: "Taluma Hair Care",
        // Name + photo used in the cart, wish list, checkout and Quick View: big jar (4oz) + small jar (2oz)
        displayName: "Taluma Hair Care (4oz) + Amber Glow (2oz)",
        subtitle: "Grass-Fed/Grass-Finished Beef Tallow, Raw Honduran Batana Oil",
        price: 0,
        oldPrice: 0,
        badge: "SALE 10% OFF",
        cardImage: obsidianInfusionCard,
        gallery: [talumaHairCareJar, talumaHairCareCard],
        description: "Raw Honduran Batana Oil, rich in Vitamin E and Omega fatty acids, helps nourish damaged hair, improve elasticity, and reduce breakage. Rosemary, Argan Oil, and Castor Oil support scalp health, smooth frizz, and enhance natural shine. Black Seed Oil and grass-fed tallow deeply condition the scalp, strengthen the appearance of hair, and support fuller, healthier-looking strands.",
        ingredients:
            "Grass-Fed/Grass-Finished Beef Tallow, Raw Honduran Batana Oil, Organic: Rosemary Argan Oil, Castor Oil, Black Seed Oil, Black Cumin Seed Oil",
        directions:
            "Massage a generous amount onto the scalp and throughout the hair. Leave on for 30–60 minutes before washing. For an intensive treatment, leave on overnight and wash thoroughly the next morning. Use 1–2 times per week or as needed. External Use Only. Perform a patch test before first use. Store in a cool, dry place away from direct sunlight.",
        directionsNote: "Use within 12 months of opening.",
        attributes: ["Hair Type: All", "Item Form: Balm", "Used For: Strengthen & repair"],
    },
    {
        id: 8,
        slug: "bare-whipped-tallow",
        name: "Bare Whipped Tallow",
        // Name + photo used in the cart, wish list, checkout and Quick View: big jar (4oz) + small jar (2oz)
        displayName: "Bare Whipped Tallow (4oz) + Olivine Relief (2oz)",
        subtitle: "Grass-Fed/Grass-Finished Beef Tallow, Organic Unrefined Jojoba Oil",
        price: 0,
        oldPrice: 0,
        badge: "SALE 10% OFF",
        cardImage: bareWhippedTallowCard,
        gallery: [bareWhippedTallowJar, bareWhippedTallowCard],
        description: "Grass-fed tallow provides Vitamins A, D, E, and K to support skin renewal, moisture retention, and barrier health. Organic unrefined Jojoba Oil, rich in Vitamin E and antioxidants, helps soothe dryness and maintain skin elasticity. Together, these two pure ingredients deliver lightweight, long-lasting nourishment without added fragrances or fillers.",
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Organic Unrefined Jojoba Oil",
        directions:
            "Apply a fingertip scoop of Bare Whipped Tallow to clean skin and gently massage until absorbed. Use on the face, hands, body, dry patches, elbows, knees, or any area needing extra moisture and nourishment. Apply daily or as needed as part of your regular skincare routine. Suitable for sensitive skin and safe for all ages, including babies. For external use only. Perform a patch test before first use. Store in a cool, dry place away from direct sunlight and excessive heat.",
        directionsNote: "Use within 12 months of opening for optimal freshness and performance.",
        attributes: ["Skin Type: Sensitive", "Item Form: Whipped Cream", "Used For: Everyday moisture"],
    },
    {
        id: 9,
        slug: "furkind-pet-tallow",
        name: "Furkind Pet Tallow",
        displayName: "Furkind Pet Tallow",
        subtitle: "Grass-Fed/Grass-Finished Beef Tallow, Organic Raw Unrefined Coconut Oil",
        price: 0,
        oldPrice: 0,
        badge: "SALE 10% OFF",
        cardImage: furkindFront2oz,
        gallery: [furkindFront2oz, furkindFront4oz],
        description: "Grass-fed tallow provides natural vitamins and fatty acids that help nourish dry skin and soften rough paws. Organic raw Coconut Oil contains lauric, caprylic, and capric acids that condition skin and support moisture retention. Together, they help soothe dryness, reduce cracking, and protect your pet's paws and skin.",
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Organic Raw Unrefined Coconut Oil",
        attributes: ["Used For: Pets", "Item Form: Balm"],
    },
];

export const getProductById = (id) => PRODUCTS.find((p) => p.id === Number(id));
export const getProductBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;

// Where a product's name / image should link to. Combos have their own page;
// products added in the admin panel (see fromServerProduct) have no detail
// page yet, so they go to the shop.
export const productPath = (product) =>
    product?.path || (product?.slug ? `/product/${product.slug}` : "/shop-list");

// Products and combos added in the admin panel live in the database, not in
// PRODUCTS. In the cart / wishlist they use ids like "srv-12" and "combo-3" so
// they never clash with the ids above.
export const isServerProductId = (id) => typeof id === "string" && /^(srv|combo)-\d+$/.test(id);

// "Malachite Fusion (4 oz) + Amethyst Relief (2 oz)"
export const comboItemsLabel = (items = []) =>
    items.map((it) => `${it.qty > 1 ? `${it.qty} × ` : ""}${it.name}${it.size ? ` (${it.size})` : ""}`).join(" + ");

// API combo row -> the same shape as an entry in PRODUCTS, plus the combo's
// card fields (tag, accent, items).
export function fromServerCombo(row) {
    const img = mediaUrl(row.image || "");
    return {
        id: `combo-${row.id}`,
        comboId: row.id,
        name: row.name,
        displayName: row.name,
        subtitle: comboItemsLabel(row.items),
        description: row.description || "",
        price: Number(row.price),
        compareAtPrice: row.compare_at_price != null && Number(row.compare_at_price) > Number(row.price) ? Number(row.compare_at_price) : null,
        tag: row.tag || "",
        accent: row.accent || "#3B1941",
        items: row.items || [],
        cardImage: img,
        gallery: [img],
        slug: null,
        path: `/combo/${row.id}`,
    };
}

// API product row -> the same shape as an entry in PRODUCTS (what the cart,
// header drawer and checkout read), so it can be added to the cart.
export function fromServerProduct(row) {
    const img = mediaUrl(row.main_image || row.images?.find((m) => m.type === "image")?.url || "");
    const photos = (row.images || []).filter((m) => m.type !== "video").map((m) => mediaUrl(m.url));
    const gallery = [...new Set([img, ...photos].filter(Boolean))];
    const img2oz = row.main_image_2oz ? mediaUrl(row.main_image_2oz) : "";
    const price = Number(row.price);
    const compare = row.compare_at_price == null ? null : Number(row.compare_at_price);
    const was = compare && compare > price ? compare : null;
    return {
        id: `srv-${row.id}`,
        dbId: row.id,
        name: row.name,
        displayName: row.name,
        subtitle: row.subname || "",
        description: row.description || "",
        ingredients: row.ingredients || "",
        directions: row.directions || "",
        category: row.category || "",
        price,
        compareAtPrice: was,
        oldPrice: was,
        size: row.size || "",
        inStock: row.stock_status !== "out_of_stock",
        cardImage: img || gallery[0] || "",
        cardImage2oz: img2oz,
        gallery,
        attributes: [row.category && `Category: ${row.category}`].filter(Boolean),
        slug: null,
        path: `/product/${row.id}`,
    };
}

// "4 oz" / "2oz" -> the cart's size key
export const sizeKey = (size) => String(size || "").toLowerCase().replace(/\s+/g, "") || "4oz";

/* =====================================================================
   PRODUCT DETAIL PAGE PHOTOS  (front · ingredients · description · 360°)
   ---------------------------------------------------------------------
   Put each product's photos in its own folder inside src/assets/productdetailimages/:

     src/assets/productdetailimages/
       Amber Tallow/        Amethyst Relief/     Bare/
       Jasper Revive/       Malachite Fusion/    Obsidian Infusion/
       Olivine Relief/      Taluma Hair care/    (Furkind/ is ignored here)

   Inside each folder any file names work. A file is recognised by its name:
     front 2oz                 -> cover when 2 oz is selected
     front 4oz / front / cover / main -> cover (4 oz, the default size)
     ingredient...             -> 2nd image
     description / desc        -> 3rd image
     360 / spin / rotate       -> 4th: the 360° view (.mp4/.webm video, .gif,
                                  or a sub-folder of numbered frames 01.jpg, 02.jpg…)
   Files without one of those words fill the empty slots in name order.
   Any video file is always used as the 360° view.
   Products with no folder yet just show their single jar photo (no combo images).
   ===================================================================== */

const MEDIA_FILES = import.meta.glob(
    "../assets/productdetailimages/**/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,avif,gif,GIF,mp4,MP4,webm,WEBM,mov,MOV}",
    { eager: true, import: "default" }
);

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

// folder name (any spacing/case) -> product slug
const FOLDER_TO_SLUG = {
    ambertallow: "amber-glow",
    amberglow: "amber-glow",
    amethystrelief: "amethyst-relief",
    jasperrevive: "jasper-revive",
    malachitefusion: "malachite-fusion",
    obsidianinfusion: "obsidian-infusion",
    olivinerelief: "olivine-relief",
    talumahaircare: "taluma-hair-care",
    bare: "bare-whipped-tallow",
    barewhippedtallow: "bare-whipped-tallow",
    furkind: "furkind-pet-tallow",
    furkindpettallow: "furkind-pet-tallow",
};

const isVideo = (name) => /\.(mp4|webm|mov)$/i.test(name);
const byName = (a, b) => a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: "base" });

function roleOf(file) {
    const n = file.toLowerCase();
    if (isVideo(n) || /360|spin|rotat|turn/.test(n)) return "spin";
    if (/(^|[^0-9])2\s*-?\s*oz/.test(n)) return "front2oz"; // checked before "front"
    if (/(^|[^0-9])4\s*-?\s*oz/.test(n)) return "front";
    if (/ingred/.test(n)) return "ingredients";
    if (/desc/.test(n)) return "description";
    if (/front|cover|main|hero/.test(n)) return "front";
    return null;
}

// Each folder currently holds the two back-label photos. When their file names
// don't say which is which, the 1st file (in name order) is the DESCRIPTION label
// and the 2nd is the INGREDIENTS label — that's how your files are ordered.
const UNNAMED_ORDER = ["description", "ingredients", "front", "spin"];

const MEDIA_BY_SLUG = (() => {
    const raw = {};
    for (const [path, url] of Object.entries(MEDIA_FILES)) {
        const rel = path.split("/assets/productdetailimages/")[1];
        if (!rel) continue;
        const parts = rel.split("/");
        const slug = FOLDER_TO_SLUG[norm(parts[0])];
        if (!slug) continue;
        const entry = (raw[slug] = raw[slug] || { files: [], frames: [] });
        const file = parts[parts.length - 1];
        // files inside a sub-folder (e.g. "Malachite Fusion/360/01.jpg") are 360° frames
        if (parts.length > 2) entry.frames.push({ file, url });
        else entry.files.push({ file, url });
    }

    const out = {};
    for (const [slug, { files, frames }] of Object.entries(raw)) {
        const slots = { front: null, front2oz: null, ingredients: null, description: null, spin: null };
        const unnamed = [];
        files.sort(byName).forEach((f) => {
            const role = roleOf(f.file);
            if (role && !slots[role]) slots[role] = f;
            else unnamed.push(f);
        });
        for (const role of UNNAMED_ORDER) {
            if (!slots[role] && unnamed.length) slots[role] = unnamed.shift();
        }
        out[slug] = {
            front: slots.front?.url || null,
            front2oz: slots.front2oz?.url || null,
            ingredients: slots.ingredients?.url || null,
            description: slots.description?.url || null,
            spin: frames.length > 1
                ? { type: "frames", frames: frames.sort(byName).map((f) => f.url) }
                : slots.spin
                ? { type: isVideo(slots.spin.file) ? "video" : "image", src: slots.spin.url }
                : null,
        };
    }
    return out;
})();

/**
 * The photos shown on a product's detail page, in order — for EVERY product:
 *   1. Front  — the front jar photo for the selected size ("2oz" uses the
 *              folder's "front 2oz" photo; 4 oz uses "front 4oz" / "front")
 *   2. Ingredients label
 *   3. Description label
 *   4. 360°   — the front photo turning round to show the back label
 *              (or your own 360 video / frames if a folder has one)
 * Combo (two-jar) photos are never used here.
 */
export function getProductViews(product, size = "4oz") {
    const media = MEDIA_BY_SLUG[product?.slug] || {};
    const front = (size === "2oz" && media.front2oz) || media.front || product?.gallery?.[0];
    const views = [{ role: "front", label: "Front", type: "image", src: front }];
    if (media.ingredients) views.push({ role: "ingredients", label: "Ingredients", type: "image", src: media.ingredients });
    if (media.description) views.push({ role: "description", label: "Description", type: "image", src: media.description });
    if (media.spin) {
        views.push({ role: "spin", label: "360°", ...media.spin });
    } else {
        views.push({
            role: "spin",
            label: "360°",
            type: "turntable",
            front,
            back: media.ingredients || media.description || front,
        });
    }
    return views;
}

/**
 * Back-label photos + 360° view for a product, found by its name (admin-added
 * products are matched to their folder in productdetailimages/ by name).
 * Returns { ingredients, description, spin } — any of them may be null.
 */
export function getProductMedia(name) {
    const slug = String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return MEDIA_BY_SLUG[slug] || {};
}

/** Cover photo for a product (its front jar photo for the given size). */
export const getProductCover = (product, size = "4oz") => getProductViews(product, size)[0].src;