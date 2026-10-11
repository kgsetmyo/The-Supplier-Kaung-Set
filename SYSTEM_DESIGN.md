# The supplier Kaung Set — System Design (shareable overview)

**What this is:** A short explanation of how the online store works, so you can understand the big picture without digging through code.

**Live site:** Hosted on **Vercel** (e.g. `the-supplier-kaung-set.vercel.app` or your custom `.com` domain)  
**Database & login:** **Supabase**  
**Languages:** English + Myanmar (`/en/...` and `/mm/...`)

---

## 1. What the system does

This is an ecommerce website where:

- Customers browse products, add to cart, and checkout (with or without an account)
- Customers can track orders, use wishlists, and earn **loyalty ranks** from spending
- Admins manage inventory, orders, payments, categories, coupons, and loyalty discounts
- Payments support **KBZ Pay** (full/half) with receipt upload for verification

---

## 2. Big picture (how pieces connect)

```
Customer / Admin browser
        │
        ▼
   Vercel (Next.js website)
   - Pages (shop + admin)
   - Login / security checks
   - Checkout logic
        │
        ▼
   Supabase
   - User accounts (Auth)
   - Products, orders, loyalty (Database)
   - Photos / payment receipts (Storage)
        │
        ├── Resend → email (signup / order emails)
        ├── Discord → product requests & bug reports
        ├── Google Analytics → admin traffic stats
        └── WhatsApp → contact link
```

**Simple rule:**  
The website runs on **Vercel**. All important data lives in **Supabase**.

---

## 3. For customers (storefront)

| Feature | What it means |
|--------|----------------|
| Shop / search / categories | Browse products (nested categories, authenticity: Genuine / OEM / Replica) |
| Cart | Items saved in the browser; signed-in users can sync a saved cart |
| Checkout | Guest **or** logged-in; creates an order + tracking number |
| Payments | KBZ channels + full/half plan; upload payment screenshot when needed |
| Track order | Enter tracking number to see status |
| Account | Profile, order history, wishlist, loyalty card |
| Loyalty | Rank based on **lifetime spend**; discount % can apply to selected categories |
| Support | Request a product, report a bug, newsletter, FAQ, contact |

---

## 4. For admins (back office)

Open `/admin` after logging in with an allowed admin email (and/or admin role in the database).

| Section | Purpose |
|--------|---------|
| Inventory | Add / edit / delete (or unlist) products |
| Categories | Category tree + emoji icons |
| Orders | Confirm payments, update status, shipping / tracking |
| Loyalty | Spend thresholds, discount %, eligible categories |
| Coupons | Promo codes |
| Marketing / abandoned carts | Follow up with shoppers |
| Product requests / bugs | Customer submissions (+ Discord alerts) |
| Overview | Quick stats + GA4 traffic (if configured) |

**Important:**  
Being able to open the admin pages (`ADMIN_EMAIL`) is not always enough for every database write. Some actions also need `profiles.role = admin` in Supabase.

---

## 5. Loyalty (rank + discount) — how it works

1. Customer’s **lifetime spend** increases when an order is marked **delivered**
2. Rank is chosen by comparing spend to admin **spend thresholds** (Member, VIP, Elite, …)
3. That rank’s **Discount %** applies on the shop
4. **Eligible categories** for that rank control *where* the discount works  
   - Empty categories = discount on **all** products  
   - Selected category (e.g. Beauty) = discount only there (including subcategories)

Example: Elite = 1% on Beauty → every Elite-ranked shopper gets 1% off Beauty products.

---

## 6. Orders & payments — flow

```
Cart → Checkout form
         │
         ▼
   Create order in database
   (guest checkout uses a secure database function)
         │
         ├── COD-style / pending payment
         └── KBZ: upload receipt + optional reference
         │
         ▼
   Admin verifies payment / updates status
         │
         ▼
   Shipping + tracking number
         │
         ▼
   Delivered → loyalty spend updates
```

Guests can checkout **without** creating an account. They get a **tracking number** to follow the order.

---

## 7. Products & images

- Product info is stored in the **database**
- Image fields store **public URLs** (Supabase Storage recommended; Google Drive links are unreliable)
- If a product was already used in past orders, Delete will **unlist** it (hide from shop) instead of permanently removing it — so order history stays intact

---

## 8. Security (short version)

- Customers only see public catalog data and their own account data
- Admins can manage store data
- Database rules (RLS) enforce who can read/write what
- Secrets (Discord webhooks, email API keys, etc.) stay in environment variables — not in public code

---

## 9. What is *not* the live store

| Option | Role |
|--------|------|
| **Vercel** | Real production website |
| **GitHub** | Code history + CI build check |
| **GitHub Pages** | Not used for this store (static hosting can’t run checkout/login properly) |

---

## 10. Typical “ops checklist” for the family

1. Keep **one Supabase project** for production (don’t mix project URLs/keys)
2. Put the same Supabase URL/key and `ADMIN_EMAIL` in **Vercel** env settings
3. Run new SQL migration files in Supabase when the developer sends them
4. After code changes: wait for Vercel deploy = **Ready**, then hard-refresh the site
5. Promote admin in Supabase if login works but saving products fails (role = admin)

---

## 11. One-sentence summary

**Shoppers buy on a bilingual Next.js storefront; Supabase stores accounts, catalog, and orders; Vercel hosts the site; admins run inventory, payments, shipping, and loyalty from `/admin`.**

---

*Document generated for sharing. Technical details live in the project repo (`Website supplier` / `The-Supplier-Kaung-Set`).*
