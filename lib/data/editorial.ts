export type EditorialArticle = {
  id: string;
  slug: string;
  category: string;
  title: string;
  readTime: string;
  date: string;
  summary: string;
  image: string;
};

export const EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    id: "art-1",
    slug: "principles-of-scandinavian-organization",
    category: "Design Philosophy",
    title: "The Architecture of Calm: 5 Principles for Intentional Living",
    readTime: "4 min read",
    date: "February 2026",
    summary:
      "How deliberate spatial breathing room and natural timber joinery soothe modern sensory overload in urban residences.",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "art-2",
    slug: "sculpting-with-indirect-light",
    category: "Atmospheric Lighting",
    title: "Sculpting with Dusk: The Art of 2700K Warm Ambient Illumination",
    readTime: "6 min read",
    date: "January 2026",
    summary:
      "Why low-glare luminaires, honed marble spheres, and brass reflectors transform evening routines into grounding rituals.",
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "art-3",
    slug: "quiet-workspace-rituals",
    category: "Workspace Harmony",
    title: "Quiet Focus: Structuring Desk Spaces for Sustained Creative Flow",
    readTime: "5 min read",
    date: "March 2026",
    summary:
      "Tactile wool felt, concealed wire routing channels, and ergonomic sightlines that eliminate cognitive friction.",
    image:
      "https://images.unsplash.com/photo-1581291518655-9523c932deb8?auto=format&fit=crop&w=1200&q=80",
  },
];

