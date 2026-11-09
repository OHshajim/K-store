# Kstore — Premium Home & Living E-Commerce Platform

> **Modern Living, Simplified.**  
> A Scandinavian-inspired direct-to-consumer digital flagship developed for Strix Devs and designed as an international portfolio benchmark.

---

## 1. Overview & Brand Architecture

**Kstore** is a production-grade direct-to-consumer home and lifestyle web application. It specializes in modern home organization, functional furniture, and decorative ambient lighting. Built with a minimalist Scandinavian aesthetic, it targets homeowners, professionals, and design enthusiasts in the **United States**, **Canada**, and the **United Kingdom**.

### Design Language & System Tokens
- **Warm Ivory (`#F4F0E8`)**: Primary atmospheric canvas
- **Sand Beige (`#D8C9B5`)**: Secondary surfaces & subtle structural dividers
- **Charcoal (`#292B27`)**: High-contrast editorial typography and primary buttons
- **Sage Green (`#8A927A`)**: Curated accents, sustainability seals, and spatial badges
- **Muted Bronze (`#B78E69`)**: Precision highlights, star ratings, and savings tags
- **Pure White (`#FFFFFF`)**: Crisp product card planes
- **Secondary Text (`#77766E`)**: High-legibility supporting descriptions
- **Typography**: Cormorant Garamond (Editorial titles), Manrope (UI & navigation), Inter (Specifications & numerical data)

---

## 2. Core Capabilities

### A. Homepage (Strict Editorial Ordering)
1. **Announcement Bar**: "Complimentary shipping on orders over $150." with interactive currency selector (USD, CAD, GBP).
2. **Navigation System**:
   - Brand mark & tagline
   - Collections Mega Menu (6 spatial categories)
   - Shop by Room dropdown
   - NORDEN Fit Assistant interactive link
   - Instant live search modal with auto-suggest
   - Wishlist badge with persistent local state
   - Cart slide-over drawer with real-time shipping threshold tracker
   - Responsive mobile navigation drawer
3. **Hero Section**: Architectural landscape campaign: *"Make room for what matters."* with dual call-to-actions.
4. **Featured Collections**: 6 category cards (Living Room, Workspace, Kitchen, Bedroom, Bathroom, Lighting).
5. **Best Sellers**: Desired essentials with interactive color swatches, star ratings, wishlist toggling, and quick add-to-cart.
6. **Brand Story**: *"Designed with intention. Made for living."* — Craftsmanship manifesto and FSC timber ethics.
7. **Shop by Room**: Immersive visual collections across Living, Workspace, Kitchen, and Bedroom.
8. **Brand Benefits**: Thoughtful Design, Quality Materials, Functional Living, and Customer-First Experience.
9. **Editorial Inspiration**: *"The Art of Living Well"* magazine essays.
10. **Customer Reviews**: Testimonial showcase with clearly identified demonstration content.
11. **Newsletter**: *"Make room for inspiration."* with GDPR-compliant consent handling.
12. **Footer**: Complete international navigation, regional selector, warranty details, and legal links.

### B. Product Discovery & Filtering (`/shop`)
- Real-time instant search across titles, descriptions, and materials.
- 5 Sort Modes: Featured Picks, Best Selling, Newest, Price (Low to High), Price (High to Low).
- Multi-dimensional filters: Room atmosphere, core materials (Solid Oak, Aluminum, Ceramic, Glass, Teak), color finishes, price slider ($50–$750+), and in-stock toggles.
- Active filter pill badges with individual dismissal and "Clear All".

### C. Product Details Experience (`/product/[slug]`)
- High-resolution gallery with thumbnail selector and full-screen lightbox zoom.
- Color variant selection with live hex swatches.
- Material selection (Solid White Oak, Smoked Ash, American Walnut).
- Stock indicator with real-time low-stock warnings.
- Expandable accordion tabs:
  1. Dimensions & Specifications (exact cm/inches, net weight, origin, assembly)
  2. Materials & Craftsmanship
  3. Product Care & Longevity
  4. Delivery & 30-Day Returns
- Desktop sticky purchase bar that slides in on scroll.
- Verified customer review breakdown.
- Contextual related products.

### D. Special Feature: NORDEN Fit Assistant (`/fit-assistant`)
- A deterministic spatial matching engine:
  - Step 1: Room selection (Living, Workspace, Kitchen, Bedroom, Bathroom, Lighting)
  - Step 2: Available dimensions with unit toggle (cm vs inches)
  - Step 3: Preferred material, color palette, and target budget ceiling
  - Step 4: Real-time clearance calculation comparing product dimensions against user space, yielding match percentages, dimensional breathing room feedback, and direct add-to-cart buttons.

### E. Shopping Cart & Checkout
- **Cart Drawer & Dedicated Cart Page (`/cart`)**: Free shipping progress bar ($150 target), coupon code engine (`NORDEN10`, `WELCOME20`), line-item controls, and recommended upsells.
- **Multi-Step Checkout (`/checkout`)**:
  - Contact information (supports guest checkouts)
  - Shipping address with international region support
  - Delivery options (Standard Ground vs Express White-Glove)
  - Stripe card test payments & Cash on Delivery options
  - Server-side price recalculation (client prices are never trusted)

### F. Order Tracking & Customer Accounts
- **Order Tracking (`/track/[orderNumber]?t=[token]`)**: Capability token security allowing guests to track fulfillment stages without passwords.
- **Account Dashboard (`/account`, `/orders`)**: Order history, delivery event timeline, and personal profile management.
- **Wishlist (`/wishlist`)**: Saved items with "Move all to cart" action.

### G. Administrative Dashboard (`/admin`)
- Commercial KPI overview: Gross revenue, dispatched orders, active catalog size, low-stock alerts.
- Weekly sales trajectory visual trend graph.
- Top revenue-generating products table.
- Fulfillment management: update order status (`pending`, `confirmed`, `packed`, `out_for_delivery`, `delivered`) and record admin event notes.
- Product inventory management, review moderation, and store settings.

---

## 3. Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Engine**: React 19, TypeScript, Tailwind CSS
- **Design Components**: Astryx Design System + Shadcn patterns
- **State Management**: Zustand with persistent local storage
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS)
- **Payments**: Stripe Test Mode + resilient server-side fallback simulator
- **Icons**: Lucide React & Heroicons

---

## 4. Local Setup & Execution

### Prerequisites
- Node.js 20+ or Bun 1.2+

### 1. Install & Verify
```bash
bun install
# or
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
bun run dev
# or
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Database Setup (Supabase)
To connect a live Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/20261110000000_kstore_full.sql` in the SQL Editor.
3. Insert credentials into `.env.local`.
*(Note: If Supabase credentials are not supplied, Kstore automatically utilizes its resilient in-memory demonstration layer, ensuring all 30 products, fit calculations, search queries, cart, and checkouts function immediately out of the box).*

---

## 5. Verification & Testing

Verify TypeScript integrity:
```bash
bun x tsc --noEmit
```

Build production bundle:
```bash
bun run build
```

---

## 6. Portfolio & Evaluation Summary

Designed and engineered for **Strix Devs** as an international commercial flagship, Kstore demonstrates full-stack software architecture, accessible responsive design, deterministic spatial algorithms, and robust Scandinavian design aesthetics.
