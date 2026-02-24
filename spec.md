# Specification

## Summary
**Goal:** Build a full-stack e-commerce app called "Solano7m" with a product catalog, shopping cart, checkout, and order history, backed by a Motoko actor on the Internet Computer.

**Planned changes:**

**Backend (single Motoko actor):**
- Product management: CRUD operations for products with fields (id, name, description, price, imageUrl, category, stock quantity), stable storage for upgrade persistence
- Shopping cart: per-user cart (keyed by principal) with add, update quantity, remove, and total calculation
- Order system: place order from cart, store order history (id, items, total, timestamp, status) per user, clear cart on order placement

**Frontend:**
- Product catalog page: responsive grid (2–4 columns), product cards with image/name/price/Add to Cart, category filter, search bar, visual add-to-cart confirmation
- Product detail page: full product info, stock-constrained quantity selector, Add to Cart button
- Shopping cart page: item list with quantity controls (increment/decrement/remove), line totals, grand total, "Proceed to Checkout" button
- Checkout page: order summary, "Place Order" button, success screen with order ID, navigation back to shop
- Order history page: authenticated-only, reverse-chronological list of past orders with date/items/total/status
- Global visual theme: warm earthy palette (deep terracotta, cream, charcoal), clean sans-serif typography, card-based layouts with hover effects, responsive on mobile and desktop
- Navbar with prominent "Solano7m" brand name and logo loaded from `/assets/generated/solano7m-logo.png`
- Hero banner on catalog page loaded from `/assets/generated/hero-banner.png`

**User-visible outcome:** Users can browse and search a product catalog, view product details, manage a shopping cart, place orders, and review their order history — all within a branded, modern "Solano7m" storefront.
