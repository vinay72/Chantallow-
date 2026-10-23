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

import amberGlowCard from "../assets/product/new/1.png";
import amethystReliefCard from "../assets/product/new/2.png";
import jasperReviveCard from "../assets/product/new/3.png";
import malachiteFusionCard from "../assets/product/new/4.png";
import obsidianInfusionCard from "../assets/product/new/5.png";
import olivineReliefCard from "../assets/product/new/6.png";
import bareWhippedTallowCard from "../assets/product/new/7.png";
import talumaHairCareCard from "../assets/product/new/8.png";

import amberGlowJar from "../assets/beauty/amber-glow.jpg";
import amethystReliefJar from "../assets/beauty/amethyst-relief.jpg";
import jasperReviveJar from "../assets/beauty/jasper-revive.jpg";
import malachiteFusionJar from "../assets/beauty/malachite-fusion.jpg";
import olivineReliefJar from "../assets/beauty/olivine-relief.jpg";
import obsidianInfusionJar from "../assets/beauty/obsidian-infusion.jpg";
import talumaHairCareJar from "../assets/beauty/taluma-hair-care.jpg";
import bareWhippedTallowJar from "../assets/beauty/bare-whipped-tallow.jpg";

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
        subtitle: "1122+ MGO Manuka Honey + Lavender Infused Tallow",
        price: 80,
        oldPrice: 89,
        badge: "SALE 20% OFF",
        cardImage: amberGlowCard,
        gallery: [amberGlowJar, amberGlowCard],
        description: [
            "Amber Glow is an ultra-nourishing tallow crème crafted with grass-fed suet tallow, premium 1122+ MGO Manuka honey, organic lavender, royal jelly, bee pollen, pure honey, and jojoba oil. This luxurious blend provides intense hydration while helping maintain smooth, healthy-looking skin.",
            "Grass-fed tallow delivers skin-loving fatty acids and naturally occurring Vitamins A, D, E, and K that help support skin barrier function, improve moisture retention, and promote softness and elasticity.",
            "Premium Manuka honey is naturally rich in enzymes, amino acids, and antioxidants that help support skin hydration and maintain a balanced, healthy-looking complexion. Royal jelly contains beneficial proteins, B vitamins, amino acids, and minerals that help nourish and revitalize the skin. Bee pollen contributes antioxidants, vitamins, and trace minerals that support skin conditioning and environmental protection.",
            "Pure honey acts as a natural humectant, helping attract and retain moisture within the skin. Jojoba oil closely resembles the skin's natural sebum, helping provide lightweight hydration without feeling greasy while supporting moisture balance.",
            "Organic lavender offers calming botanical support while helping comfort dry, stressed skin. Vitamin A supports skin renewal, B-complex vitamins help maintain healthy skin function, Vitamin C supports collagen production and radiance, while Vitamin E helps protect against oxidative stress and moisture loss.",
            "Ideal for tattoo care, Amber Glow helps maintain softness, hydration, and the appearance of tattoo vibrancy while supporting healthy-looking skin during everyday tattoo maintenance.",
        ],
        ingredients: "Grass-Fed Suet Tallow, 1122+ MGO Manuka Honey, Organic Lavender, Royal Jelly, Bee Pollen, Pure Honey, Jojoba Oil",
        attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Dry skin"],
    },
    {
        id: 2,
        slug: "amethyst-relief",
        name: "Amethyst Relief",
        subtitle: "Lavender Infused & Whipped Tallow",
        price: 0,
        oldPrice: 0,
        cardImage: amethystReliefCard,
        gallery: [amethystReliefJar, amethystReliefCard],
        description: [
            "Amethyst Relief is a light, airy whipped tallow crème handcrafted to provide deep nourishment with a soothing botanical touch. Made with grass-fed, grass-finished beef tallow infused with organic lavender, this luxurious moisturizer melts effortlessly into the skin, leaving it feeling soft, hydrated, and comforted.",
            "Grass-fed tallow naturally contains fatty acids that closely resemble those found in healthy skin, helping support moisture retention, strengthen the skin barrier, and promote long-lasting softness. It is also naturally rich in Vitamins A, D, E, and K. Vitamin A helps support skin renewal and texture, Vitamin D supports skin barrier health, Vitamin E provides antioxidant protection, and Vitamin K helps maintain healthy-looking skin tone.",
            "Organic lavender is valued for its calming aroma and skin-conditioning properties. It helps soothe dry, irritated skin while contributing to a relaxing self-care experience.",
            "The whipped texture allows for easy absorption and comfortable daily use. Designed with tattoo care in mind, Amethyst Relief helps keep tattooed skin moisturized, smooth, and healthy-looking while supporting long-term softness and maintaining the appearance of vibrant, well-conditioned tattoos.",
        ],
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Organic Lavender",
        attributes: ["Skin Type: Dry", "Item Form: Whipped Cream", "Used For: Soothing"],
    },
    {
        id: 3,
        slug: "jasper-revive",
        name: "Jasper Revive",
        subtitle: "Coffee Infused Tallow",
        price: 0,
        oldPrice: 0,
        badge: "SALE 20% OFF",
        cardImage: jasperReviveCard,
        gallery: [jasperReviveJar, jasperReviveCard],
        description: [
            "Jasper Revive is a rich, handcrafted tallow crème infused with organic whole bean Colombian coffee to deeply nourish, hydrate, and revitalize the skin. Combining the nutrient-dense benefits of grass-fed tallow with the antioxidant-rich properties of coffee, this luxurious formula helps promote a refreshed, radiant appearance.",
            "Coffee naturally contains antioxidants and beneficial plant compounds that help protect the skin from environmental stressors while supporting smoother-looking skin texture and tone. The invigorating botanical profile of coffee helps leave skin looking refreshed and energized.",
            "Grass-fed tallow provides essential fatty acids and naturally occurring Vitamins A, D, E, and K. Vitamin A helps support healthy skin renewal, Vitamin D supports barrier function, Vitamin E provides antioxidant protection, and Vitamin K helps maintain overall skin vitality and appearance.",
            "Perfect for everyday skincare, Jasper Revive delivers lasting hydration and softness while leaving behind a warm, comforting coffee aroma. It is particularly beneficial for dry skin, rough areas, hands, elbows, and daily body care rituals.",
        ],
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Organic Whole Bean Colombian Coffee",
        attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Revitalizing"],
    },
    {
        id: 4,
        slug: "malachite-fusion",
        name: "Malachite Fusion",
        subtitle: "Moringa + Butterfly Pea Infused Tallow",
        price: 66,
        oldPrice: 89,
        badge: "SALE 20% OFF",
        cardImage: malachiteFusionCard,
        gallery: [malachiteFusionJar, malachiteFusionCard],
        description: [
            "Malachite Fusion is a luxurious botanical tallow crème crafted from grass-fed, grass-finished beef tallow infused with nutrient-rich moringa and butterfly pea flower. This deeply nourishing formula helps moisturize, soften, and support healthy-looking skin while promoting a radiant, revitalized complexion.",
            "Grass-fed tallow is naturally rich in skin-compatible fatty acids that help strengthen the skin barrier, lock in moisture, and improve softness and elasticity. It also naturally contains Vitamins A, D, E, and K. Vitamin A supports skin renewal and smoothness, Vitamin D helps support skin barrier function, Vitamin E provides antioxidant protection against environmental stressors, and Vitamin K helps maintain healthy-looking skin tone.",
            "Moringa is prized for its abundance of Vitamins A, C, and E, along with essential minerals and antioxidants. Vitamin C supports collagen production, helping improve the appearance of skin firmness and brightness, while Vitamins A and E help maintain hydration and protect against visible signs of dryness and environmental damage.",
            "Butterfly pea flower contributes powerful flavonoids and antioxidants that help defend the skin from oxidative stress while promoting a balanced, vibrant complexion. Rosemary provides additional antioxidant support, while frankincense and myrrh help soothe and condition the skin, supporting overall skin comfort and resilience.",
            "Specially formulated for tattoo care, Malachite Fusion helps keep tattooed skin deeply hydrated, supple, and vibrant-looking. Regular use helps support healthy skin, maintain moisture balance, and preserve the appearance of crisp, colorful tattoos.",
        ],
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Moringa, Butterfly Pea Flower, Rosemary, Frankincense, Myrrh",
        attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Hydration"],
    },
    {
        id: 5,
        slug: "obsidian-infusion",
        name: "Obsidian Infusion",
        subtitle: "Cacao Infused Tallow",
        price: 0,
        oldPrice: 0,
        cardImage: obsidianInfusionCard,
        gallery: [obsidianInfusionJar, obsidianInfusionCard],
        description: [
            "Obsidian Infusion is a decadent tallow crème infused with organic cacao nibs, cacao powder, and hazelnut ground coffee to provide rich nourishment and luxurious hydration. Crafted with grass-fed, grass-finished beef tallow, this indulgent formula helps support smooth, healthy-looking skin while delivering a comforting sensory experience.",
            "Cacao is naturally abundant in antioxidants, magnesium, iron, and beneficial plant compounds that help protect the skin from oxidative stress while promoting a radiant, youthful-looking complexion. These antioxidants help support smoother skin texture and improved overall skin appearance.",
            "Hazelnut coffee contributes additional antioxidant compounds while creating a rich, warm aroma that enhances the skincare experience. Grass-fed tallow provides fatty acids and Vitamins A, D, E, and K that help support moisture balance, skin barrier health, elasticity, and long-lasting hydration.",
            "Suitable for both face and body care, Obsidian Infusion leaves skin feeling deeply moisturized, conditioned, and velvety smooth while helping support a healthy, radiant complexion.",
        ],
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Organic Cacao Nibs, Organic Cacao Powder, Hazelnut Ground Coffee",
        attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Dry skin"],
    },
    {
        id: 6,
        slug: "olivine-relief",
        name: "Olivine Relief",
        subtitle: "Zechstein Magnesium + Arnica Tallow Balm",
        price: 0,
        oldPrice: 0,
        cardImage: olivineReliefCard,
        gallery: [olivineReliefJar, olivineReliefCard],
        description: [
            "Olivine Relief is a powerful restorative tallow balm designed to provide targeted comfort, deep nourishment, and intensive body care support. Crafted with grass-fed, grass-finished beef tallow and infused with Zechstein magnesium chloride, Arnica Montana, willow bark, lavender, frankincense, myrrh, and gingko biloba, this rich balm helps soothe, comfort, and revitalize both skin and body.",
            "Zechstein magnesium chloride is widely valued for helping support muscle relaxation, physical recovery, and overall body comfort. Arnica Montana has been traditionally used to help soothe areas of tension, soreness, and overworked muscles following physical activity.",
            "Willow bark naturally contains salicin compounds and has long been used in herbal wellness practices to support comfort and relaxation. Lavender provides calming botanical benefits for both skin and senses, while frankincense and myrrh help condition the skin and support overall skin health.",
            "Gingko biloba contributes antioxidant compounds that help support circulation and skin vitality. Grass-fed tallow provides nourishing fatty acids along with Vitamins A, D, E, and K to help maintain hydration, skin resilience, and moisture balance.",
            "Ideal for massage, post-workout recovery, daily body care, and areas needing extra comfort, Olivine Relief helps leave muscles feeling relaxed, skin deeply moisturized, and the body refreshed and restored.",
        ],
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Zechstein Magnesium Chloride, Arnica Montana, Willow Bark, Lavender, Frankincense, Myrrh, Ginkgo Biloba",
        attributes: ["Skin Type: All", "Item Form: Balm", "Used For: Muscle relief"],
    },
    {
        id: 7,
        slug: "taluma-hair-care",
        name: "Taluma Hair Care",
        subtitle: "Grass-Fed/Grass-Finished Beef Tallow, Raw Honduran Batana Oil",
        price: 0,
        oldPrice: 0,
        badge: "SALE 10% OFF",
        cardImage: talumaHairCareCard,
        gallery: [talumaHairCareJar, talumaHairCareCard],
        description:
            "Taluma Hair Care is a deeply nourishing blend crafted with grass-fed grass-finished beef tallow, raw Honduran Batana oil, rosemary, argan oil, castor oil, black seed oil, and black cumin seed oil to help restore moisture, strengthen hair, and promote a healthier-looking scalp. Grass-Fed Beef Tallow is naturally rich in Vitamins A, D, E & K, essential fatty acids, and skin-compatible lipids that deeply condition the scalp, help reduce dryness, support healthy follicles, and improve softness and shine. Raw Honduran Batana Oil contains Vitamin E, Omega-3, Omega-6 & Omega-9 fatty acids, helping nourish damaged hair, improve elasticity, reduce breakage, and restore the appearance of thicker, fuller hair. Rosemary is rich in antioxidants such as rosmarinic acid and carnosic acid, which help support a healthy scalp environment, reduce oxidative stress, and promote stronger-looking hair. Argan Oil provides Vitamin E, antioxidants, and essential fatty acids that help smooth frizz, repair dryness, improve shine, and protect hair from environmental damage. Castor Oil is naturally rich in ricinoleic acid, Vitamin E, and Omega-6 & Omega-9 fatty acids, helping lock in moisture, reduce split ends, and improve the appearance of stronger, healthier hair. Black Seed Oil and Black Cumin Seed Oil contain thymoquinone, Vitamin E, antioxidants, and essential fatty acids that help soothe the scalp, nourish hair roots, improve moisture retention, and support healthy hair growth.",
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
        subtitle: "Grass-Fed/Grass-Finished Beef Tallow, Organic Unrefined Jojoba Oil",
        price: 0,
        oldPrice: 0,
        badge: "SALE 10% OFF",
        cardImage: bareWhippedTallowCard,
        gallery: [bareWhippedTallowJar, bareWhippedTallowCard],
        description: [
            "Bare Whipped Tallow is a minimalist, deeply nourishing moisturizer crafted with only two skin-loving ingredients: grass-fed, grass-finished beef tallow and organic unrefined jojoba oil. Created for those who appreciate simple, nutrient-dense skincare, this balm helps replenish moisture, support skin health, and restore softness without the use of synthetic fragrances, preservatives, or fillers.",
            "Grass-fed beef tallow is naturally rich in Vitamins A, D, E, and K, as well as essential fatty acids that closely resemble the lipids found in healthy human skin. Vitamin A helps support skin renewal and promotes a smoother, healthier complexion. Vitamin D supports skin barrier function and overall skin resilience. Vitamin E acts as a powerful antioxidant that helps protect the skin from environmental stressors and supports moisture retention. Vitamin K contributes to overall skin health and appearance. The naturally occurring saturated and monounsaturated fats in tallow help soften rough, dry skin and lock in moisture without disrupting the skin's natural balance.",
            "Organic unrefined jojoba oil is highly compatible with the skin because its composition closely resembles human sebum. It is rich in Vitamin E, antioxidants, and nourishing fatty acids that help moisturize, soothe, and condition the skin without feeling greasy. Jojoba oil absorbs easily, helps maintain skin elasticity, and supports a healthy moisture barrier, making it suitable for delicate and sensitive skin. Free from fragrances, essential oils, preservatives, and unnecessary additives, Bare Whipped Tallow is ideal for daily skincare routines for all ages.",
        ],
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, Organic Unrefined Jojoba Oil",
        directions:
            "Apply a fingertip scoop of Bare Whipped Tallow to clean skin and gently massage until absorbed. Use on the face, hands, body, dry patches, elbows, knees, or any area needing extra moisture and nourishment. Apply daily or as needed as part of your regular skincare routine. Suitable for sensitive skin and safe for all ages, including babies. For external use only. Perform a patch test before first use. Store in a cool, dry place away from direct sunlight and excessive heat.",
        directionsNote: "Use within 12 months of opening for optimal freshness and performance.",
        attributes: ["Skin Type: Sensitive", "Item Form: Whipped Cream", "Used For: Everyday moisture"],
    },
];

export const getProductById = (id) => PRODUCTS.find((p) => p.id === Number(id));
export const getProductBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;