# SkinVault Beauty

Premium authentic skincare e-commerce platform — 100% authentic products for all skin types, from the world's best skincare brands.

## Tech Stack

- **Framework** — Next.js 16 (App Router, TypeScript)
- **3D Animations** — Three.js r181 with custom WebGL GLSL shaders
- **Scroll Animations** — GSAP + ScrollTrigger
- **Database & Auth** — Supabase (Postgres + Row Level Security)
- **Product Images** — Cloudinary CDN
- **Payments** — Paystack
- **Deployment** — Vercel

## Getting Started

```bash
npm install
npm run dev        # → http://localhost:3007
```

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
```

## Project Structure

```
skinvault-beauty/
├── app/
│   ├── page.tsx              # Home — hero + products + 3D sphere
│   ├── shop/                 # All products catalogue
│   ├── science/              # Ingredients & science page
│   ├── about/                # Brand story
│   ├── faq/                  # FAQ accordion + sphere
│   ├── products/[id]/        # Product detail page
│   └── account/              # Auth (login, register, dashboard)
├── components/
│   ├── GlassSphere/          # WebGL glass bubble (Three.js)
│   ├── Navigation/           # Fixed header
│   ├── PageLoader/           # Full-screen sphere transition
│   ├── ProductGrid/          # Product card grid
│   ├── PhilosophySection/    # Brand pillars + sphere
│   ├── StepsSection/         # Sticky scroll with sphere
│   └── Footer/               # Newsletter + links
├── lib/
│   └── SphereRenderer.ts     # Three.js WebGL engine
└── public/
    └── logo.svg
```

## Database (Supabase)

Tables: `profiles`, `products`, `brands`, `categories`, `orders`, `order_items`, `cart_items`, `reviews`, `wishlist`

All tables use Row Level Security (RLS).

## Features

- WebGL 3D glass bubble — custom GLSL Fresnel + cubemap shaders
- GSAP scroll-driven sphere animations
- 50–60 authentic skincare products across multiple brands
- Supabase auth (email/password + OAuth) with RLS
- Paystack checkout (card, bank transfer, USSD)
- Cloudinary product image CDN with auto-optimization
- Fully responsive — mobile first
