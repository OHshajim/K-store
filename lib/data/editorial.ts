export type EditorialArticle = {
  id: string;
  slug: string;
  category: string;
  title: string;
  readTime: string;
  date: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  summary: string;
  image: string;
  content: string[];
  keyTakeaways: string[];
  relatedProductSlugs: string[];
};

export const EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    id: "art-1",
    slug: "principles-of-scandinavian-organization",
    category: "Design Philosophy",
    title: "The Architecture of Calm: 5 Principles for Intentional Living",
    readTime: "5 min read",
    date: "February 2026",
    author: {
      name: "Henrik Lindqvist",
      role: "Principal Architectural Curator",
    },
    summary:
      "How deliberate spatial breathing room and natural timber joinery soothe modern sensory overload in urban residences.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    keyTakeaways: [
      "Keep at least 30% of horizontal surface planes unoccupied to allow visual stillness.",
      "Anchor living spaces with kiln-dried solid timber that develops an organic patina over decades.",
      "Conceal electronic power lines and utility cables within dedicated millwork raceways.",
      "Prioritize multi-generational furniture pieces over disposable trend-driven decor.",
      "Group decorative objects in asymmetric odd-numbered clusters with unified natural textures.",
    ],
    content: [
      "The contemporary home is frequently besieged by sensory friction: flashing digital screens, tangled utility cords, and visual clutter that commands our cognitive bandwidth long after the workday has concluded. In traditional Scandinavian craft, architecture begins with subtraction.",
      "When we remove extraneous ornamentation and permit raw materials—solid quarter-sawn white oak, unlacquered brass, and tactile linen—to speak for themselves, an organic calm settles over the dwelling. This is not austere deprivation, but rather deliberate spatial reverence.",
      "A well-designed room must breathe. By leaving at least one third of every shelf and credenza plane entirely unoccupied, light is permitted to cast soft diagonal shadows that change character throughout the day.",
      "Furthermore, functional storage must never feel clinical. Concealed joinery, integrated finger-pull grooves, and soft-closing dampers ensure that the physical act of putting an object away feels like a quiet closing ritual rather than a chore.",
      "As you curate your own sanctuary, remember that the goal is not perfection, but harmony. Choose objects that reward touch, celebrate natural material variance, and will still feel grounded and timeless twenty years from this moment.",
    ],
    relatedProductSlugs: [
      "modular-storage-shelf",
      "minimalist-side-table",
      "countertop-organizer",
    ],
  },
  {
    id: "art-2",
    slug: "sculpting-with-indirect-light",
    category: "Atmospheric Lighting",
    title: "Sculpting with Dusk: The Art of 2700K Warm Ambient Illumination",
    readTime: "6 min read",
    date: "January 2026",
    author: {
      name: "Astrid Lindgren",
      role: "Lead Luminaire Architect",
    },
    summary:
      "Why low-glare luminaires, honed marble spheres, and brass reflectors transform evening routines into grounding rituals.",
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
    keyTakeaways: [
      "Avoid single overhead central downlights; layer light across high, mid, and low elevations.",
      "Select color temperatures strictly between 2400K and 2700K for domestic living spaces.",
      "Use diffuse, bead-blasted shades that obscure direct bulb filament glare.",
      "Place portable ambient luminaires near reflective stone or matte plaster walls to soften luminance.",
    ],
    content: [
      "In Nordic winters, sunlight is a precious, fleeting guest that rarely rises high into the sky. This environmental scarcity gave birth to a profound sensitivity toward artificial illumination. Light is never merely functional; it is the emotional hearth of the space.",
      "The most common lighting error in modern interior design is over-reliance on aggressive, ceiling-mounted downlights. A central spotlight floods the room with flat, unflattering brightness that signals daylight alertness to the brain and destroys intimacy.",
      "To craft genuine sanctuary, light must be layered at varied elevations: a low mushroom table lamp on a timber sideboard, a concealed warm wash behind open shelving, and a slender reading lamp angled beside an armchair.",
      "When specifying luminaires, prioritize 2700 Kelvin warm-white illumination with a high Color Rendering Index (CRI > 90). The resulting glow brings out the rich amber undertones in oak woodwork and imparts a restful, candlelit ambiance to dusk conversations.",
    ],
    relatedProductSlugs: [
      "ambient-floor-lamp",
      "minimalist-desk-lamp",
    ],
  },
  {
    id: "art-3",
    slug: "quiet-workspace-rituals",
    category: "Workspace Harmony",
    title: "Quiet Focus: Structuring Desk Spaces for Sustained Creative Flow",
    readTime: "5 min read",
    date: "March 2026",
    author: {
      name: "Soren Kierk",
      role: "Ergonomics & Studio Specialist",
    },
    summary:
      "Tactile wool felt, concealed wire routing channels, and ergonomic sightlines that eliminate cognitive friction.",
    image:
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
    keyTakeaways: [
      "Elevate your primary monitor to eye level to prevent cervical spine curvature.",
      "Route all charging and peripheral cables beneath the timber desktop using anodized clamps.",
      "Incorporate acoustic absorbing elements like 100% merino wool desk mats.",
      "Limit desk-top items to the three tools required for the current working block.",
    ],
    content: [
      "The modern workspace is rarely an isolated physical cubicle; it is integrated directly into the rhythm of our living environments. When our desk becomes a visual tangle of cables, paper receipts, and misplaced pens, that mental noise bleeds effortlessly into the rest of the home.",
      "Creating an intentional desk space begins with material boundaries. A precision-cut felt mat establishes a dedicated tactile zone for keyboard and mouse, dampening hollow desk resonance and providing warmth against the palms.",
      "Monitor elevation is equally vital. By lifting displays onto a solid timber stand with integrated slide-under keyboard clearance, you restore valuable desk real estate while establishing healthy spinal alignment.",
      "At the conclusion of each day, execute a two-minute closing ritual: dock peripherals, return pens to their turned timber tray, and leave the workspace clear. Tomorrow's creative focus begins the moment you step up to an uncluttered desk.",
    ],
    relatedProductSlugs: [
      "oak-desk-organizer",
      "minimalist-desk-lamp",
    ],
  },
];

let inMemoryArticles = [...EDITORIAL_ARTICLES];

export async function getArticles(): Promise<EditorialArticle[]> {
  return inMemoryArticles;
}

export async function getArticleBySlug(slug: string): Promise<EditorialArticle | null> {
  return inMemoryArticles.find((a) => a.slug === slug) ?? null;
}

export async function saveArticle(article: Partial<EditorialArticle> & { title: string }): Promise<EditorialArticle> {
  const existingIndex = inMemoryArticles.findIndex(
    (a) => (article.id && a.id === article.id) || (article.slug && a.slug === article.slug)
  );

  if (existingIndex !== -1) {
    const updated: EditorialArticle = {
      ...inMemoryArticles[existingIndex],
      ...article,
      slug: article.slug || inMemoryArticles[existingIndex].slug,
    };
    inMemoryArticles[existingIndex] = updated;
    return updated;
  }

  const slug =
    article.slug ||
    article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const newArt: EditorialArticle = {
    id: article.id || `art-${Date.now()}`,
    slug,
    category: article.category || "Design Philosophy",
    title: article.title,
    readTime: article.readTime || "4 min read",
    date: article.date || "November 2026",
    author: article.author || {
      name: "Studio Editorial Team",
      role: "Design Curator",
    },
    summary: article.summary || "",
    image:
      article.image ||
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
    content: article.content || [article.summary || ""],
    keyTakeaways: article.keyTakeaways || [],
    relatedProductSlugs: article.relatedProductSlugs || [],
  };

  inMemoryArticles.unshift(newArt);
  return newArt;
}

export async function deleteArticle(id: string): Promise<boolean> {
  inMemoryArticles = inMemoryArticles.filter((a) => a.id !== id && a.slug !== id);
  return true;
}
