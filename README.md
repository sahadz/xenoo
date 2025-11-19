# xenora — Next.js + Tailwind + Supabase (Starter) — Product Edit + Dark Mode

This repository is a mobile-first e-commerce starter built to your spec, now with:
- Dedicated Admin product editing page
- Dark mode across the site with a header toggle (persisted in localStorage)
- Framer Motion animations and Next.js image optimization retained

## How to use
1. Install dependencies:
```bash
npm install
```
2. Create Supabase project, `products` table (id, name, rate, sizes, description, image_url, created_at).
3. Create storage bucket `product_images`.
4. Add `.env.local` env vars:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_WHATSAPP_NUMBER=...
NEXT_PUBLIC_SITE_ORIGIN=...
```
5. Run `npm run dev`.

## Notes
- Admin edit page: `/admin/edit/[id]` (accessible from Admin list 'Edit' button).
- Dark mode toggle in header persists choice in localStorage.
- For production: add server-side admin route protection and input validation.
