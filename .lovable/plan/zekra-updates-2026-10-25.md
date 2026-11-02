# Zekra updates

Rules for the whole task:

- Do NOT generate any images. Use simple CSS/gradients or placeholders; I'll add real images myself.

- Do NOT write or run tests. Make only the changes requested, and don't re-verify or rework them.

- Work in the order below. Don't touch anything outside each item's scope.

&nbsp;

## 1. Remove customer accounts (guest-only store)

- Remove customer sign-up/sign-in everywhere: customer auth pages, header account icon, side-menu Account row, any "sign in to continue" gate, email-confirmation notices. Do NOT enable auto-confirm (not needed anymore).

- Keep a hidden admin-only login at /admin (not linked from the public UI) so admins can manage orders. Admin role is checked server-side (RLS / roles table).

- Wishlist: keep it in localStorage (no account needed).

- Existing users and orders stay in the database untouched.

&nbsp;

## 2. Guest checkout (fix checkout not completing)

- Fields: name, phone, governorate/city, address, notes. No account required.

- Server logs show no failed orders, so the request likely never fires (button disabled silently). Reproduce first and add temporary console logging to confirm the cause.

- Phone: convert Arabic/Persian digits to Latin, strip spaces/dashes and +20/0020, validate as an Egyptian mobile (01[0125] + 8 digits). Same digit conversion for every numeric field.

- Never disable "Place order" because of validation. On tap: inline error under each invalid field, scroll to and focus the first one. Disable only while submitting (no double orders). Show server errors clearly.

- Create the order through a server function/RPC (not a public table write): re-validate server-side, generate a short readable order code (e.g. ZK-4821) and an unguessable tracking token, return both.

- Save code + token in localStorage ("recent orders on this device").

- Done when: order placed, redirected to the success page, cart cleared.

&nbsp;

## 3. Order success + order tracking

Success page `/order/$code` (token in the URL):

- Check animation, "تم استلام طلبك" headline, order code with a copy button, order summary, expected delivery line, WhatsApp contact button. The tracker sits right below.

&nbsp;

Tracker (stepper like big stores):

- 4 stages, each with an icon, title, one short line, and the time it was reached:

  1. وصلنا طلبك — "استلمنا طلبك وهنتواصل معاك لو احتجنا أي حاجة."

  2. بنجهّز طلبك — "بنحفّر وبنجهّز قطعتك بكل عناية."

  3. الطلب في الطريق — "المندوب خرج بيه وجاي لحد عندك، جهّز المبلغ عند الاستلام."

  4. اتسلّم — "الطلب وصلك، نتمنى يعجبك!"

- Completed = filled rose circle with a check; current = soft pulsing ring; upcoming = muted. The line between stages fills as progress moves. Vertical timeline on phones, horizontal on desktop. A clear "cancelled" state. English copy for EN.

- Public page `/track`, linked from the side menu: form with order code + phone number, showing the same tracker. Also a "recent orders on this device" list from localStorage.

- Security: no public SELECT on the orders table. Lookup goes through a server function/RPC that needs (code + token) or (code + phone) and returns only status, stage times, item names and city. Rate-limit it. Wrong input gives a generic error: "مش لاقيين الطلب، راجع الرقم وجرّب تاني".

- Data: `orders.status` (received, preparing, shipped, delivered, cancelled) + `order_status_history(order_id, status, created_at)`. When an admin changes the status in the admin orders page, a history row is written automatically. The tracker refreshes every ~30s.

&nbsp;

## 4. Branded page loader

- New `PageLoader`: the ZEKRA wordmark (Cormorant Garamond, wide tracking) on ivory, with the rose accent line drawing in a loop and a soft letter fade. Separate from the opening splash.

- Used for navigation between pages, product pages, any page waiting on data, and Suspense fallbacks (use the router's pending state).

- Behavior: appears only if loading takes over ~250ms (no flicker), stays at least ~400ms once shown, fades out when the page is ready (no layout jump). Plus a thin rose progress bar at the top for fast navigations.

- Reduced motion: static wordmark, no animation.

&nbsp;

## 5. Mobile header

- Replace the search icon with a language pill (globe + "EN"/"ع"), thin border, 44px min tap target, aria-label.

- ~150ms fade on toggle, no layout shift. Save the choice and update `<html lang dir>`. Use logical properties (start/end) for RTL. Search moves into the side menu.

&nbsp;

## 6. Mobile side menu

- Use the existing Sheet component (focus trap, scroll lock, Esc). Opens from the start side; closes on route change.

- Header: logo + close. Search field (goes to shop search).

- Large numbered links (01 Shop, 02 Story, 03 Contact) with fine dividers. Category chips.

- Icon rows: Track order (replaces Account), Wishlist, Bag (count badge). Admin row only when an admin session exists.

- Footer: AR | EN segmented toggle + contact info. Safe-area bottom padding.

- Staggered slide-in of links.

&nbsp;

## 7. Home page (quiet luxury)

- Hero: full-width image, big headline, one short line, two buttons. Line-by-line reveal + slow image zoom (transform only). Hero image: WebP, explicit width/height, high priority, no lazy-load.

- Brand-promise marquee (engraving, delivery across Egypt, cash on delivery): pauses on hover, flips direction in RTL, duplicate copy aria-hidden.

- Collections: 3 equal cards (stacked on phones). Featured products: 2 cols phone / 4 desktop, same image ratio, skeletons while loading.

- Story: image beside text. Then Bestsellers, then "How it works" (Choose, Engrave, Delivered).

- `Reveal` component: IntersectionObserver, fade + rise once, then unobserve. Respect `prefers-reduced-motion`. Content stays visible if JS fails.

- Never apply letter-spacing to Arabic text (it breaks letter joining).

&nbsp;

## 8. Toasts

- `Toaster position="top-center"` in `__root.tsx`, offset below the header and safe area. Errors stay a bit longer.

&nbsp;

## 9. Wordmark + splash

- "ZEKRA" in Cormorant Garamond (preload, `font-display: swap`), wide tracking, small rose accent line, in both languages.

- Splash: ivory full-screen layer, letters appear one by one, line draws, then fade out (~1.6s). Once per session via `sessionStorage` inside `useEffect`. Skipped for reduced motion and on /checkout, /order, /track. Must not block the page underneath.

&nbsp;

## Technical notes

- Phone normalizer in `src/lib/format.ts`; checkout errors via dict keys (ar/en).

- New: `PageLoader.tsx`, `Splash.tsx`, `Reveal`, `OrderTracker.tsx`, routes `/track` and `/order/$code`, order-create and order-lookup server functions, `order_status_history` migration.

- `Header.tsx` rework; keyframes in `styles.css`; new ar/en dict keys.
