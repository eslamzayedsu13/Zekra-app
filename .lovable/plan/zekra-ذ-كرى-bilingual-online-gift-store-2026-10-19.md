# Zekra (ذِكرى): Bilingual Online Gift Store

## Design direction

- Editorial, quiet luxury. Think of a printed stationery catalogue more than a template storefront.
- Palette: warm ivory background, charcoal text, dusty rose as the main accent, muted sage as the second accent, and thin hairline borders. No gradients and no frosted-glass effects. Corners are small (2–4px).
- Type: Cormorant Garamond for display headings and Manrope for body text in English. Arabic uses Amiri for headings and IBM Plex Sans Arabic for body text.
- Layouts are asymmetric and magazine-style. Section labels are numbered (01 / Collections), images have captions, and there is generous whitespace.
- Motion stays small: images fade in, underlines draw on links, and the cart drawer slides open.
- Product and editorial photos are generated in one consistent art direction: soft daylight, linen, dried flowers, ivory paper.

## Pages

- **Home:** split editorial hero, three curated collections ("For the Engagement", "Keepsakes", "Everyday Romance"), featured products, bestsellers, brand story, gifting promise, newsletter.
- **Shop:** category filters, price range, search, sorting (newest, price, bestselling). Filters are saved in the page link so they can be shared.
- **Product page:** image gallery with thumbnails, variants (colour, size, engraving text), quantity, add to cart, wishlist, related products.
- **Cart drawer and cart page:** quantity controls and remove buttons. Subtotal and shipping are shown in EGP.
- **Checkout:** contact, address (Egyptian governorates), shipping method, payment choice (cash on delivery now; Paymob/Fawry slots ready). Placing an order saves it as "Pending". There is no fake payment success screen.
- **Account:** sign in and sign up, profile, saved addresses, order history, order tracking timeline.
- **Wishlist page.**
- **Contact, FAQ, Shipping, Returns, About.** Each is its own page.
- **Admin dashboard** (admins only): overview stats, products (create, edit, stock, images), categories, orders (change status), customers.

## Language and currency

- Arabic is the default, with full right-to-left layout. English uses left-to-right. A switcher in the header changes the language, and the choice is remembered.
- All text lives in translation files. Product names and descriptions are stored in both languages.
- Prices are formatted for Egypt in each language, for example "١٬٢٥٠ ج.م" in Arabic and "EGP 1,250" in English.

## Sample catalogue

About 16 realistic products, priced roughly 350–4,500 EGP: engraved ring dish, couple's journal, custom star map print, pressed-flower frame, silk scrunchie set, scented candle duo, leather keepsake box, initial necklace, and more.

Additional requirements & implementation safeguards

&nbsp;

Design quality

&nbsp;

- Follow a true mobile-first approach. Prioritize the mobile shopping experience, with carefully optimized navigation, product grids, filters, cart interactions, and checkout.

- Preserve the editorial, quiet-luxury art direction across every page. Avoid generic AI storefront patterns, repetitive section layouts, excessive UI components, and unnecessary visual effects.

- Ensure consistent Arabic RTL and English LTR behavior across all pages, including forms, icons, drawers, tables, and product galleries.

&nbsp;

Security & data integrity

&nbsp;

- Enforce admin authorization on the server. Never allow users to grant themselves admin privileges through profile updates, registration, or client-side state.

- Apply appropriate Row Level Security (RLS) policies and database permissions to every table. Users must only access their own private data, while public product data remains publicly readable where appropriate.

- Validate all order inputs on the server, including product prices, variants, stock availability, quantities, shipping fees, and order totals.

- Prevent duplicate order submissions and handle concurrent stock updates safely. Never trust prices or totals supplied by the client.

&nbsp;

Gift personalization

&nbsp;

- Support product-specific customization where applicable, including engraving text, names or initials, gift wrapping, gift messages, and greeting cards.

- Clearly display selected customization options and any additional charges in the product page, cart, and final order summary.

&nbsp;

Payments & integrations

&nbsp;

- Cash on delivery must be the only active payment method initially.

- Keep Paymob, Fawry, and shipping-provider integrations modular and ready for future implementation, but do not present them as functional until properly integrated and tested.

- Never simulate successful payments, shipments, or external integrations.

&nbsp;

Testing & delivery

&nbsp;

- Implement real functionality rather than placeholder interfaces for core features.

- Test authentication, authorization, product management, inventory updates, cart calculations, checkout, order creation, wishlist persistence, language switching, and RTL/LTR layouts.

- Verify that critical database operations and security rules work correctly, fix errors before completion, and ensure all pages work on mobile and desktop.

- Build incrementally on the approved architecture. Keep the code clean, reusable, maintainable, and free from unnecessary dependencies or features.

- Preserve the approved visual direction and existing working functionality when making changes. Do not rewrite working components unnecessarily.

&nbsp;

Execution

&nbsp;

Proceed directly with implementation using the approved plan and these additional requirements. Make sensible decisions independently, prioritize design quality and functional correctness, and avoid unnecessary clarification questions.

## Technical details

- Lovable Cloud provides sign-in, the database, and image storage.
- Database tables: categories, products, product_variants, product_images, profiles, user_roles (admin role checked server-side), addresses, wishlists, orders, order_items, order_status_events. Every table has RLS and GRANTs. Sample rows are seeded in the migration.
- The cart lives on the device (localStorage) and syncs nothing until checkout. The wishlist is stored per user, with a local fallback for guests.
- Placing an order runs on the server: it checks prices and stock against the database and inserts the order. Payment is a provider adapter so Paymob or Fawry can plug in later. Shipping is a provider interface too, with flat rates for each governorate for now.
- A small context switches language and text direction (lang/dir on the html tag). Fonts are loaded in the root head. Design tokens use oklch in styles.css.
- Reusable pieces: ProductCard, Price, SectionHeader, Gallery, VariantPicker, QuantityStepper, Drawer, and an AdminTable family.
- Every page gets its own title and description. Tests cover price formatting, cart totals, and shipping fees.
