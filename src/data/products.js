// src/data/products.js
// Single source of truth for every product. Home cards, the product detail
// page, the cart and the wishlist all look products up from here by id/slug.

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

// NOTE: price / oldPrice are placeholders (0). Put your real prices here and
// every page (cards, detail, cart totals) updates automatically.
export const PRODUCTS = [
    {
        id: 1,
        slug: "amber-glow",
        name: "Amber Glow",
        subtitle: "Manuka + Lavender",
        price: 0,
        oldPrice: 0,
        badge: "SALE 20% OFF",
        cardImage: amberGlowCard,
        gallery: [amberGlowJar, amberGlowCard],
        description: skinDescription("manuka and lavender"),
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow infused with Manuka and Lavender",
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
        description: skinDescription("calming lavender"),
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow infused with Lavender, whipped",
        attributes: ["Skin Type: Dry", "Item Form: Whipped Cream", "Used For: Soothing"],
    },
    {
        id: 3,
        slug: "jasper-revive",
        name: "Jasper Revive",
        subtitle: "Coffee Infused Tallow",
        price: 0,
        oldPrice: 0,
        badge: "FEATURED",
        cardImage: jasperReviveCard,
        gallery: [jasperReviveJar, jasperReviveCard],
        description: skinDescription("coffee"),
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow infused with Coffee",
        attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Revitalizing"],
    },
    {
        id: 4,
        slug: "malachite-fusion",
        name: "Malachite Fusion",
        subtitle: "Moringa + Butterfly Pea",
        price: 0,
        oldPrice: 0,
        badge: "SALE 20% OFF",
        cardImage: malachiteFusionCard,
        gallery: [malachiteFusionJar, malachiteFusionCard],
        description: skinDescription("botanical herbs"),
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow infused with Moringa",
        attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Hydration"],
    },
    {
        id: 5,
        slug: "obsidian-infusion",
        name: "Obsidian Infusion",
        subtitle: "Cacao + Hazelnut Ground Coffee",
        price: 0,
        oldPrice: 0,
        cardImage: obsidianInfusionCard,
        gallery: [obsidianInfusionJar, obsidianInfusionCard],
        description: skinDescription("cacao and hazelnut ground coffee"),
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow infused with Cacao and Hazelnut Ground Coffee",
        attributes: ["Skin Type: Dry", "Item Form: Cream", "Used For: Dry skin"],
    },
    {
        id: 6,
        slug: "olivine-relief",
        name: "Olivine Relief",
        subtitle: "Zechstein Magnesium + Arnica",
        price: 0,
        oldPrice: 0,
        cardImage: olivineReliefCard,
        gallery: [olivineReliefJar, olivineReliefCard],
        description: skinDescription("Zechstein magnesium and arnica"),
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow infused with Zechstein Magnesium and Arnica",
        attributes: ["Skin Type: All", "Item Form: Balm", "Used For: Muscle relief"],
    },
    {
        id: 7,
        slug: "taluma-hair-care",
        name: "Taluma Hair Care",
        subtitle: "Rosemary + Batana + Black Seed",
        price: 0,
        oldPrice: 0,
        cardImage: talumaHairCareCard,
        gallery: [talumaHairCareJar, talumaHairCareCard],
        description:
            "A strengthening tallow hair treatment infused with rosemary, batana and black seed to nourish the scalp and help repair dry, brittle hair.",
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow infused with Rosemary, Batana and Black Seed",
        attributes: ["Hair Type: All", "Item Form: Balm", "Used For: Strengthen & repair"],
    },
    {
        id: 8,
        slug: "bare-whipped-tallow",
        name: "Bare Whipped Tallow",
        subtitle: "Pure Whipped Tallow",
        price: 0,
        oldPrice: 0,
        cardImage: bareWhippedTallowCard,
        gallery: [bareWhippedTallowJar, bareWhippedTallowCard],
        description: skinDescription(""),
        ingredients: "Grass-Fed/Grass-Finished Beef Tallow, whipped",
        attributes: ["Skin Type: Sensitive", "Item Form: Whipped Cream", "Used For: Everyday moisture"],
    },
];

export const getProductById = (id) => PRODUCTS.find((p) => p.id === Number(id));
export const getProductBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
export const formatPrice = (value) => `$${Number(value || 0).toFixed(2)}`;